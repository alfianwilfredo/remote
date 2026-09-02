/**
 * WebMote - Ultra-Lightweight 8-Bit Pixel TV Remote (Vanilla ES Module)
 * Zero Dependencies • Pure Performance • Native Web APIs
 */

// --- 1. 8-Bit Web Audio API Sound Synthesizer ---
class RetroAudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('webmote_sfx_muted') === '1';
  }

  getAudioContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('webmote_sfx_muted', this.muted ? '1' : '0');
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  playMove() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.04);
    } catch {}
  }

  playSelect() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880, now + 0.05);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }

  playBack() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }

  playVolume() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(659.25, now);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } catch {}
  }

  playPower() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch {}
  }

  playCartridge() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554.37, now + 0.04);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      osc.frequency.setValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }
}

const sfx = new RetroAudioEngine();

// --- 2. Application State ---
const state = {
  tv: {
    connected: false,
    activeDevice: null,
    volume: 0,
    isMuted: false,
    currentApp: 'HOME',
    statusMessage: 'Belum terhubung ke TV.',
  },
  wsConnected: false,
  discoveredDevices: [],
  isScanning: false,
  pairingRequired: false,
  pairingMessage: '',
  errorMessage: '',
  isPairingSubmitting: false,
  autoEnter: false,
  isCrtOn: localStorage.getItem('webmote_crt_enabled') !== '0',
  customBridgeUrl: localStorage.getItem('webmote_bridge_url') || '',
};

// --- 3. DOM Elements Cache ---
const el = {
  crtOverlay: document.getElementById('crtOverlay'),
  wsStatusDot: document.getElementById('wsStatusDot'),
  wsStatusText: document.getElementById('wsStatusText'),
  btnToggleCrt: document.getElementById('btnToggleCrt'),
  btnToggleSfx: document.getElementById('btnToggleSfx'),
  btnOpenDevices: document.getElementById('btnOpenDevices'),

  // Screen
  screenRadioIcon: document.getElementById('screenRadioIcon'),
  screenDeviceName: document.getElementById('screenDeviceName'),
  screenOnlineBadge: document.getElementById('screenOnlineBadge'),
  screenIp: document.getElementById('screenIp'),
  screenApp: document.getElementById('screenApp'),
  screenVol: document.getElementById('screenVol'),
  screenStatusMsg: document.getElementById('screenStatusMsg'),

  // Fast text
  btnAutoEnter: document.getElementById('btnAutoEnter'),
  formTextInput: document.getElementById('formTextInput'),
  inputFastText: document.getElementById('inputFastText'),
  btnClearText: document.getElementById('btnClearText'),
  btnYtSearch: document.getElementById('btnYtSearch'),
  btnSendText: document.getElementById('btnSendText'),

  // Modal
  deviceModal: document.getElementById('deviceModal'),
  btnCloseModal: document.getElementById('btnCloseModal'),
  pinPairingView: document.getElementById('pinPairingView'),
  deviceMainView: document.getElementById('deviceMainView'),
  pinInstructions: document.getElementById('pinInstructions'),
  pinErrorBanner: document.getElementById('pinErrorBanner'),
  pinErrorMessage: document.getElementById('pinErrorMessage'),
  formPinSubmit: document.getElementById('formPinSubmit'),
  inputPin: document.getElementById('inputPin'),
  btnCancelPin: document.getElementById('btnCancelPin'),
  btnSubmitPin: document.getElementById('btnSubmitPin'),
  btnRequestNewPin: document.getElementById('btnRequestNewPin'),
  btnRetryPin: document.getElementById('btnRetryPin'),

  btnScanWifi: document.getElementById('btnScanWifi'),
  scanWifiText: document.getElementById('scanWifiText'),
  discoveredDevicesList: document.getElementById('discoveredDevicesList'),
  formManualConnect: document.getElementById('formManualConnect'),
  inputManualIp: document.getElementById('inputManualIp'),
  selectProtocol: document.getElementById('selectProtocol'),

  btnToggleBridgeSettings: document.getElementById('btnToggleBridgeSettings'),
  bridgeSettingsArrow: document.getElementById('bridgeSettingsArrow'),
  bridgeSettingsPanel: document.getElementById('bridgeSettingsPanel'),
  labelActiveWsBridge: document.getElementById('labelActiveWsBridge'),
  inputCustomBridgeUrl: document.getElementById('inputCustomBridgeUrl'),
  btnResetBridgeUrl: document.getElementById('btnResetBridgeUrl'),
  btnSaveBridgeUrl: document.getElementById('btnSaveBridgeUrl'),
  btnWipeCredentials: document.getElementById('btnWipeCredentials'),
};

