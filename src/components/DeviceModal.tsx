import React, { useState } from 'react';
import { X, Search, Tv, KeyRound, RefreshCw, Server, Check } from 'lucide-react';
import type { DeviceInfo, ProtocolType } from '../types/remote';
import { sfx } from '../utils/sfx';

interface DeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  discoveredDevices: DeviceInfo[];
  isScanning: boolean;
  onScan: () => void;
  onConnect: (ip: string, protocol: ProtocolType) => void;
  pairingRequired: boolean;
  pairingMessage: string;
  errorMessage?: string;
  isPairingSubmitting?: boolean;
  onSubmitPin: (pin: string) => void;
  onCancelPairing: () => void;
  onResetPairing?: () => void;
  currentDevice: DeviceInfo | null;
  bridgeUrl?: string;
  effectiveBridgeUrl?: string;
  onSaveBridgeUrl?: (url: string) => void;
}

export const DeviceModal: React.FC<DeviceModalProps> = ({
  isOpen,
  onClose,
  discoveredDevices,
  isScanning,
  onScan,
  onConnect,
  pairingRequired,
  pairingMessage,
  errorMessage,
  isPairingSubmitting = false,
  onSubmitPin,
  onCancelPairing,
  onResetPairing,
  currentDevice,
  bridgeUrl = '',
  effectiveBridgeUrl = '',
  onSaveBridgeUrl,
}) => {
  const [manualIp, setManualIp] = useState('');
  const [protocol, setProtocol] = useState<ProtocolType>('v2');
  const [pin, setPin] = useState('');
  const [showBridgeSettings, setShowBridgeSettings] = useState(false);
  const [customBridgeInput, setCustomBridgeInput] = useState(bridgeUrl);
  const [bridgeSavedToast, setBridgeSavedToast] = useState(false);

  if (!isOpen) return null;

  const handleManualConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualIp.trim()) return;
    onConnect(manualIp.trim(), protocol);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim() || isPairingSubmitting) return;
    onSubmitPin(pin.trim());
  };

  const handleSaveBridge = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveBridgeUrl) {
      onSaveBridgeUrl(customBridgeInput);
      setBridgeSavedToast(true);
      sfx.playSelect();
      setTimeout(() => setBridgeSavedToast(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-md bg-[#1e1e28] border-4 border-black p-3 sm:p-4 text-[#e0e0e0] flex flex-col gap-3 sm:gap-4 relative pixel-border-outer max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-1.5 sm:pb-2">
          <div className="flex items-center gap-1.5 sm:gap-2 font-pixel text-[10px] sm:text-xs text-[#fcbc00]">
            <Tv className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>TV DEVICE SETUP</span>
          </div>
          <button
            onClick={() => {
              sfx.playBack();
              onClose();
            }}
            className="p-1 pixel-btn-dark cursor-pointer text-[#d82800]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PIN Pairing View (if pairing is required) */}
        {pairingRequired ? (
          <div className="bg-[#121218] p-4 border-2 border-[#fcbc00] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-pixel text-xs text-[#fcbc00]">
                <KeyRound className="w-4 h-4 animate-bounce" />
                <span>ENTER 6-DIGIT PIN</span>
              </div>
              {onResetPairing && (
                <button
                  type="button"
                  onClick={onResetPairing}
                  className="px-2 py-1 pixel-btn-dark font-pixel text-[8px] flex items-center gap-1 text-[#38bdf8] cursor-pointer"
                  title="Generate new PIN on TV"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>MINTA PIN BARU</span>
                </button>
              )}
            </div>

            <p className="font-silkscreen text-xs text-[#a0a0ad]">
              {pairingMessage || 'Lihat kode PIN yang muncul di layar TV Anda dan masukkan di bawah:'}
            </p>

            {errorMessage && (
              <div className="bg-[#3a1010] border border-[#d82800] p-2 text-[#ff8080] font-pixel text-[9px] flex flex-col gap-1.5">
                <span>{errorMessage}</span>
                {onResetPairing && (
                  <button
                    type="button"
                    onClick={onResetPairing}
                    className="self-start px-2 py-1 pixel-btn-gold text-black font-pixel text-[8px] cursor-pointer"
                  >
                    🔄 COBA MINTA PIN BARU
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handlePinSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                autoFocus
                maxLength={8}
                value={pin}
                disabled={isPairingSubmitting}
                onChange={(e) => setPin(e.target.value.toUpperCase())}
                placeholder="Misal: 471B6C"
                className="w-full bg-[#0c1808] border-2 border-[#5cd016] px-3 py-2 font-pixel text-center text-sm text-[#5cd016] tracking-widest focus:outline-none uppercase"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isPairingSubmitting}
                  onClick={onCancelPairing}
                  className="flex-1 py-2 pixel-btn-dark font-pixel text-[10px] cursor-pointer disabled:opacity-50"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={!pin.trim() || isPairingSubmitting}
                  className="flex-1 py-2 pixel-btn-gold font-pixel text-[10px] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {isPairingSubmitting ? 'VERIFYING...' : 'VERIFY PIN'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* Auto Scanner Section */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-pixel text-[10px] text-[#888899]">
                  DISCOVERED ON WI-FI:
                </span>
                <button
                  onClick={onScan}
                  disabled={isScanning}
                  className="px-2.5 py-1 pixel-btn-dark font-pixel text-[9px] flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Search className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? 'SCANNING...' : 'SCAN WI-FI'}</span>
                </button>
              </div>

              {/* Device List */}
              <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                {discoveredDevices.length === 0 ? (
                  <div className="p-3 bg-[#14141c] border border-black text-center font-silkscreen text-xs text-[#666]">
                    {isScanning
                      ? 'Scanning local network for Android TV...'
                      : 'No devices found. Pastikan TV menyala & 1 Wi-Fi.'}
                  </div>
                ) : (
                  discoveredDevices.map((device) => {
                    const isCurrent = currentDevice?.ip === device.ip;
                    return (
                      <div
                        key={device.ip}
                        className={`p-2 border-2 border-black flex items-center justify-between ${
                          isCurrent ? 'bg-[#2a2a38] border-[#5cd016]' : 'bg-[#181822]'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-pixel text-[9px] text-[#ffffff]">
                            {device.name}
                          </span>
                          <span className="font-silkscreen text-[9px] text-[#38bdf8]">
                            IP: {device.ip} ({device.protocol.toUpperCase()})
                          </span>
                        </div>

                        <button
                          onClick={() => onConnect(device.ip, device.protocol)}
                          className="px-2.5 py-1 pixel-btn-gold font-pixel text-[9px] cursor-pointer"
                        >
                          {isCurrent ? 'CONNECTED' : 'CONNECT'}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Manual Connect Form */}
            <form
              onSubmit={handleManualConnect}
              className="flex flex-col gap-2.5 border-t-2 border-black pt-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-pixel text-[10px] text-[#888899]">
                  IP OR MAC ADDRESS:
                </span>
                <span className="font-silkscreen text-[9px] text-[#38bdf8]">
                  MISAL: 192.168.1.20
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={manualIp}
                  onChange={(e) => setManualIp(e.target.value)}
                  placeholder="IP (192.168.1.20) atau MAC..."
                  className="flex-1 bg-[#0c1808] border-2 border-black px-2.5 py-1.5 font-silkscreen text-xs text-[#5cd016] placeholder:text-[#444] focus:outline-none focus:border-[#5cd016]"
                />

                <select
                  value={protocol}
                  onChange={(e) => setProtocol(e.target.value as ProtocolType)}
                  className="bg-[#181820] border-2 border-black px-2 py-1.5 font-pixel text-[9px] text-[#e0e0e0] focus:outline-none cursor-pointer"
                >
                  <option value="v2">V2 (PIN)</option>
                  <option value="adb">ADB (5555)</option>
                  <option value="mock">DEMO</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!manualIp.trim()}
                className="w-full py-2 pixel-btn-gold font-pixel text-[10px] cursor-pointer disabled:opacity-50"
              >
                CONNECT DEVICE
              </button>
            </form>

            {/* Bridge Server Configuration (For Mobile PWA / Cloud Hosting) */}
            <div className="border-t-2 border-black pt-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowBridgeSettings((prev) => !prev)}
                className="flex items-center justify-between text-[9px] font-pixel text-[#888899] hover:text-[#fcbc00] cursor-pointer"
              >
                <span className="flex items-center gap-1">
                  <Server className="w-3 h-3" />
                  <span>BRIDGE SERVER (MOBILE / CLOUD)</span>
                </span>
                <span>{showBridgeSettings ? '▼ HIDE' : '► CONFIGURE'}</span>
              </button>

              {showBridgeSettings && (
                <form onSubmit={handleSaveBridge} className="bg-[#121218] p-2.5 border border-black flex flex-col gap-2">
                  <div className="text-[8px] font-silkscreen text-[#a0a0ad]">
                    Active WebSocket Bridge:
                    <span className="text-[#5cd016] block font-mono text-[9px] mt-0.5">{effectiveBridgeUrl}</span>
                  </div>

                  <input
                    type="text"
                    value={customBridgeInput}
                    onChange={(e) => setCustomBridgeInput(e.target.value)}
                    placeholder="ws://192.168.1.x:3001/ws (kosongkan untuk default)"
                    className="w-full bg-[#0c1808] border border-black px-2 py-1 font-silkscreen text-[10px] text-[#5cd016] focus:outline-none focus:border-[#5cd016]"
                  />

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomBridgeInput('');
                        if (onSaveBridgeUrl) onSaveBridgeUrl('');
                      }}
                      className="px-2 py-1 pixel-btn-dark font-pixel text-[8px] cursor-pointer"
                    >
                      RESET DEFAULT
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-1 pixel-btn-gold font-pixel text-[8px] flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {bridgeSavedToast ? <Check className="w-2.5 h-2.5 text-green-400" /> : null}
                      <span>{bridgeSavedToast ? 'SAVED!' : 'SAVE BRIDGE URL'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
