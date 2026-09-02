import { AndroidTVRemoteV2 } from './androidRemote';
import { ADBController } from './adbController';
import { discoverDevices } from './discovery';
import { deleteCertificates } from './certs';
import type { DeviceInfo, ProtocolType, RemoteCommand, TVState, WSClientMessage, WSServerMessage } from '../src/types/remote';

const PORT = 3001;

let currentRemote: AndroidTVRemoteV2 | null = null;
let currentAdb: ADBController | null = null;

let tvState: TVState = {
  connected: false,
  activeDevice: null,
  volume: 0,
  isMuted: false,
  currentApp: undefined,
  statusMessage: 'Bridge Ready. Belum terhubung ke TV.',
};

const clients = new Set<any>();

function broadcast(msg: WSServerMessage) {
  const json = JSON.stringify(msg);
  for (const client of clients) {
    try {
      client.send(json);
    } catch {
      clients.delete(client);
    }
  }
}

function updateState(partial: Partial<TVState>) {
  tvState = { ...tvState, ...partial };
  broadcast({
    type: 'STATE',
    state: tvState,
  });
}

function connectToDevice(ip: string, protocol: ProtocolType = 'v2', forceFresh: boolean = false) {
  console.log(`[Bridge Server] Connecting to ${ip} via ${protocol} (forceFresh=${forceFresh})...`);

  if (currentRemote) {
    currentRemote.disconnect();
    currentRemote = null;
  }
  if (currentAdb) {
    currentAdb.disconnect();
    currentAdb = null;
  }

  const device: DeviceInfo = {
    ip,
    name: `Android TV (${ip})`,
    protocol,
    paired: false,
  };

  updateState({
    activeDevice: device,
    statusMessage: `Connecting to ${device.name}...`,
  });

  if (protocol === 'v2') {
    currentRemote = new AndroidTVRemoteV2(
      ip,
      (connected, message) => {
        updateState({
          connected,
          statusMessage: message,
        });
        if (connected) {
          broadcast({
            type: 'PAIRING_SUCCESS',
            message: 'Berhasil terhubung ke TV!',
          });
        }
      },
      () => {
        broadcast({
          type: 'PAIRING_REQUIRED',
          message: `Masukkan kode PIN 6-digit yang tampil di layar TV Anda.`,
        });
      },
      (level, max, muted) => {
        const percent = Math.round((level / (max || 100)) * 100);
        updateState({
          volume: percent,
          isMuted: muted,
        });
      }
    );
    currentRemote.connect(forceFresh);
  } else if (protocol === 'adb') {
    currentAdb = new ADBController(ip, (connected, message) => {
      updateState({
        connected,
        statusMessage: message,
      });
    });
    currentAdb.connect();
  } else {
    // Demo mode
    setTimeout(() => {
      updateState({
        connected: true,
        statusMessage: `Connected in Demo Mode (${ip})`,
      });
      broadcast({
        type: 'PAIRING_SUCCESS',
        message: 'Connected in Demo Mode',
      });
    }, 300);
  }
}

function handleCommand(cmd: RemoteCommand) {
  console.log(`[Bridge Server] Received command: ${cmd}`);

  if (cmd === 'VOLUME_UP') {
    updateState({ volume: Math.min(100, tvState.volume + 2), isMuted: false });
  } else if (cmd === 'VOLUME_DOWN') {
    updateState({ volume: Math.max(0, tvState.volume - 2) });
  } else if (cmd === 'MUTE') {
    updateState({ isMuted: !tvState.isMuted });
  } else if (cmd === 'HOME') {
    updateState({ currentApp: 'HOME' });
  }

  if (currentRemote && currentRemote.getIsConnected()) {
    currentRemote.sendCommand(cmd);
  } else if (currentAdb && currentAdb.getIsConnected()) {
    currentAdb.sendCommand(cmd);
  } else {
    console.log(`[Bridge Server] Command executed: ${cmd}`);
  }
}

function handleText(
  text: string,
  mode: 'type' | 'youtube_search' | 'global_search' = 'type',
  submitEnter: boolean = false
) {
  console.log(`[Bridge Server] Sending text: "${text}" [mode=${mode}, submitEnter=${submitEnter}]`);
  if (currentRemote && currentRemote.getIsConnected()) {
    currentRemote.sendText(text, mode, submitEnter);
  } else if (currentAdb && currentAdb.getIsConnected()) {
    if (mode === 'youtube_search') {
      currentAdb.launchApp(`https://www.youtube.com/results?search_query=${encodeURIComponent(text)}`);
    } else {
      currentAdb.sendText(text);
      if (submitEnter) {
        setTimeout(() => currentAdb?.sendCommand('OK'), 200);
      }
    }
  }
}