// --- 4. WebSocket Bridge Client ---
let ws = null;
let reconnectTimer = null;

function getWebSocketUrl() {
  if (state.customBridgeUrl && state.customBridgeUrl.trim()) {
    return state.customBridgeUrl.trim();
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host || 'localhost:3000';
  return `${protocol}//${host}/ws`;
}

function initWebSocket() {
  if (ws) {
    try { ws.close(); } catch {}
  }

  const wsUrl = getWebSocketUrl();
  el.labelActiveWsBridge.textContent = wsUrl;

  try {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      state.wsConnected = true;
      renderWsStatus();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleServerMessage(data);
      } catch (err) {
        console.error('[WS] Error parsing message:', err);
      }
    };

    ws.onclose = () => {
      state.wsConnected = false;
      renderWsStatus();
      if (!reconnectTimer) {
        reconnectTimer = setTimeout(() => {
          reconnectTimer = null;
          initWebSocket();
        }, 3000);
      }
    };

    ws.onerror = () => {
      state.wsConnected = false;
      renderWsStatus();
    };
  } catch {
    state.wsConnected = false;
    renderWsStatus();
    if (!reconnectTimer) {
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        initWebSocket();
      }, 3000);
    }
  }
}

function sendWs(msg) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

function handleServerMessage(data) {
  switch (data.type) {
    case 'STATE':
      if (data.state) {
        state.tv = { ...state.tv, ...data.state };
        if (state.tv.connected) {
          state.pairingRequired = false;
          state.isPairingSubmitting = false;
          state.errorMessage = '';
        }
        renderScreen();
        renderActiveAppCartridge();
        renderModalState();
      }
      break;

    case 'DISCOVERED_DEVICES':
      if (data.devices) {
        state.discoveredDevices = data.devices;
        state.isScanning = false;
        renderDiscoveredDevices();
      }
      break;

    case 'PAIRING_REQUIRED':
      state.pairingRequired = true;
      state.isPairingSubmitting = false;
      state.pairingMessage = data.message || 'Masukkan 6 digit kode PIN yang tampil di TV Anda.';
      state.errorMessage = '';
      openModal();
      renderModalState();
      sfx.playSelect();
      break;

    case 'PAIRING_SUCCESS':
      state.pairingRequired = false;
      state.isPairingSubmitting = false;
      state.errorMessage = '';
      renderModalState();
      sfx.playCartridge();
      break;

    case 'ERROR':
      state.isPairingSubmitting = false;
      state.errorMessage = data.message || 'Terjadi kesalahan pada koneksi.';
      renderModalState();
      sfx.playBack();
      break;
  }
}

// --- 5. UI Rendering Functions ---
function renderWsStatus() {
  if (state.wsConnected) {
    el.wsStatusDot.classList.remove('disconnected');
    el.wsStatusText.textContent = 'BRIDGE OK';
  } else {
    el.wsStatusDot.classList.add('disconnected');
    el.wsStatusText.textContent = 'DISCONNECTED';
  }
}

function renderScreen() {
  const isOnline = state.tv.connected;
  el.screenDeviceName.textContent = state.tv.activeDevice 
    ? state.tv.activeDevice.name.toUpperCase() 
    : 'NO TV CONNECTED';

  if (isOnline) {
    el.screenOnlineBadge.classList.remove('offline');
    el.screenOnlineBadge.textContent = 'ONLINE';
    el.screenRadioIcon.textContent = '🟢';
  } else {
    el.screenOnlineBadge.classList.add('offline');
    el.screenOnlineBadge.textContent = 'OFFLINE';
    el.screenRadioIcon.textContent = '📻';
  }

  el.screenIp.textContent = state.tv.activeDevice?.ip || '192.168.x.x';
  el.screenApp.textContent = state.tv.currentApp || 'HOME';

  // Volume visualization (10 blocks)
  const volBlocks = Math.round(((state.tv.volume || 0) / 100) * 10);
  const volBarStr = '|'.repeat(volBlocks) + '.'.repeat(10 - volBlocks);
  el.screenVol.textContent = state.tv.isMuted ? '[MUTE]' : `[${volBarStr}] ${state.tv.volume}%`;
  el.screenStatusMsg.textContent = state.tv.statusMessage || '';
}

