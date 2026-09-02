import { useEffect, useRef, useState, useCallback } from 'react';
import type { DeviceInfo, ProtocolType, RemoteCommand, TVState, WSClientMessage, WSServerMessage } from '../types/remote';
import { sfx } from '../utils/sfx';

const INITIAL_BLANK_STATE: TVState = {
  connected: false,
  activeDevice: null,
  volume: 0,
  isMuted: false,
  currentApp: undefined,
  statusMessage: 'Belum Terhubung ke TV',
};

export function useRemoteSocket() {
  const [tvState, setTvState] = useState<TVState>(INITIAL_BLANK_STATE);
  const [discoveredDevices, setDiscoveredDevices] = useState<DeviceInfo[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [pairingRequired, setPairingRequired] = useState<boolean>(false);
  const [pairingMessage, setPairingMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isPairingSubmitting, setIsPairingSubmitting] = useState<boolean>(false);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [activePressedKey, setActivePressedKey] = useState<RemoteCommand | null>(null);

  const [bridgeUrl, setBridgeUrlState] = useState<string>(() => {
    return localStorage.getItem('webmote_bridge_url') || '';
  });

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<any>(null);

  const getEffectiveWsUrl = useCallback(() => {
    if (bridgeUrl && bridgeUrl.trim()) {
      return bridgeUrl.trim();
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    return `${protocol}//${host}:3001/ws`;
  }, [bridgeUrl]);

  const saveBridgeUrl = useCallback((newUrl: string) => {
    const clean = newUrl.trim();
    if (clean) {
      localStorage.setItem('webmote_bridge_url', clean);
    } else {
      localStorage.removeItem('webmote_bridge_url');
    }
    setBridgeUrlState(clean);
    if (socketRef.current) {
      socketRef.current.close();
    }
  }, []);

  const connectWs = useCallback(() => {
    try {
      const wsUrl = getEffectiveWsUrl();
      console.log('[useRemoteSocket] Connecting to bridge at', wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[useRemoteSocket] WebSocket Connected to', wsUrl);
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data: WSServerMessage = JSON.parse(event.data);
          if (data.type === 'STATE' && data.state) {
            setTvState(data.state);
            if (data.state.connected) {
              setPairingRequired(false);
              setIsPairingSubmitting(false);
              setErrorMessage('');
            }
          } else if (data.type === 'DISCOVERED_DEVICES' && data.devices) {
            setDiscoveredDevices(data.devices);
            setIsScanning(false);
          } else if (data.type === 'PAIRING_REQUIRED') {
            setPairingRequired(true);
            setIsPairingSubmitting(false);
            setPairingMessage(data.message || 'Enter PIN from TV screen');
            setErrorMessage('');
            sfx.playSelect();
          } else if (data.type === 'PAIRING_SUCCESS') {
            setPairingRequired(false);
            setIsPairingSubmitting(false);
            setPairingMessage('');
            setErrorMessage('');
            sfx.playCartridge();
          } else if (data.type === 'ERROR') {
            setIsPairingSubmitting(false);
            setErrorMessage(data.message || 'Terjadi kesalahan');
            sfx.playBack();
          }
        } catch (err) {
          console.error('[useRemoteSocket] Message parsing error:', err);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        socketRef.current = null;
        reconnectTimerRef.current = setTimeout(connectWs, 3000);
      };

      ws.onerror = () => {
        setWsConnected(false);
      };

      socketRef.current = ws;
    } catch {
      setWsConnected(false);
      reconnectTimerRef.current = setTimeout(connectWs, 3000);
    }
  }, [getEffectiveWsUrl]);

  useEffect(() => {
    connectWs();
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      socketRef.current?.close();
    };
  }, [connectWs]);

  const send = useCallback((msg: WSClientMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const sendCommand = useCallback(
    (cmd: RemoteCommand) => {
      // SFX Audio feedback
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

      // Visual button press indication
      setActivePressedKey(cmd);
      setTimeout(() => setActivePressedKey(null), 150);

      // If connected to real TV via bridge, dispatch WebSocket
      if (wsConnected && socketRef.current?.readyState === WebSocket.OPEN) {
        send({ type: 'COMMAND', command: cmd });
      } else {
        // Disconnected feedback: Notify user to connect device
        setTvState((prev) => ({
          ...prev,
          statusMessage: 'NO TV CONNECTED - Buka menu DEVICES',
        }));
      }
    },
    [send, wsConnected]
  );

  const sendText = useCallback(
    (
      text: string,
      mode: 'type' | 'youtube_search' | 'global_search' = 'type',
      submitEnter: boolean = false
    ) => {
      if (!text.trim()) return;
      sfx.playSelect();

      if (wsConnected && socketRef.current?.readyState === WebSocket.OPEN) {
        send({ type: 'TEXT', text, mode, submitEnter });
      } else {
        setTvState((prev) => ({
          ...prev,
          statusMessage: 'NO TV CONNECTED - Hubungkan TV dahulu',
        }));
      }
    },
    [send, wsConnected]
  );

  const launchApp = useCallback(
    (appUrlOrPkg: string) => {
      sfx.playCartridge();

      if (wsConnected && socketRef.current?.readyState === WebSocket.OPEN) {
        send({ type: 'LAUNCH_APP', app: appUrlOrPkg });
      } else {
        setTvState((prev) => ({
          ...prev,
          statusMessage: 'NO TV CONNECTED - Hubungkan TV dahulu',
        }));
      }
    },
    [send, wsConnected]
  );

  const connectDevice = useCallback(
    (ip: string, protocol: ProtocolType = 'v2') => {
      sfx.playSelect();
      if (wsConnected && socketRef.current?.readyState === WebSocket.OPEN) {
        send({ type: 'CONNECT', ip, protocol });
      } else {
        setTvState((prev) => ({
          ...prev,
          statusMessage: 'Bridge Offline. Pastikan bun run server/index.ts aktif.',
        }));
      }
    },
    [send, wsConnected]
  );

  const submitPin = useCallback(
    (pin: string) => {
      setIsPairingSubmitting(true);
      setErrorMessage('');
      sfx.playSelect();

      if (wsConnected && socketRef.current?.readyState === WebSocket.OPEN) {
        send({ type: 'PAIR_PIN', pin });
      } else {
        setIsPairingSubmitting(false);
        setErrorMessage('Bridge server belum terhubung. Jalankan server lokal.');
      }
    },
    [send, wsConnected]
  );

  const disconnectDevice = useCallback(() => {
    sfx.playBack();
    if (wsConnected && socketRef.current?.readyState === WebSocket.OPEN) {
      send({ type: 'DISCONNECT' });
    } else {
      setTvState(INITIAL_BLANK_STATE);
    }
  }, [send, wsConnected]);

  const scanDevices = useCallback(
    (targetMac?: string) => {
      setIsScanning(true);
      sfx.playMove();

      if (wsConnected && socketRef.current?.readyState === WebSocket.OPEN) {
        send({ type: 'SCAN', text: targetMac });
      } else {
        setTimeout(() => {
          setIsScanning(false);
        }, 600);
      }
    },
    [send, wsConnected]
  );

  const resetPairing = useCallback(() => {
    setIsPairingSubmitting(false);
    setErrorMessage('');
    setPairingRequired(true);
    sfx.playSelect();
    if (wsConnected && socketRef.current?.readyState === WebSocket.OPEN) {
      send({ type: 'RESET_PAIRING' });
    }
  }, [send, wsConnected]);

  const wipeCredentials = useCallback(() => {
    setIsPairingSubmitting(false);
    setErrorMessage('');
    setPairingRequired(false);
    sfx.playBack();
    if (wsConnected && socketRef.current?.readyState === WebSocket.OPEN) {
      send({ type: 'RESET_CREDENTIALS' });
    } else {
      setTvState(INITIAL_BLANK_STATE);
    }
  }, [send, wsConnected]);

  return {
    tvState,
    wsConnected,
    discoveredDevices,
    isScanning,
    pairingRequired,
    pairingMessage,
    errorMessage,
    isPairingSubmitting,
    activePressedKey,
    sendCommand,
    sendText,
    launchApp,
    connectDevice,
    submitPin,
    resetPairing,
    wipeCredentials,
    disconnectDevice,
    scanDevices,
    bridgeUrl,
    effectiveBridgeUrl: getEffectiveWsUrl(),
    saveBridgeUrl,
    setPairingRequired,
    setErrorMessage,
  };
}