function handleLaunchApp(appUrlOrPkg: string) {
  console.log(`[Bridge Server] Launching App: ${appUrlOrPkg}`);
  updateState({ currentApp: appUrlOrPkg.toUpperCase() });

  if (currentRemote && currentRemote.getIsConnected()) {
    currentRemote.launchApp(appUrlOrPkg);
  } else if (currentAdb && currentAdb.getIsConnected()) {
    currentAdb.launchApp(appUrlOrPkg);
  }
}

async function handlePin(pin: string) {
  console.log(`[Bridge Server] Verifying PIN submission: "${pin}"`);
  if (currentRemote) {
    const success = await currentRemote.sendPin(pin);
    console.log(`[Bridge Server] sendPin returned:`, success);
    if (!success) {
      broadcast({
        type: 'ERROR',
        message: 'Kode PIN tidak cocok atau sesi TV habis. Silakan ulangi koneksi.',
      });
    }
  } else {
    broadcast({
      type: 'ERROR',
      message: 'Sesi remote belum aktif. Klik CONNECT kembali.',
    });
  }
}

// Start Bun native server
const server = Bun.serve({
  port: PORT,
  fetch(req, server) {
    const url = new URL(req.url);

    if (url.pathname === '/ws') {
      const success = server.upgrade(req);
      if (success) return undefined;
      return new Response('WebSocket upgrade failed', { status: 400 });
    }

    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    if (url.pathname === '/api/status') {
      return Response.json(tvState, { headers });
    }

    if (url.pathname === '/api/reset') {
      if (currentRemote) currentRemote.disconnect();
      if (currentAdb) currentAdb.disconnect();
      currentRemote = null;
      currentAdb = null;
      deleteCertificates();
      updateState({
        connected: false,
        activeDevice: null,
        volume: 0,
        isMuted: false,
        currentApp: undefined,
        statusMessage: 'Kredensial pairing telah direset. Siap koneksi baru.',
      });
      return Response.json({ success: true, message: 'Pairing credentials wiped' }, { headers });
    }

    if (url.pathname === '/api/scan') {
      const mac = url.searchParams.get('mac') || undefined;
      return (async () => {
        const devices = await discoverDevices(mac);
        return Response.json(devices, { headers });
      })();
    }

    return new Response('WebMote Bun Bridge Server is running!', { headers });
  },
  websocket: {
    open(ws) {
      console.log('[WS] Client connected');
      clients.add(ws);
      ws.send(
        JSON.stringify({
          type: 'STATE',
          state: tvState,
        })
      );
    },
    message(ws, message) {
      try {
        const data: WSClientMessage = JSON.parse(message.toString());
        switch (data.type) {
          case 'COMMAND':
            if (data.command) handleCommand(data.command);
            break;
          case 'TEXT':
            if (data.text) handleText(data.text, data.mode || 'type', Boolean(data.submitEnter));
            break;
          case 'LAUNCH_APP':
            if (data.app) handleLaunchApp(data.app);
            break;
          case 'CONNECT':
            if (data.ip) connectToDevice(data.ip, data.protocol || 'v2');
            break;
          case 'PAIR_PIN':
            if (data.pin) handlePin(data.pin);
            break;
          case 'DISCONNECT':
            if (currentRemote) currentRemote.disconnect();
            if (currentAdb) currentAdb.disconnect();
            updateState({ connected: false, activeDevice: null, statusMessage: 'Disconnected' });
            break;
          case 'RESET_PAIRING':
            if (currentRemote) {
              const targetIp = currentRemote.getIp();
              console.log(`[Bridge Server] Resetting pairing for ${targetIp}...`);
              connectToDevice(targetIp, 'v2', true);
            } else if (tvState.activeDevice?.ip) {
              connectToDevice(tvState.activeDevice.ip, 'v2', true);
            }
            break;
          case 'RESET_CREDENTIALS':
            console.log('[Bridge Server] Wiping all pairing credentials...');
            if (currentRemote) currentRemote.disconnect();
            if (currentAdb) currentAdb.disconnect();
            currentRemote = null;
            currentAdb = null;
            deleteCertificates();
            updateState({
              connected: false,
              activeDevice: null,
              volume: 0,
              isMuted: false,
              currentApp: undefined,
              statusMessage: 'Kredensial pairing telah direset. Siap koneksi baru.',
            });
            broadcast({
              type: 'LOG',
              message: 'Semua kredensial pairing (.webmote-certs.json) berhasil dihapus.',
            });
            break;
          case 'SCAN':
            discoverDevices(data.text).then((devices) => {
              ws.send(JSON.stringify({ type: 'DISCOVERED_DEVICES', devices }));
            });
            break;
        }
      } catch (err) {
        console.error('[WS] Error processing message:', err);
      }
    },
    close(ws) {
      console.log('[WS] Client disconnected');
      clients.delete(ws);
    },
  },
});

console.log(`🎮 [WebMote] Bridge Server running at http://localhost:${PORT} and ws://localhost:${PORT}/ws`);
