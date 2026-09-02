import { spawn } from 'node:child_process';
import { ANDROID_KEYCODES } from '../src/utils/keycodes';
import type { RemoteCommand } from '../src/types/remote';

export class ADBController {
  private ip: string;
  private isConnected: boolean = false;
  private onStateChange: (connected: boolean, message: string) => void;

  constructor(ip: string, onStateChange: (connected: boolean, message: string) => void) {
    this.ip = ip;
    this.onStateChange = onStateChange;
  }

  public getIp(): string {
    return this.ip;
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }

  public async connect(): Promise<boolean> {
    console.log(`[ADBController] Connecting to ${this.ip}:5555 via ADB...`);
    this.onStateChange(false, `Connecting to ${this.ip} via Wireless ADB...`);

    return new Promise((resolve) => {
      const proc = spawn('adb', ['connect', `${this.ip}:5555`]);
      let output = '';

      proc.stdout.on('data', (data) => {
        output += data.toString();
      });

      proc.stderr.on('data', (data) => {
        output += data.toString();
      });

      proc.on('close', (code) => {
        if (code === 0 && (output.includes('connected') || output.includes('already connected'))) {
          console.log(`[ADBController] Successfully connected to ${this.ip}:5555`);
          this.isConnected = true;
          this.onStateChange(true, `Connected to TV via ADB (${this.ip})`);
          resolve(true);
        } else {
          console.warn(`[ADBController] Failed to connect: ${output}`);
          this.isConnected = false;
          this.onStateChange(false, `ADB Connection failed: ${output.trim()}`);
          resolve(false);
        }
      });

      proc.on('error', (err) => {
        console.warn(`[ADBController] adb binary not available or error:`, err.message);
        this.isConnected = false;
        this.onStateChange(false, `ADB binary error: ${err.message}`);
        resolve(false);
      });
    });
  }

  public sendCommand(cmd: RemoteCommand): boolean {
    const keycode = ANDROID_KEYCODES[cmd];
    if (keycode === undefined) {
      console.warn(`[ADBController] Unknown command: ${cmd}`);
      return false;
    }

    console.log(`[ADBController] Sending KeyCode ${keycode} (${cmd}) to ${this.ip}`);
    try {
      spawn('adb', ['-s', `${this.ip}:5555`, 'shell', 'input', 'keyevent', keycode.toString()]);
      return true;
    } catch (err) {
      console.error(`[ADBController] Error executing keyevent:`, err);
      return false;
    }
  }

  public sendText(text: string): boolean {
    console.log(`[ADBController] Sending text: "${text}" to ${this.ip}`);
    const escaped = text.replace(/([^\w\d])/g, '\\$1');
    try {
      spawn('adb', ['-s', `${this.ip}:5555`, 'shell', 'input', 'text', escaped]);
      return true;
    } catch (err) {
      console.error(`[ADBController] Error sending text via ADB:`, err);
      return false;
    }
  }

  public launchApp(deepLinkOrPackage: string): boolean {
    console.log(`[ADBController] Launching app: "${deepLinkOrPackage}"`);
    try {
      if (deepLinkOrPackage.startsWith('http') || deepLinkOrPackage.includes('://')) {
        spawn('adb', ['-s', `${this.ip}:5555`, 'shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', deepLinkOrPackage]);
      } else {
        spawn('adb', ['-s', `${this.ip}:5555`, 'shell', 'monkey', '-p', deepLinkOrPackage, '-c', 'android.intent.category.LAUNCHER', '1']);
      }
      return true;
    } catch (err) {
      console.error(`[ADBController] Error launching app via ADB:`, err);
      return false;
    }
  }

  public disconnect() {
    if (this.isConnected) {
      try {
        spawn('adb', ['disconnect', `${this.ip}:5555`]);
      } catch {
        // ignore
      }
    }
    this.isConnected = false;
    this.onStateChange(false, 'Disconnected ADB session');
  }
}
