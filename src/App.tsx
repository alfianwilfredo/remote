import React, { useState } from 'react';
import { useRemoteSocket } from './hooks/useRemoteSocket';
import { useKeyboardRemote } from './hooks/useKeyboardRemote';
import { RemoteChassis } from './components/RemoteChassis';
import { DeviceModal } from './components/DeviceModal';
import { CrtOverlay } from './components/CrtOverlay';
import { sfx } from './utils/sfx';

export const App: React.FC = () => {
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [isCrtOn, setIsCrtOn] = useState(true);
  const [isSfxOn, setIsSfxOn] = useState(() => !sfx.isMuted());

  const {
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
    scanDevices,
    bridgeUrl,
    effectiveBridgeUrl,
    saveBridgeUrl,
    setPairingRequired,
  } = useRemoteSocket();

  // Enable laptop keyboard shortcuts
  useKeyboardRemote({
    onCommand: sendCommand,
    enabled: true,
  });

  const toggleCrt = () => {
    setIsCrtOn((prev) => !prev);
  };

  const toggleSfx = () => {
    const nextMuted = sfx.toggleMute();
    setIsSfxOn(!nextMuted);
  };

  return (
    <main className="min-h-screen bg-[#0e0e12] flex flex-col items-center justify-center p-2 sm:p-4 md:p-8 relative selection:bg-[#fcbc00] selection:text-black overflow-x-hidden">
      {/* CRT Scanline Filter */}
      <CrtOverlay enabled={isCrtOn} />

      {/* Main Remote Interface */}
      <RemoteChassis
        tvState={tvState}
        wsConnected={wsConnected}
        isCrtOn={isCrtOn}
        onToggleCrt={toggleCrt}
        isSfxOn={isSfxOn}
        onToggleSfx={toggleSfx}
        onOpenDeviceModal={() => {
          setIsDeviceModalOpen(true);
          scanDevices();
        }}
        onCommand={sendCommand}
        onSendText={sendText}
        onLaunchApp={launchApp}
        activeKey={activePressedKey}
      />

      {/* Device Connection & PIN Pairing Modal */}
      <DeviceModal
        isOpen={isDeviceModalOpen || pairingRequired}
        onClose={() => setIsDeviceModalOpen(false)}
        discoveredDevices={discoveredDevices}
        isScanning={isScanning}
        onScan={scanDevices}
        onConnect={(ip, protocol) => {
          connectDevice(ip, protocol);
          setIsDeviceModalOpen(false);
        }}
        pairingRequired={pairingRequired}
        pairingMessage={pairingMessage}
        errorMessage={errorMessage}
        isPairingSubmitting={isPairingSubmitting}
        onSubmitPin={submitPin}
        onCancelPairing={() => setPairingRequired(false)}
        onResetPairing={resetPairing}
        onWipeCredentials={wipeCredentials}
        currentDevice={tvState.activeDevice}
        bridgeUrl={bridgeUrl}
        effectiveBridgeUrl={effectiveBridgeUrl}
        onSaveBridgeUrl={saveBridgeUrl}
      />
    </main>
  );
};

export default App;
