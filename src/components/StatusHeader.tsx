import React from 'react';
import { Volume2, VolumeX, Tv, Radio, Sparkles } from 'lucide-react';
import type { TVState } from '../types/remote';
import { sfx } from '../utils/sfx';

interface StatusHeaderProps {
  tvState: TVState;
  wsConnected: boolean;
  isCrtOn: boolean;
  onToggleCrt: () => void;
  isSfxOn: boolean;
  onToggleSfx: () => void;
  onOpenDeviceModal: () => void;
}

export const StatusHeader: React.FC<StatusHeaderProps> = ({
  tvState,
  wsConnected,
  isCrtOn,
  onToggleCrt,
  isSfxOn,
  onToggleSfx,
  onOpenDeviceModal,
}) => {
  // Volume bar visualizer (10 blocks)
  const volBlocks = Math.round((tvState.volume / 100) * 10);
  const volumeBar = '|'.repeat(volBlocks) + '.'.repeat(10 - volBlocks);

  return (
    <header className="w-full flex flex-col gap-2 sm:gap-3">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 text-[8px] sm:text-[10px] font-pixel text-[#888899]">
        <div className="flex items-center gap-1.5">
          {/* WS Server Status */}
          <span className="flex items-center gap-1">
            <span
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 inline-block ${
                wsConnected ? 'bg-[#5cd016]' : 'bg-[#d82800] animate-pixel-blink'
              }`}
            />
            <span>{wsConnected ? 'BRIDGE OK' : 'DISCONNECTED'}</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* CRT Toggle Button */}
          <button
            onClick={() => {
              sfx.playVolume();
              onToggleCrt();
            }}
            className={`px-1.5 py-0.5 sm:px-2 sm:py-1 flex items-center gap-1 border border-black cursor-pointer font-pixel text-[7px] sm:text-[9px] ${
              isCrtOn ? 'bg-[#2b2b36] text-[#38bdf8]' : 'bg-[#15151a] text-[#555]'
            }`}
            title="Toggle Retro CRT Filter"
          >
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span>CRT:{isCrtOn ? 'ON' : 'OFF'}</span>
          </button>

          {/* SFX Toggle Button */}
          <button
            onClick={() => {
              onToggleSfx();
            }}
            className={`px-1.5 py-0.5 sm:px-2 sm:py-1 flex items-center gap-1 border border-black cursor-pointer font-pixel text-[7px] sm:text-[9px] ${
              isSfxOn ? 'bg-[#2b2b36] text-[#fcbc00]' : 'bg-[#15151a] text-[#555]'
            }`}
            title="Toggle 8-bit Sound Effects"
          >
            {isSfxOn ? <Volume2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <VolumeX className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
            <span>SFX:{isSfxOn ? 'ON' : 'OFF'}</span>
          </button>

          {/* Device Setup Modal Button */}
          <button
            onClick={() => {
              sfx.playSelect();
              onOpenDeviceModal();
            }}
            className="px-1.5 py-0.5 sm:px-2 sm:py-1 flex items-center gap-1 border border-black bg-[#d89600] text-black font-pixel text-[7px] sm:text-[9px] cursor-pointer hover:bg-[#fcbc00] active:translate-y-[1px]"
          >
            <Tv className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span>DEVICES</span>
          </button>
        </div>
      </div>

      {/* Retro Dot-Matrix LCD Screen */}
      <div className="pixel-screen p-2 sm:p-3 text-[#5cd016] font-pixel text-[10px] sm:text-xs tracking-wider flex flex-col gap-1.5 sm:gap-2 relative overflow-hidden">
        {/* Subtitle / Status Line */}
        <div className="flex items-center justify-between border-b border-[#5cd016]/30 pb-1.5">
          <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-2">
            <Radio
              className={`w-3 h-3 flex-shrink-0 ${
                tvState.connected ? 'text-[#5cd016] animate-pulse' : 'text-[#d82800]'
              }`}
            />
            <span className="text-[9px] sm:text-[11px] font-pixel truncate">
              {tvState.activeDevice
                ? tvState.activeDevice.name.toUpperCase()
                : 'NO TV CONNECTED'}
            </span>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <span
              className={`px-1 py-0.5 text-[7px] sm:text-[9px] border ${
                tvState.connected
                  ? 'border-[#5cd016] bg-[#5cd016]/10 text-[#5cd016]'
                  : 'border-[#d82800] bg-[#d82800]/10 text-[#d82800]'
              }`}
            >
              {tvState.connected ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </div>

        {/* Dynamic Display Info */}
        <div className="grid grid-cols-2 gap-2 text-[8px] sm:text-[10px] pt-0.5">
          <div className="truncate">
            <div className="text-[#38bdf8] text-[7px] sm:text-[9px] mb-0.5">TARGET IP:</div>
            <div className="font-silkscreen text-[#ffffff] text-[9px] sm:text-[11px] truncate">
              {tvState.activeDevice?.ip || '192.168.x.x'}
            </div>
          </div>

          <div className="truncate">
            <div className="text-[#fcbc00] text-[7px] sm:text-[9px] mb-0.5">ACTIVE APP:</div>
            <div className="font-silkscreen text-[#ffffff] text-[9px] sm:text-[11px] truncate">
              {tvState.currentApp || 'HOME'}
            </div>
          </div>
        </div>

        {/* Volume & Status Message Bar */}
        <div className="flex items-center justify-between text-[8px] sm:text-[10px] pt-1 border-t border-[#5cd016]/20">
          <div className="flex items-center gap-1 truncate mr-2">
            <span>VOL:</span>
            <span className="font-silkscreen text-[#fcbc00] truncate">
              [{tvState.isMuted ? 'MUTE' : volumeBar}] {tvState.volume}%
            </span>
          </div>
          <div className="text-[7px] sm:text-[9px] text-[#5cd016]/70 truncate max-w-[110px] sm:max-w-[150px] flex-shrink-0">
            {tvState.statusMessage}
          </div>
        </div>
      </div>
    </header>
  );
};
