import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { WebSocketServer } from 'ws';
import { AndroidTVRemoteV2 } from './androidRemote';
import { ADBController } from './adbController';
import { discoverDevices } from './discovery';
import { deleteCertificates } from './certs';
import type { DeviceInfo, ProtocolType, RemoteCommand, TVState, WSClientMessage, WSServerMessage } from './types';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const PUBLIC_DIR = path.resolve(process.cwd(), 'public');

function getNetworkIp(): string | null {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const netList = interfaces[name];
    if (!netList) continue;
    for (const netInfo of netList) {
      if (netInfo.family === 'IPv4' && !netInfo.internal) {
        return netInfo.address;
      }
    }
  }
  return null;
}

function printServerBanner(runtime: string) {
  const netIp = getNetworkIp();
  console.log(`\n🎮 \x1b[1m\x1b[32m[WebMote] Server running via ${runtime}\x1b[0m`);
  console.log(`   ➜  \x1b[1mLocal:\x1b[0m   http://localhost:${PORT}`);
  if (netIp) {
    console.log(`   ➜  \x1b[1mNetwork (Akses dari HP):\x1b[0m \x1b[1m\x1b[36mhttp://${netIp}:${PORT}\x1b[0m`);
  }
  console.log(`   ➜  Pastikan HP dan Mac Anda terhubung ke jaringan Wi-Fi yang sama.\n`);
}

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

// Global state & connections
let currentRemote: AndroidTVRemoteV2 | null = null;
let currentAdb: ADBController | null = null;
let lastDiscoveredDevices: DeviceInfo[] = [];

let tvState: TVState = {
  connected: false,
  activeDevice: null,
  volume: 0,
  isMuted: false,
  currentApp: undefined,
  statusMessage: 'WebMote Ready. Buka menu DEVICES untuk menghubungkan TV.',
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
    console.log(`[Bridge Server] Command recorded: ${cmd}`);
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

function processClientMessage(data: WSClientMessage) {
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
        lastDiscoveredDevices = devices;
        broadcast({ type: 'DISCOVERED_DEVICES', devices });
      });
      break;
  }
}

function handleClientConnected(ws: any) {
  console.log('[WS] Client connected');
  clients.add(ws);
  ws.send(JSON.stringify({ type: 'STATE', state: tvState }));
  if (lastDiscoveredDevices.length > 0) {
    ws.send(JSON.stringify({ type: 'DISCOVERED_DEVICES', devices: lastDiscoveredDevices }));
  }
}

// ---------------------------------------------------------------------------
// HYBRID SERVER INITIALIZATION: Bun Native vs Node.js Standard HTTP
// ---------------------------------------------------------------------------

const isBun = typeof (globalThis as any).Bun !== 'undefined';

if (isBun) {
  // === BUN NATIVE SERVER ENGINE ===
  const Bun = (globalThis as any).Bun;
  Bun.serve({
    port: PORT,
    fetch(req: Request, server: any) {
      const url = new URL(req.url);

      // WebSocket Upgrade
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
          lastDiscoveredDevices = devices;
          broadcast({ type: 'DISCOVERED_DEVICES', devices });
          return Response.json(devices, { headers });
        })();
      }

      // Static files
      const cleanPath = url.pathname === '/' || url.pathname === '' ? '/index.html' : url.pathname;
      const diskPath = path.join(PUBLIC_DIR, cleanPath.replace(/^\//, ''));

      if (fs.existsSync(diskPath) && fs.statSync(diskPath).isFile()) {
        const ext = path.extname(diskPath);
        const contentType = MIME_TYPES[ext] || 'text/plain';
        const file = Bun.file(diskPath);
        return new Response(file, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache',
          },
        });
      }

      return new Response('Not Found', { status: 404 });
    },
    websocket: {
      open(ws: any) {
        handleClientConnected(ws);
      },
      message(ws: any, message: any) {
        try {
          const data: WSClientMessage = JSON.parse(message.toString());
          processClientMessage(data);
        } catch (err) {
          console.error('[WS] Error processing message:', err);
        }
      },
      close(ws: any) {
        console.log('[WS] Client disconnected');
        clients.delete(ws);
      },
    },
  });

  printServerBanner('Bun');
} else {
  // === NODE.JS HTTP & WS SERVER ENGINE (for npm, pnpm, yarn, node) ===
  const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // REST API Routes
    if (pathname === '/api/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(tvState));
      return;
    }

    if (pathname === '/api/reset') {
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
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Pairing credentials wiped' }));
      return;
    }

    if (pathname === '/api/scan') {
      const mac = parsedUrl.searchParams.get('mac') || undefined;
      const devices = await discoverDevices(mac);
      lastDiscoveredDevices = devices;
      broadcast({ type: 'DISCOVERED_DEVICES', devices });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(devices));
      return;
    }

    // Static Asset Delivery
    const cleanPath = pathname === '/' || pathname === '' ? '/index.html' : pathname;
    const diskPath = path.join(PUBLIC_DIR, cleanPath.replace(/^\//, ''));

    if (fs.existsSync(diskPath) && fs.statSync(diskPath).isFile()) {
      const ext = path.extname(diskPath);
      const contentType = MIME_TYPES[ext] || 'text/plain';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
      });
      fs.createReadStream(diskPath).pipe(res);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  });

  // WebSocket Server on /ws
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const parsedUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
    if (parsedUrl.pathname === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', (ws) => {
    handleClientConnected(ws);

    ws.on('message', (message) => {
      try {
        const data: WSClientMessage = JSON.parse(message.toString());
        processClientMessage(data);
      } catch (err) {
        console.error('[WS] Error processing message:', err);
      }
    });

    ws.on('close', () => {
      console.log('[WS] Client disconnected');
      clients.delete(ws);
    });
  });

  server.listen(PORT, () => {
    printServerBanner('Node.js');
  });
}
