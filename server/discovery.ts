import os from 'node:os';
import net from 'node:net';
import { exec } from 'node:child_process';
import type { DeviceInfo } from '../src/types/remote';

export interface ArpEntry {
  ip: string;
  mac: string;
}

// Asynchronous non-blocking ARP table reader
export function getArpTable(): Promise<ArpEntry[]> {
  return new Promise((resolve) => {
    exec('arp -a', { timeout: 1000 }, (err, stdout) => {
      const entries: ArpEntry[] = [];
      if (err || !stdout) {
        resolve(entries);
        return;
      }
      const lines = stdout.split('\n');
      for (const line of lines) {
        const match = line.match(/\((\d+\.\d+\.\d+\.\d+)\)\s+at\s+([0-9a-fA-F:]+)/);
        if (match) {
          entries.push({
            ip: match[1],
            mac: match[2].toLowerCase(),
          });
        }
      }
      resolve(entries);
    });
  });
}

// Fetch Google Cast Eureka device information (Port 8008)
async function fetchEurekaInfo(ip: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 800);
    const res = await fetch(`http://${ip}:8008/setup/eureka_info`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (data && data.name) {
        return data.name;
      }
    }
  } catch {
    // Port 8008 not open
  }
  return null;
}

export async function discoverDevices(targetMacOrIp?: string): Promise<DeviceInfo[]> {
  const discovered: Map<string, DeviceInfo> = new Map();

  const arpEntries = await getArpTable();
  console.log(`[Discovery] Found ${arpEntries.length} entries in ARP cache`);

  const candidateIps = new Set<string>();

  if (targetMacOrIp) {
    const cleanTarget = targetMacOrIp.toLowerCase().replace(/[:-]/g, '');
    for (const entry of arpEntries) {
      const cleanMac = entry.mac.replace(/[:-]/g, '');
      if (entry.ip === targetMacOrIp || cleanMac.includes(cleanTarget) || cleanTarget.includes(cleanMac)) {
        candidateIps.add(entry.ip);
      }
    }
  }

  for (const entry of arpEntries) {
    if (entry.ip.startsWith('192.168.') || entry.ip.startsWith('10.') || entry.ip.startsWith('172.')) {
      candidateIps.add(entry.ip);
    }
  }

  const subnetIps = getLocalSubnetIps();
  for (const ip of subnetIps.slice(0, 30)) {
    candidateIps.add(ip);
  }

  console.log(`[Discovery] Probing ${candidateIps.size} candidate device IPs...`);

  const probePromises = Array.from(candidateIps).map(async (ip) => {
    const [eurekaName, isV2, isAdb] = await Promise.all([
      fetchEurekaInfo(ip),
      checkPort(ip, 6467, 300),
      checkPort(ip, 5555, 300),
    ]);

    if (eurekaName || isV2 || isAdb) {
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
      console.log(`[Discovery] ✓ Discovered TV: ${deviceName} at ${ip} [v2=${isV2}, adb=${isAdb}]`);
    }
  });

  await Promise.allSettled(probePromises);

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
          for (let i = 1; i <= 30; i++) {
            ips.push(`${prefix}.${i}`);
          }
        }
      }
    }
  }

  return ips;
}
