import os from 'node:os';
import net from 'node:net';
import dgram from 'node:dgram';
import { exec } from 'node:child_process';
import type { DeviceInfo } from '../src/types/remote';

export interface ArpEntry {
  ip: string;
  mac: string;
}

// Asynchronous non-blocking ARP table reader
export function getArpTable(): Promise<ArpEntry[]> {
  return new Promise((resolve) => {
    exec('arp -a', { timeout: 1500 }, (err, stdout) => {
      const entries: ArpEntry[] = [];
      if (err || !stdout) {
        resolve(entries);
        return;
      }
      const lines = stdout.split('\n');
      for (const line of lines) {
        const match = line.match(/\((\d+\.\d+\.\d+\.\d+)\)\s+at\s+([0-9a-fA-F:]+)/);
        if (match) {
          const mac = match[2].toLowerCase();
          if (!mac.includes('incomplete')) {
            entries.push({
              ip: match[1],
              mac,
            });
          }
        }
      }
      resolve(entries);
    });
  });
}

// SSDP / UPnP / DIAL Multicast Discovery
function discoverViaSSDP(timeoutMs = 1000): Promise<string[]> {
  return new Promise((resolve) => {
    const discovered = new Set<string>();
    const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

    socket.on('message', (_msg, rinfo) => {
      if (rinfo.address && !discovered.has(rinfo.address)) {
        discovered.add(rinfo.address);
      }
    });

    socket.on('error', () => {});

    socket.bind(0, () => {
      try {
        const query =
          'M-SEARCH * HTTP/1.1\r\n' +
          'HOST: 239.255.255.250:1900\r\n' +
          'MAN: "ssdp:discover"\r\n' +
          'MX: 2\r\n' +
          'ST: ssdp:all\r\n\r\n';
        socket.send(query, 1900, '239.255.255.250');
      } catch {
        // Broadcast error
      }
    });

    setTimeout(() => {
      try {
        socket.close();
      } catch {}
      resolve(Array.from(discovered));
    }, timeoutMs);
  });
}

// Fetch Google Cast Eureka device information (Port 8008)
async function fetchEurekaInfo(ip: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 600);
    const res = await fetch(`http://${ip}:8008/setup/eureka_info`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = (await res.json()) as any;
      if (data && data.name) {
        return data.name;
      }
    }
  } catch {
    // Port 8008 not open or non-responsive
  }
  return null;
}

export async function discoverDevices(targetMacOrIp?: string): Promise<DeviceInfo[]> {
  const discovered: Map<string, DeviceInfo> = new Map();

  const [arpEntries, ssdpIps] = await Promise.all([getArpTable(), discoverViaSSDP(800)]);
  console.log(`[Discovery] Found ${arpEntries.length} ARP entries & ${ssdpIps.length} SSDP responses`);

  const candidateIps = new Set<string>();

  // If a target IP or MAC was given, prioritize it
  if (targetMacOrIp) {
    const cleanTarget = targetMacOrIp.toLowerCase().replace(/[:-]/g, '');
    for (const entry of arpEntries) {
      const cleanMac = entry.mac.replace(/[:-]/g, '');
      if (entry.ip === targetMacOrIp || cleanMac.includes(cleanTarget) || cleanTarget.includes(cleanMac)) {
        candidateIps.add(entry.ip);
      }
    }
    if (targetMacOrIp.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      candidateIps.add(targetMacOrIp);
    }
  }

  // Add SSDP responses
  for (const ip of ssdpIps) {
    candidateIps.add(ip);
  }

  // Add all ARP entries
  for (const entry of arpEntries) {
    if (entry.ip.startsWith('192.168.') || entry.ip.startsWith('10.') || entry.ip.startsWith('172.')) {
      candidateIps.add(entry.ip);
    }
  }

  // Add full subnet IPs (1-254) for complete discovery
  const subnetIps = getLocalSubnetIps();
  for (const ip of subnetIps) {
    candidateIps.add(ip);
  }

  console.log(`[Discovery] Fast-probing ${candidateIps.size} candidate IPs across Android TV ports...`);

  // Fast concurrent probing in chunks of 50 to avoid socket starvation
  const ipList = Array.from(candidateIps);
  const CHUNK_SIZE = 50;

  for (let i = 0; i < ipList.length; i += CHUNK_SIZE) {
    const chunk = ipList.slice(i, i + CHUNK_SIZE);
    const probePromises = chunk.map(async (ip) => {
      const [eurekaName, isV2Pairing, isV2Control, isCastTls, isAdb] = await Promise.all([
        fetchEurekaInfo(ip),
        checkPort(ip, 6467, 400),
        checkPort(ip, 6466, 400),
        checkPort(ip, 8009, 400),
        checkPort(ip, 5555, 400),
      ]);

      const isV2 = isV2Pairing || isV2Control;
      const isCast = Boolean(eurekaName) || isCastTls;

      if (isV2 || isCast || isAdb) {
        const matchedArp = arpEntries.find((e) => e.ip === ip);
        const macStr = matchedArp ? ` (${matchedArp.mac})` : '';
        const deviceName = eurekaName || `Android TV (${ip})`;

        discovered.set(ip, {
          ip,
          name: `${deviceName}${macStr}`,
          port: isV2 ? 6467 : isAdb ? 5555 : 8008,
          protocol: isV2 ? 'v2' : isAdb ? 'adb' : 'v2',
          paired: isAdb,
        });
        console.log(`[Discovery] ✓ Discovered TV: ${deviceName} at ${ip} [v2=${isV2}, cast=${isCast}, adb=${isAdb}]`);
      }
    });

    await Promise.allSettled(probePromises);
  }

  return Array.from(discovered.values());
}

function checkPort(host: string, port: number, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isFinished = false;

    socket.setTimeout(timeoutMs);

    socket.on('connect', () => {
      isFinished = true;
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      if (!isFinished) {
        isFinished = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.on('error', () => {
      if (!isFinished) {
        isFinished = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.connect(port, host);
  });
}

function getLocalSubnetIps(): string[] {
  const ips: string[] = [];
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    const netList = interfaces[name];
    if (!netList) continue;

    for (const netInfo of netList) {
      if (netInfo.family === 'IPv4' && !netInfo.internal) {
        const parts = netInfo.address.split('.');
        if (parts.length === 4) {
          const prefix = `${parts[0]}.${parts[1]}.${parts[2]}`;
          for (let i = 1; i <= 254; i++) {
            ips.push(`${prefix}.${i}`);
          }
        }
      }
    }
  }

  return ips;
}
