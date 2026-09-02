import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import tls from 'node:tls';
import { AndroidRemote, RemoteKeyCode, RemoteDirection } from 'androidtv-remote';
import { PairingManager } from 'androidtv-remote/dist/pairing/PairingManager.js';
import { RemoteManager } from 'androidtv-remote/dist/remote/RemoteManager.js';
import { pairingMessageManager } from 'androidtv-remote/dist/pairing/PairingMessageManager.js';
import { remoteMessageManager } from 'androidtv-remote/dist/remote/RemoteMessageManager.js';
import CryptoJS from 'crypto-js';
import type { RemoteCommand } from './types';

// --- BUN COMPATIBILITY PATCH FOR PAIRINGMANAGER ---
// Bun TLS implementation does not support client.getCertificate() and returns raw DER in getPeerCertificate().
(PairingManager.prototype as any).sendCode = function (code: string) {
  console.log(`[PairingManager] Patched sendCode executing with PIN: "${code}"`);
  const code_bytes = this.hexStringToBytes(code);

  let clientModulusHex = '';
  let clientExponentHex = '';

  // 1. Extract Client Certificate Modulus & Exponent from this.certs (PEM)
  if (this.certs && this.certs.cert) {
    try {
      const clientX509 = new crypto.X509Certificate(this.certs.cert);
      const clientJwk: any = clientX509.publicKey.export({ format: 'jwk' });
      clientModulusHex = Buffer.from(clientJwk.n, 'base64url').toString('hex').toUpperCase();
      clientExponentHex = Buffer.from(clientJwk.e, 'base64url').toString('hex');
      if (clientExponentHex.length % 2 !== 0) clientExponentHex = '0' + clientExponentHex;
    } catch (err) {
      console.warn('[PairingManager] Falling back to forge for client cert:', err);
      const forgeCert = forge.pki.certificateFromPem(this.certs.cert);
      clientModulusHex = forgeCert.publicKey.n.toString(16).toUpperCase();
      clientExponentHex = '0' + forgeCert.publicKey.e.toString(16);
    }
  }

  // 2. Extract Server Certificate Modulus & Exponent from peer certificate raw DER
  let serverModulusHex = '';
  let serverExponentHex = '';

  try {
    const peerCert = this.client.getPeerCertificate(true);
    if (peerCert && peerCert.raw) {
      const serverX509 = new crypto.X509Certificate(peerCert.raw);
      const serverJwk: any = serverX509.publicKey.export({ format: 'jwk' });
      serverModulusHex = Buffer.from(serverJwk.n, 'base64url').toString('hex').toUpperCase();
      serverExponentHex = Buffer.from(serverJwk.e, 'base64url').toString('hex');
      if (serverExponentHex.length % 2 !== 0) serverExponentHex = '0' + serverExponentHex;
    } else if (peerCert && peerCert.modulus) {
      serverModulusHex = peerCert.modulus;
      serverExponentHex = peerCert.exponent.startsWith('0x')
        ? '0' + peerCert.exponent.slice(2)
        : '0' + peerCert.exponent;
    }
  } catch (err) {
    console.error('[PairingManager] Error extracting server peer certificate:', err);
  }

  console.log(`[PairingManager] Client Modulus Len: ${clientModulusHex.length}, Server Modulus Len: ${serverModulusHex.length}`);

  const sha256 = (CryptoJS.algo.SHA256 as any).create();

  sha256.update(CryptoJS.enc.Hex.parse(clientModulusHex));
  sha256.update(CryptoJS.enc.Hex.parse(clientExponentHex));
  sha256.update(CryptoJS.enc.Hex.parse(serverModulusHex));
  sha256.update(CryptoJS.enc.Hex.parse(serverExponentHex));
  sha256.update(CryptoJS.enc.Hex.parse(code.slice(2)));

  const hash = sha256.finalize();
  const hash_array = this.hexStringToBytes(hash.toString());
  const check = hash_array[0];

  console.log(`[PairingManager] Check comparison: check=${check}, code_bytes[0]=${code_bytes[0]}`);

  if (check !== code_bytes[0]) {
    console.warn('[PairingManager] PIN check mismatch! TV might have generated a new PIN.');
    this.client.destroy(new Error('Bad Code'));
    return false;
  } else {
    console.log('[PairingManager] PIN verification MATCHED! Sending createPairingSecret payload...');
    const secretMsg = (pairingMessageManager as any).createPairingSecret(hash_array);
    this.client.write(secretMsg);
    return true;
  }
};

