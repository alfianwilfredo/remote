import React from 'react';
import { StatusHeader } from './StatusHeader';
import { DPad } from './DPad';
import { SystemButtons } from './SystemButtons';
import { FastTextInput } from './FastTextInput';
import { QuickAppCartridges } from './QuickAppCartridges';
import type { RemoteCommand, TVState } from '../types/remote';

interface RemoteChassisProps {
  tvState: TVState;
  wsConnected: boolean;
  isCrtOn: boolean;
  onToggleCrt: () => void;
  isSfxOn: boolean;
  onToggleSfx: () => void;
  onOpenDeviceModal: () => void;
  onCommand: (cmd: RemoteCommand) => void;
  onSendText: (
    text: string,
    mode?: 'type' | 'youtube_search' | 'global_search',
    submitEnter?: boolean
  ) => void;
  onLaunchApp: (app: string) => void;
  activeKey: RemoteCommand | null;
}

export const RemoteChassis: React.FC<RemoteChassisProps> = ({
  tvState,
  wsConnected,
  isCrtOn,
  onToggleCrt,
  isSfxOn,
  onToggleSfx,
  onOpenDeviceModal,
  onCommand,
  onSendText,
  onLaunchApp,
  activeKey,
}) => {
  return (
    <div className="w-full max-w-[440px] bg-[#d1cfc7] border-4 border-black p-2 sm:p-4 flex flex-col gap-2.5 sm:gap-4 pixel-border-outer relative">
      {/* Decorative NES Retro Header Stripes */}
      <div className="flex items-center justify-between border-b-2 sm:border-b-4 border-black pb-1.5 sm:pb-2">
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-0.5">
            <div className="w-12 sm:w-16 h-1 bg-[#d82800]" />
            <div className="w-12 sm:w-16 h-1 bg-[#121214]" />
          </div>
          <span className="font-pixel text-[11px] sm:text-xs text-[#121214] font-black tracking-widest">
            WEBMOTE
          </span>
        </div>
        <span className="font-pixel text-[7px] sm:text-[8px] text-[#6b6b78]">
          8-BIT EDITION
        </span>
      </div>

      {/* LCD Status Header Screen */}
      <StatusHeader
        tvState={tvState}
        wsConnected={wsConnected}
        isCrtOn={isCrtOn}
        onToggleCrt={onToggleCrt}
        isSfxOn={isSfxOn}
        onToggleSfx={onToggleSfx}
        onOpenDeviceModal={onOpenDeviceModal}
      />

      {/* Terminal Text Input Box */}
      <FastTextInput onSendText={onSendText} disabled={!tvState.connected} />

      {/* Center D-Pad Navigation */}
      <div className="bg-[#24242e] border-2 border-black p-2 sm:p-3 flex flex-col items-center">
        <div className="w-full flex items-center justify-between text-[7px] sm:text-[8px] font-pixel text-[#888899] mb-1">
          <span>DIRECTIONAL PAD</span>
          <span className="hidden xs:inline">ARROWS / ENTER</span>
        </div>
        <DPad onCommand={onCommand} activeKey={activeKey} />
      </div>

      {/* System & Audio Controls */}
      <SystemButtons
        onCommand={onCommand}
        activeKey={activeKey}
        isMuted={tvState.isMuted}
      />

      {/* App Cartridges */}
      <QuickAppCartridges
        onLaunchApp={onLaunchApp}
        activeApp={tvState.currentApp}
      />

      {/* Keyboard Cheatsheet Footer */}
      <div className="border-t-2 border-black pt-2 flex flex-col gap-1 text-[8px] font-pixel text-[#555566]">
        <div className="flex justify-between">
          <span>[ARROWS] D-PAD</span>
          <span>[ENTER/SPACE] OK</span>
          <span>[ESC] BACK</span>
        </div>
        <div className="flex justify-between">
          <span>[H] HOME</span>
          <span>[+/-] VOLUME</span>
          <span>[M] MUTE</span>
          <span>[P] POWER</span>
        </div>
      </div>
    </div>
  );
};
