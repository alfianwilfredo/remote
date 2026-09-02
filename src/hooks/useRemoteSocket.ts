import { useEffect, useRef, useState, useCallback } from 'react';
import type { DeviceInfo, ProtocolType, RemoteCommand, TVState, WSClientMessage, WSServerMessage } from '../types/remote';
import { sfx } from '../utils/sfx';

const INITIAL_DEMO_STATE: TVState = {
  connected: true,
  activeDevice: {
    ip: '192.168.1.DEMO',
    name: 'Virtual TV (Simulator)',
    protocol: 'mock',
    paired: true,
  },
  volume: 45,
  isMuted: false,
  currentApp: 'HOME',
  statusMessage: 'Virtual TV Ready (Demo Mode)',
};

export function useRemoteSocket() {
  const [tvState, setTvState] = useState<TVState>(INITIAL_DEMO_STATE);
  const [discoveredDevices, setDiscoveredDevices] = useState<DeviceInfo[]>([
    {
      ip: '192.168.1.20',
      name: 'TV Ruang Tamu (Mi Stick)',
      protocol: 'v2',
      paired: false,
    },
    {
      ip: '192.168.1.55',
      name: 'Android TV Bedroom',
      protocol: 'v2',
      paired: false,
    },
  ]);
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
        // Fallback: Virtual Simulator response for Vercel demo
        setTvState((prev) => {
          let nextVol = prev.volume;
          let nextMute = prev.isMuted;
          let nextMsg = prev.statusMessage;

          if (cmd === 'VOLUME_UP') {
            nextVol = Math.min(100, prev.volume + 5);
            nextMute = false;
            nextMsg = `Volume: ${nextVol}%`;
          } else if (cmd === 'VOLUME_DOWN') {
            nextVol = Math.max(0, prev.volume - 5);
            nextMute = false;
            nextMsg = `Volume: ${nextVol}%`;
          } else if (cmd === 'MUTE') {
            nextMute = !prev.isMuted;
            nextMsg = nextMute ? 'Muted' : `Volume: ${nextVol}%`;
          } else if (cmd === 'HOME') {
            return { ...prev, currentApp: 'HOME', statusMessage: 'Home Screen' };
          } else if (cmd === 'POWER') {
            return {
              ...prev,
              connected: !prev.connected,
              statusMessage: !prev.connected ? 'TV Turned ON' : 'TV in Standby',
            };
          } else {
            nextMsg = `Key: ${cmd}`;
          }

          return {
            ...prev,
            volume: nextVol,
            isMuted: nextMute,
            statusMessage: nextMsg,
          };
        });
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
        // Simulator response
        setTvState((prev) => ({
          ...prev,
          statusMessage:
            mode === 'youtube_search'
              ? `YouTube Search: "${text}"`
              : `Typed: "${text}"`,
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
        // Simulator response
        let appName = 'APP';
        if (appUrlOrPkg.includes('youtube')) appName = 'YOUTUBE';
        else if (appUrlOrPkg.includes('netflix')) appName = 'NETFLIX';
        else if (appUrlOrPkg.includes('spotify')) appName = 'SPOTIFY';
        else if (appUrlOrPkg.includes('disney')) appName = 'DISNEY+';
        else if (appUrlOrPkg.includes('prime')) appName = 'PRIME VIDEO';
        else if (appUrlOrPkg.includes('twitch')) appName = 'TWITCH';

        setTvState((prev) => ({
          ...prev,
          currentApp: appName,
          statusMessage: `Launched ${appName}`,
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
          activeDevice: {
            ip,
            name: ip === '192.168.1.20' ? 'TV Ruang Tamu (Mi Stick)' : `Android TV (${ip})`,
            protocol,
            paired: true,
          },
          statusMessage: `Simulating connection to ${ip}...`,
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
        setTimeout(() => {
          setIsPairingSubmitting(false);
          setPairingRequired(false);
          sfx.playCartridge();
          setTvState((prev) => ({
            ...prev,
            statusMessage: 'Pairing Successful! (Demo)',
          }));
        }, 800);
      }
    },
    [send, wsConnected]
  );

  const disconnectDevice = useCallback(() => {
    sfx.playBack();
    if (wsConnected && socketRef.current?.readyState === WebSocket.OPEN) {
      send({ type: 'DISCONNECT' });
    } else {
      setTvState((prev) => ({
        ...prev,
        connected: false,
        statusMessage: 'Disconnected',
      }));
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
    disconnectDevice,
    scanDevices,
    bridgeUrl,
    effectiveBridgeUrl: getEffectiveWsUrl(),
    saveBridgeUrl,
    setPairingRequired,
    setErrorMessage,
  };
}