function renderActiveAppCartridge() {
  const current = (state.tv.currentApp || '').toUpperCase();
  document.querySelectorAll('.cartridge-btn').forEach((btn) => {
    const appName = btn.querySelector('.cartridge-name')?.textContent || '';
    if (current && (current.includes(appName) || current.includes(btn.dataset.app?.toUpperCase() || ''))) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function renderDiscoveredDevices() {
  if (state.isScanning) {
    el.discoveredDevicesList.innerHTML = `
      <div style="padding: 10px; background-color: #14141c; border: 1px solid #000; text-align: center; font-size: 10px; color: #aaa;" class="font-silkscreen">
        ⏳ Scanning local network for Android TV...
      </div>`;
    el.scanWifiText.textContent = 'SCANNING...';
    return;
  }

  el.scanWifiText.textContent = '🔍 SCAN WI-FI';

  if (!state.discoveredDevices || state.discoveredDevices.length === 0) {
    el.discoveredDevicesList.innerHTML = `
      <div style="padding: 10px; background-color: #14141c; border: 1px solid #000; text-align: center; font-size: 10px; color: #666;" class="font-silkscreen">
        No devices found. Pastikan TV menyala & 1 Wi-Fi.
      </div>`;
    return;
  }

  el.discoveredDevicesList.innerHTML = state.discoveredDevices.map((dev) => {
    const isCurrent = state.tv.activeDevice?.ip === dev.ip;
    return `
      <div class="device-item ${isCurrent ? 'active' : ''}">
        <div>
          <div class="device-meta-name">${dev.name}</div>
          <div class="device-meta-ip font-silkscreen">IP: ${dev.ip} (${(dev.protocol || 'v2').toUpperCase()})</div>
        </div>
        <button class="pixel-btn-gold font-pixel btn-connect-item" data-ip="${dev.ip}" data-protocol="${dev.protocol || 'v2'}" style="padding: 4px 8px; font-size: 8px; cursor: pointer;">
          ${isCurrent ? 'CONNECTED' : 'CONNECT'}
        </button>
      </div>`;
  }).join('');

  // Attach connect handlers
  el.discoveredDevicesList.querySelectorAll('.btn-connect-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      connectDevice(btn.dataset.ip, btn.dataset.protocol);
    });
  });
}

function renderModalState() {
  if (state.pairingRequired) {
    el.pinPairingView.style.display = 'flex';
    el.deviceMainView.style.display = 'none';
    el.pinInstructions.textContent = state.pairingMessage || 'Lihat kode PIN yang muncul di TV Anda:';

    if (state.errorMessage) {
      el.pinErrorBanner.style.display = 'flex';
      el.pinErrorMessage.textContent = state.errorMessage;
    } else {
      el.pinErrorBanner.style.display = 'none';
    }

    el.btnSubmitPin.textContent = state.isPairingSubmitting ? 'VERIFYING...' : 'VERIFY PIN';
    el.btnSubmitPin.disabled = state.isPairingSubmitting;
    el.inputPin.disabled = state.isPairingSubmitting;
    el.inputPin.focus();
  } else {
    el.pinPairingView.style.display = 'none';
    el.deviceMainView.style.display = 'flex';
  }
}

function openModal() {
  el.deviceModal.classList.add('open');
  if (state.discoveredDevices.length === 0) {
    scanDevices();
  }
  renderModalState();
}

function closeModal() {
  el.deviceModal.classList.remove('open');
}

// --- 6. Remote Actions & Commands ---
function sendCommand(cmd) {
  // Audio feedback
  if (cmd === 'UP' || cmd === 'DOWN' || cmd === 'LEFT' || cmd === 'RIGHT') {
    sfx.playMove();
  } else if (cmd === 'OK') {
    sfx.playSelect();
  } else if (cmd === 'BACK') {
    sfx.playBack();
  } else if (cmd === 'VOLUME_UP' || cmd === 'VOLUME_DOWN') {
    sfx.playVolume();
  } else if (cmd === 'POWER') {
    sfx.playPower();
  } else {
    sfx.playMove();
  }

  // Visual button pressed animation
  const btn = document.querySelector(`[data-cmd="${cmd}"]`);
  if (btn) {
    btn.classList.add('pressed');
    setTimeout(() => btn.classList.remove('pressed'), 120);
  }

  if (state.wsConnected) {
    sendWs({ type: 'COMMAND', command: cmd });
  } else {
    state.tv.statusMessage = 'NO TV CONNECTED - Buka menu DEVICES';
    renderScreen();
  }
}

