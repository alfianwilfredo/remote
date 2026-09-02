import type { RemoteCommand } from '../types/remote';

export const ANDROID_KEYCODES: Record<RemoteCommand, number> = {
  UP: 19,          // KEYCODE_DPAD_UP
  DOWN: 20,        // KEYCODE_DPAD_DOWN
  LEFT: 21,        // KEYCODE_DPAD_LEFT
  RIGHT: 22,       // KEYCODE_DPAD_RIGHT
  OK: 23,          // KEYCODE_DPAD_CENTER
  BACK: 4,         // KEYCODE_BACK
  HOME: 3,         // KEYCODE_HOME
  MENU: 82,        // KEYCODE_MENU
  POWER: 26,       // KEYCODE_POWER
  VOLUME_UP: 24,   // KEYCODE_VOLUME_UP
  VOLUME_DOWN: 25, // KEYCODE_VOLUME_DOWN
  MUTE: 164,       // KEYCODE_VOLUME_MUTE
  PLAY_PAUSE: 85,  // KEYCODE_MEDIA_PLAY_PAUSE
  FAST_FORWARD: 90,// KEYCODE_MEDIA_FAST_FORWARD
  REWIND: 89,      // KEYCODE_MEDIA_REWIND
};

export const POPULAR_APPS = [
  {
    id: 'youtube',
    name: 'YOUTUBE',
    packageName: 'com.google.android.youtube.tv',
    deepLink: 'vnd.youtube.launch://',
    color: '#ff0000',
    badge: 'YT',
  },
  {
    id: 'netflix',
    name: 'NETFLIX',
    packageName: 'com.netflix.ninja',
    deepLink: 'netflix://',
    color: '#e50914',
    badge: 'NF',
  },
  {
    id: 'spotify',
    name: 'SPOTIFY',
    packageName: 'com.spotify.tv.android',
    deepLink: 'spotify://',
    color: '#1db954',
    badge: 'SP',
  },
  {
    id: 'disney',
    name: 'DISNEY+',
    packageName: 'in.startv.hotstar.dplus',
    deepLink: 'hotstar://',
    color: '#113ccf',
    badge: 'D+',
  },
  {
    id: 'prime',
    name: 'PRIME',
    packageName: 'com.amazon.amazonvideo.livingroom',
    deepLink: 'https://app.primevideo.com',
    color: '#00a8e1',
    badge: 'PV',
  },
  {
    id: 'twitch',
    name: 'TWITCH',
    packageName: 'tv.twitch.android.app',
    deepLink: 'twitch://',
    color: '#9146ff',
    badge: 'TW',
  },
];