// --- PERSISTENT KEEPALIVE & BACKGROUND STABILITY PATCH FOR REMOTEMANAGER ---
// Prevents Android TV TLS disconnection when switching tabs or when Mac is idle.
(RemoteManager.prototype as any).start = function () {
  const self = this;
  self.isManualStopping = false;

  return new Promise((resolve, reject) => {
    if (self.pingInterval) {
      clearInterval(self.pingInterval);
      self.pingInterval = null;
    }

    const options = {
      key: self.certs.key,
      cert: self.certs.cert,
      port: self.port,
      host: self.host,
      rejectUnauthorized: false,
    };

    console.log(`[RemoteManager] Establishing TLS connection to ${self.host}:${self.port}...`);
    self.client = tls.connect(options, () => {
      // TLS socket connected
    });

    if (self.client) {
      self.client.setKeepAlive(true, 3000);
      self.client.setTimeout(60000);
    }

    self.client.on('timeout', () => {
      console.log(`[RemoteManager] Socket idle heartbeat for ${self.host}...`);
      try {
        if (self.client && !self.client.destroyed) {
          self.client.write(remoteMessageManager.createRemotePingResponse(0));
        }
      } catch {
        // ignore
      }
    });

    self.client.on('secureConnect', () => {
      console.log(`[RemoteManager] ✓ TV TLS Connection ACTIVE at ${self.host}:${self.port}`);

      if (self.pingInterval) {
        clearInterval(self.pingInterval);
      }

      // Proactive 4-second heartbeat keepalive so TV never drops the session
      self.pingInterval = setInterval(() => {
        try {
          if (self.client && !self.client.destroyed) {
            self.client.write(remoteMessageManager.createRemotePingResponse(0));
          }
        } catch {
          // ignore
        }
      }, 4000);

      resolve(true);
    });

    self.client.on('data', (data: any) => {
      const buffer = Buffer.from(data);
      self.chunks = Buffer.concat([self.chunks, buffer]);

      if (self.chunks.length > 0 && self.chunks.readInt8(0) === self.chunks.length - 1) {
        try {
          const message = remoteMessageManager.parse(self.chunks);

          if (message.remoteConfigure) {
            self.client.write(
              remoteMessageManager.createRemoteConfigure(
                622,
                'Build.MODEL',
                'Build.MANUFACTURER',
                1,
                'Build.VERSION.RELEASE'
              )
            );
            self.emit('ready');
          } else if (message.remoteSetActive) {
            self.client.write(remoteMessageManager.createRemoteSetActive(622));
          } else if (message.remotePingRequest) {
            self.client.write(
              remoteMessageManager.createRemotePingResponse(message.remotePingRequest.val1)
            );
          } else if (message.remoteImeKeyInject) {
            self.emit('current_app', message.remoteImeKeyInject.appInfo?.appPackage);
          } else if (message.remoteStart) {
            self.emit('powered', message.remoteStart.started);
          } else if (message.remoteSetVolumeLevel) {
            self.emit('volume', {
              level: message.remoteSetVolumeLevel.volumeLevel,
              maximum: message.remoteSetVolumeLevel.volumeMax,
              muted: message.remoteSetVolumeLevel.volumeMuted,
            });
          } else if (message.remoteError) {
            self.emit('error', { error: message.remoteError });
          }
        } catch (err) {
          console.warn('[RemoteManager] Parse message error:', err);
        }

        self.chunks = Buffer.from([]);
      }
    });

    self.client.on('close', async (hasError: boolean) => {
      console.log(`[RemoteManager] TV Connection closed (hasError=${hasError})`);
      if (self.pingInterval) {
        clearInterval(self.pingInterval);
        self.pingInterval = null;
      }

      if (self.isManualStopping) {
        return;
      }

      // Safe auto-reconnect backoff (2.5 seconds)
      await new Promise((r) => setTimeout(r, 2500));
      if (!self.isManualStopping) {
        self.start().catch((e: any) => {
          console.warn('[RemoteManager] Auto-reconnect retry error:', e?.message || e);
        });
      }
    });

    self.client.on('error', (error: any) => {
      console.warn(`[RemoteManager] Socket error on ${self.host}:`, error?.message || error);
      self.error = error;
    });
  });
};