function sendText(text, mode = 'type', submitEnter = false) {
  if (!text || !text.trim()) return;
  sfx.playSelect();

  if (state.wsConnected) {
    sendWs({ type: 'TEXT', text: text.trim(), mode, submitEnter });
  } else {
    state.tv.statusMessage = 'NO TV CONNECTED - Hubungkan TV dahulu';
    renderScreen();
  }
}

function launchApp(appUrlOrPkg) {
  sfx.playCartridge();
  if (state.wsConnected) {
    sendWs({ type: 'LAUNCH_APP', app: appUrlOrPkg });
  } else {
    state.tv.statusMessage = 'NO TV CONNECTED - Hubungkan TV dahulu';
    renderScreen();
  }
}

function connectDevice(ip, protocol = 'v2') {
  if (!ip || !ip.trim()) return;
  sfx.playSelect();
  closeModal();
  sendWs({ type: 'CONNECT', ip: ip.trim(), protocol });
}

function submitPin(pin) {
  if (!pin || !pin.trim()) return;
  state.isPairingSubmitting = true;
  renderModalState();
  sfx.playSelect();
  sendWs({ type: 'PAIR_PIN', pin: pin.trim().toUpperCase() });
}

function scanDevices() {
  state.isScanning = true;
  renderDiscoveredDevices();
  sendWs({ type: 'SCAN' });

  // Direct fetch fallback
  const host = window.location.host || 'localhost:3000';
  fetch(`//${host}/api/scan`)
    .then((r) => r.json())
    .then((devices) => {
      if (Array.isArray(devices) && devices.length > 0) {
        state.discoveredDevices = devices;
      }
    })
    .catch(() => {})
    .finally(() => {
      state.isScanning = false;
      renderDiscoveredDevices();
    });
}

function resetPairing() {
  state.errorMessage = '';
  state.pairingRequired = true;
  state.isPairingSubmitting = false;
  renderModalState();
  sfx.playSelect();
  sendWs({ type: 'RESET_PAIRING' });
}

function wipeCredentials() {
  state.errorMessage = '';
  state.pairingRequired = false;
  sfx.playBack();
  sendWs({ type: 'RESET_CREDENTIALS' });
  closeModal();
}

