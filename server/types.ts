export type RemoteCommand =
  | 'UP'
  | 'DOWN'
  | 'LEFT'
  | 'RIGHT'
  | 'OK'
  | 'BACK'
  | 'HOME'
  | 'MENU'
  | 'POWER'
  | 'VOLUME_UP'
  | 'VOLUME_DOWN'
  | 'MUTE'
  | 'PLAY_PAUSE'
  | 'FAST_FORWARD'
  | 'REWIND'
  | 'VOICE_ASSIST'
  | 'SEARCH';

export type ProtocolType = 'v2' | 'adb' | 'mock';

export interface DeviceInfo {
  ip: string;
  name: string;
  port?: number;
  protocol: ProtocolType;
  paired: boolean;
}

export interface TVState {
  connected: boolean;
  activeDevice: DeviceInfo | null;
  volume: number;
  isMuted: boolean;
  currentApp?: string;
  statusMessage: string;
}

export interface WSClientMessage {
  type:
    | 'COMMAND'
    | 'TEXT'
    | 'LAUNCH_APP'
    | 'CONNECT'
    | 'DISCONNECT'
    | 'SCAN'
    | 'PAIR_PIN'
    | 'RESET_PAIRING'
    | 'RESET_CREDENTIALS';
  command?: RemoteCommand;
  text?: string;
  submitEnter?: boolean;
  mode?: 'type' | 'youtube_search' | 'global_search';
  app?: string;
  ip?: string;
  pin?: string;
  protocol?: ProtocolType;
}

export interface WSServerMessage {
  type: 'STATE' | 'DISCOVERED_DEVICES' | 'PAIRING_REQUIRED' | 'PAIRING_SUCCESS' | 'ERROR' | 'LOG';
  state?: TVState;
  devices?: DeviceInfo[];
  message?: string;
}