(RemoteManager.prototype as any).stop = function () {
  this.isManualStopping = true;
  if (this.pingInterval) {
    clearInterval(this.pingInterval);
    this.pingInterval = null;
  }
  if (this.client) {
    try {
      this.client.destroy();
    } catch {}
  }
};

const CERT_STORE_FILE = path.resolve(process.cwd(), '.webmote-certs.json');

function loadStoredCertificate(): any | undefined {
  try {
    if (fs.existsSync(CERT_STORE_FILE)) {
      const content = fs.readFileSync(CERT_STORE_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (data && data.cert && data.key) {
        console.log('[AndroidRemote] Loaded existing certificate from .webmote-certs.json');
        return data;
      }
    }
  } catch (err) {
    console.warn('[AndroidRemote] Failed to read stored certificate:', err);
  }
  return undefined;
}

function saveCertificate(cert: any) {
  try {
    fs.writeFileSync(CERT_STORE_FILE, JSON.stringify(cert, null, 2), 'utf-8');
    console.log('[AndroidRemote] Certificate successfully saved to .webmote-certs.json');
  } catch (err) {
    console.error('[AndroidRemote] Error saving certificate:', err);
  }
}

export function clearStoredCertificate() {
  try {
    if (fs.existsSync(CERT_STORE_FILE)) {
      fs.unlinkSync(CERT_STORE_FILE);
      console.log('[AndroidRemote] Cleared stored .webmote-certs.json');
    }
  } catch {
    // ignore
  }
}

const KEYCODE_MAP: Record<RemoteCommand, number> = {
  UP: RemoteKeyCode.KEYCODE_DPAD_UP,
  DOWN: RemoteKeyCode.KEYCODE_DPAD_DOWN,
  LEFT: RemoteKeyCode.KEYCODE_DPAD_LEFT,
  RIGHT: RemoteKeyCode.KEYCODE_DPAD_RIGHT,
  OK: RemoteKeyCode.KEYCODE_DPAD_CENTER,
  BACK: RemoteKeyCode.KEYCODE_BACK,
  HOME: RemoteKeyCode.KEYCODE_HOME,
  MENU: RemoteKeyCode.KEYCODE_MENU,
  POWER: RemoteKeyCode.KEYCODE_POWER,
  VOLUME_UP: RemoteKeyCode.KEYCODE_VOLUME_UP,
  VOLUME_DOWN: RemoteKeyCode.KEYCODE_VOLUME_DOWN,
  MUTE: RemoteKeyCode.KEYCODE_VOLUME_MUTE,
  PLAY_PAUSE: RemoteKeyCode.KEYCODE_MEDIA_PLAY_PAUSE,
  FAST_FORWARD: RemoteKeyCode.KEYCODE_MEDIA_FAST_FORWARD,
  REWIND: RemoteKeyCode.KEYCODE_MEDIA_REWIND,
};

export class AndroidTVRemoteV2 {
  private ip: string;
  private remote: any = null;
  private isConnected: boolean = false;
  private onStateChange: (connected: boolean, message: string) => void;
  private onPairingRequired: () => void;
  private onVolumeChange?: (level: number, max: number, muted: boolean) => void;

  constructor(
    ip: string,
    onStateChange: (connected: boolean, message: string) => void,
    onPairingRequired: () => void,
    onVolumeChange?: (level: number, max: number, muted: boolean) => void
  ) {
    this.ip = ip;
    this.onStateChange = onStateChange;
    this.onPairingRequired = onPairingRequired;
    this.onVolumeChange = onVolumeChange;
  }

  public getIp(): string {
    return this.ip;
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }

  public connect(forceFresh: boolean = false) {
    this.disconnect();

    if (forceFresh) {
      clearStoredCertificate();
    }

    const storedCert = forceFresh ? undefined : loadStoredCertificate();

    console.log(`[AndroidRemote] Initializing connection to ${this.ip} (fresh=${forceFresh})...`);
    this.onStateChange(false, `Connecting to TV (${this.ip})...`);

    const options: any = {
      pairing_port: 6467,
      remote_port: 6466,
      name: 'WebMote',
    };

    if (storedCert) {
      options.cert = storedCert;
    }

    try {
      this.remote = new AndroidRemote(this.ip, options);

      this.remote.on('secret', () => {
        console.log(`[AndroidRemote] TV displayed PIN Code on screen.`);
        this.onStateChange(false, 'Masukkan 6 digit kode PIN dari layar TV');
        this.onPairingRequired();
      });

      this.remote.on('ready', () => {
        console.log(`[AndroidRemote] TV connection is READY!`);
        this.isConnected = true;
        const cert = this.remote.getCertificate();
        if (cert) {
          saveCertificate(cert);
        }
        this.onStateChange(true, `Connected to TV (${this.ip})`);
      });

      this.remote.on('volume', (vol: any) => {
        console.log(`[AndroidRemote] TV volume event: level=${vol?.level}/${vol?.maximum}, muted=${vol?.muted}`);
        if (vol && this.onVolumeChange) {
          this.onVolumeChange(vol.level ?? 50, vol.maximum ?? 100, Boolean(vol.muted));
        }
      });

      this.remote.on('error', (error: any) => {
        console.warn(`[AndroidRemote] Error:`, error);
        this.isConnected = false;
        this.onStateChange(false, `Connection error: ${error?.message || error}`);
      });

      this.remote.on('unpaired', () => {
        console.log(`[AndroidRemote] TV session unpaired.`);
        this.isConnected = false;
        this.onStateChange(false, 'TV memerlukan pairing ulang');
        this.onPairingRequired();
      });

      this.remote.on('close', () => {
        console.log(`[AndroidRemote] Connection closed.`);
        this.isConnected = false;
        this.onStateChange(false, 'Disconnected from TV');
      });

      this.remote.start();
    } catch (err: any) {
      console.error(`[AndroidRemote] Failed to start remote:`, err);
      this.onStateChange(false, `Failed to connect: ${err?.message || err}`);
    }
  }

  public async sendPin(pin: string): Promise<boolean> {
    if (!this.remote) {
      console.warn(`[AndroidRemote] Remote instance not found for sendPin`);
      return false;
    }

    const cleanPin = pin.trim().toUpperCase();
    console.log(`[AndroidRemote] Submitting PIN: "${cleanPin}"`);

    try {
      const ok = this.remote.sendCode(cleanPin);
      console.log(`[AndroidRemote] sendCode returned:`, ok);
      return Boolean(ok);
    } catch (err) {
      console.error(`[AndroidRemote] Exception in sendCode:`, err);
      return false;
    }
  }

  public sendCommand(cmd: RemoteCommand): boolean {
    if (!this.remote || !this.isConnected) {
      console.warn(`[AndroidRemote] Not connected. Cannot send ${cmd}`);
      return false;
    }

    if (cmd === 'POWER') {
      this.remote.sendPower();
      return true;
    }

    // Special Hardware Press-and-Release Sequence for Volume & Mute Keys on Android TV
    if (cmd === 'VOLUME_UP') {
      console.log(`[AndroidRemote] Sending VOLUME_UP (START_LONG -> END_LONG)`);
      this.remote.sendKey(RemoteKeyCode.KEYCODE_VOLUME_UP, RemoteDirection.START_LONG);
      setTimeout(() => {
        if (this.remote && this.isConnected) {
          this.remote.sendKey(RemoteKeyCode.KEYCODE_VOLUME_UP, RemoteDirection.END_LONG);
        }
      }, 40);
      return true;
    }

    if (cmd === 'VOLUME_DOWN') {
      console.log(`[AndroidRemote] Sending VOLUME_DOWN (START_LONG -> END_LONG)`);
      this.remote.sendKey(RemoteKeyCode.KEYCODE_VOLUME_DOWN, RemoteDirection.START_LONG);
      setTimeout(() => {
        if (this.remote && this.isConnected) {
          this.remote.sendKey(RemoteKeyCode.KEYCODE_VOLUME_DOWN, RemoteDirection.END_LONG);
        }
      }, 40);
      return true;
    }

    if (cmd === 'MUTE') {
      console.log(`[AndroidRemote] Sending MUTE (START_LONG -> END_LONG)`);
      this.remote.sendKey(RemoteKeyCode.KEYCODE_VOLUME_MUTE, RemoteDirection.START_LONG);
      setTimeout(() => {
        if (this.remote && this.isConnected) {
          this.remote.sendKey(RemoteKeyCode.KEYCODE_VOLUME_MUTE, RemoteDirection.END_LONG);
        }
      }, 40);
      return true;
    }

    // System Navigation Keys: BACK, HOME, MENU (Require START_LONG -> END_LONG on Mi TV / Google TV)
    if (cmd === 'BACK') {
      console.log(`[AndroidRemote] Sending BACK (START_LONG -> END_LONG)`);
      this.remote.sendKey(RemoteKeyCode.KEYCODE_BACK, RemoteDirection.START_LONG);
      setTimeout(() => {
        if (this.remote && this.isConnected) {
          this.remote.sendKey(RemoteKeyCode.KEYCODE_BACK, RemoteDirection.END_LONG);
        }
      }, 40);
      return true;
    }

    if (cmd === 'HOME') {
      console.log(`[AndroidRemote] Sending HOME (START_LONG -> END_LONG)`);
      this.remote.sendKey(RemoteKeyCode.KEYCODE_HOME, RemoteDirection.START_LONG);
      setTimeout(() => {
        if (this.remote && this.isConnected) {
          this.remote.sendKey(RemoteKeyCode.KEYCODE_HOME, RemoteDirection.END_LONG);
        }
      }, 40);
      return true;
    }

    if (cmd === 'MENU') {
      console.log(`[AndroidRemote] Sending MENU (START_LONG -> END_LONG)`);
      this.remote.sendKey(RemoteKeyCode.KEYCODE_MENU, RemoteDirection.START_LONG);
      setTimeout(() => {
        if (this.remote && this.isConnected) {
          this.remote.sendKey(RemoteKeyCode.KEYCODE_MENU, RemoteDirection.END_LONG);
        }
      }, 40);
      return true;
    }

    const keycode = KEYCODE_MAP[cmd];
    if (keycode !== undefined) {
      console.log(`[AndroidRemote] Sending Key: ${cmd} (${keycode})`);
      this.remote.sendKey(keycode, RemoteDirection.SHORT);
      return true;
    }

    return false;
  }

  public sendText(
    text: string,
    mode: 'type' | 'youtube_search' | 'global_search' = 'type',
    submitEnter: boolean = false
  ): boolean {
    if (!this.remote || !this.isConnected) {
      console.warn(`[AndroidRemote] Cannot send text, remote is not connected.`);
      return false;
    }

    console.log(`[AndroidRemote] Text action: "${text}" [mode=${mode}, submitEnter=${submitEnter}]`);

    // Mode 1: Instant YouTube Search Deep Link (100% reliable direct search)
    if (mode === 'youtube_search') {
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(text)}`;
      console.log(`[AndroidRemote] Executing direct YouTube search: ${searchUrl}`);
      this.remote.sendAppLink(searchUrl);
      return true;
    }

    // Mode 2: Global Search Deep Link
    if (mode === 'global_search') {
      const searchUrl = `market://search?q=${encodeURIComponent(text)}`;
      console.log(`[AndroidRemote] Executing global search: ${searchUrl}`);
      this.remote.sendAppLink(searchUrl);
      return true;
    }

    // Mode 3: Direct IME Injection for active text input box
    try {
      if (this.remote.remoteManager?.client) {
        const imePacket = (remoteMessageManager as any).createRemoteImeKeyInject('', {
          value: text,
          start: text.length,
          end: text.length,
          counter: 1,
        });
        if (imePacket) {
          this.remote.remoteManager.client.write(imePacket);
          console.log(`[AndroidRemote] IME packet dispatched successfully`);
        }
      }
    } catch (err) {
      console.warn('[AndroidRemote] IME packet creation/send error:', err);
    }

    if (submitEnter) {
      setTimeout(() => {
        if (this.remote && this.isConnected) {
          console.log('[AndroidRemote] Sending KEYCODE_SEARCH / ENTER');
          this.remote.sendKey(RemoteKeyCode.KEYCODE_SEARCH, RemoteDirection.SHORT);
        }
      }, 150);
    }

    return true;
  }

  public launchApp(appUrlOrPkg: string): boolean {
    if (!this.remote || !this.isConnected) return false;
    console.log(`[AndroidRemote] Launching App Link: ${appUrlOrPkg}`);
    this.remote.sendAppLink(appUrlOrPkg);
    return true;
  }

  public disconnect() {
    if (this.remote) {
      try {
        if (this.remote.pairingManager?.client) {
          this.remote.pairingManager.client.destroy();
        }
        if (this.remote.remoteManager?.client) {
          this.remote.remoteManager.client.destroy();
        }
        this.remote.stop();
      } catch {
        // ignore
      }
      this.remote = null;
    }
    this.isConnected = false;
  }
}