// --- 7. Event Listeners Setup ---
function setupEventListeners() {
  // Remote Buttons
  document.querySelectorAll('[data-cmd]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      sendCommand(btn.dataset.cmd);
    });
  });

  // App Cartridges
  document.querySelectorAll('.cartridge-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (btn.dataset.app) launchApp(btn.dataset.app);
    });
  });

  // Toolbar Toggles
  el.btnToggleCrt.addEventListener('click', () => {
    sfx.playVolume();
    state.isCrtOn = !state.isCrtOn;
    localStorage.setItem('webmote_crt_enabled', state.isCrtOn ? '1' : '0');
    el.crtOverlay.classList.toggle('active', state.isCrtOn);
    el.btnToggleCrt.classList.toggle('active-crt', state.isCrtOn);
    el.btnToggleCrt.querySelector('span').textContent = `CRT:${state.isCrtOn ? 'ON' : 'OFF'}`;
  });

  el.btnToggleSfx.addEventListener('click', () => {
    const isMuted = sfx.toggleMute();
    el.btnToggleSfx.classList.toggle('active-sfx', !isMuted);
    el.btnToggleSfx.querySelector('span').textContent = `SFX:${!isMuted ? 'ON' : 'OFF'}`;
  });

  el.btnOpenDevices.addEventListener('click', () => {
    sfx.playSelect();
    openModal();
  });

  // Fast Text Input
  el.inputFastText.addEventListener('input', () => {
    el.btnClearText.classList.toggle('visible', Boolean(el.inputFastText.value));
  });

  el.btnClearText.addEventListener('click', () => {
    el.inputFastText.value = '';
    el.btnClearText.classList.remove('visible');
    el.inputFastText.focus();
  });

  el.btnAutoEnter.addEventListener('click', () => {
    sfx.playVolume();
    state.autoEnter = !state.autoEnter;
    el.btnAutoEnter.classList.toggle('active-crt', state.autoEnter);
    el.btnAutoEnter.querySelector('span').textContent = `AUTO-ENTER: ${state.autoEnter ? 'ON' : 'OFF'}`;
  });

  el.formTextInput.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = el.inputFastText.value.trim();
    if (val) {
      sendText(val, 'type', state.autoEnter);
      el.inputFastText.value = '';
      el.btnClearText.classList.remove('visible');
    }
  });

  el.btnYtSearch.addEventListener('click', () => {
    const val = el.inputFastText.value.trim();
    if (val) {
      sendText(val, 'youtube_search', false);
      el.inputFastText.value = '';
      el.btnClearText.classList.remove('visible');
    }
  });

  // Modal Controls
  el.btnCloseModal.addEventListener('click', () => {
    sfx.playBack();
    closeModal();
  });

  el.btnScanWifi.addEventListener('click', () => {
    sfx.playMove();
    scanDevices();
  });

  el.formManualConnect.addEventListener('submit', (e) => {
    e.preventDefault();
    connectDevice(el.inputManualIp.value, el.selectProtocol.value);
  });

  el.formPinSubmit.addEventListener('submit', (e) => {
    e.preventDefault();
    submitPin(el.inputPin.value);
  });

  el.btnCancelPin.addEventListener('click', () => {
    state.pairingRequired = false;
    renderModalState();
  });

  el.btnRequestNewPin.addEventListener('click', resetPairing);
  el.btnRetryPin.addEventListener('click', resetPairing);

  // Bridge Settings Collapsible
  el.btnToggleBridgeSettings.addEventListener('click', () => {
    const isOpen = el.bridgeSettingsPanel.style.display === 'flex';
    el.bridgeSettingsPanel.style.display = isOpen ? 'none' : 'flex';
    el.bridgeSettingsArrow.textContent = isOpen ? '► CONFIGURE' : '▼ HIDE';
  });

  el.btnSaveBridgeUrl.addEventListener('click', () => {
    const custom = el.inputCustomBridgeUrl.value.trim();
    state.customBridgeUrl = custom;
    if (custom) {
      localStorage.setItem('webmote_bridge_url', custom);
    } else {
      localStorage.removeItem('webmote_bridge_url');
    }
    sfx.playSelect();
    el.btnSaveBridgeUrl.textContent = 'SAVED!';
    setTimeout(() => { el.btnSaveBridgeUrl.textContent = 'SAVE BRIDGE URL'; }, 2000);
    initWebSocket();
  });

  el.btnResetBridgeUrl.addEventListener('click', () => {
    el.inputCustomBridgeUrl.value = '';
    state.customBridgeUrl = '';
    localStorage.removeItem('webmote_bridge_url');
    initWebSocket();
  });

  el.btnWipeCredentials.addEventListener('click', () => {
    wipeCredentials();
  });

  // Physical Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    const target = e.target;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      if (e.key === 'Escape') target.blur();
      return;
    }

    let cmd = null;
    switch (e.key) {
      case 'ArrowUp': cmd = 'UP'; break;
      case 'ArrowDown': cmd = 'DOWN'; break;
      case 'ArrowLeft': cmd = 'LEFT'; break;
      case 'ArrowRight': cmd = 'RIGHT'; break;
      case 'Enter':
      case ' ': cmd = 'OK'; break;
      case 'Escape':
      case 'Backspace':
      case 'b':
      case 'B': cmd = 'BACK'; break;
      case 'h':
      case 'H': cmd = 'HOME'; break;
      case 'm':
      case 'M': cmd = 'MUTE'; break;
      case '+':
      case '=': cmd = 'VOLUME_UP'; break;
      case '-':
      case '_': cmd = 'VOLUME_DOWN'; break;
      case 'p':
      case 'P': cmd = 'POWER'; break;
    }

    if (cmd) {
      e.preventDefault();
      sendCommand(cmd);
    }
  });
}

// --- 8. Application Initialization ---
function init() {
  // Sync Initial UI states
  el.crtOverlay.classList.toggle('active', state.isCrtOn);
  el.btnToggleCrt.classList.toggle('active-crt', state.isCrtOn);
  el.btnToggleCrt.querySelector('span').textContent = `CRT:${state.isCrtOn ? 'ON' : 'OFF'}`;

  const isMuted = sfx.isMuted();
  el.btnToggleSfx.classList.toggle('active-sfx', !isMuted);
  el.btnToggleSfx.querySelector('span').textContent = `SFX:${!isMuted ? 'ON' : 'OFF'}`;

  if (state.customBridgeUrl) {
    el.inputCustomBridgeUrl.value = state.customBridgeUrl;
  }

  setupEventListeners();
  renderScreen();
  initWebSocket();
}

// Start App when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
