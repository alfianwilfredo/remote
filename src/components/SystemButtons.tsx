import React from 'react';
import { Power, Home, Undo2, Volume2, VolumeX, Play, FastForward, Rewind } from 'lucide-react';
import type { RemoteCommand } from '../types/remote';

interface SystemButtonsProps {
  onCommand: (cmd: RemoteCommand) => void;
  activeKey: RemoteCommand | null;
  isMuted: boolean;
}

export const SystemButtons: React.FC<SystemButtonsProps> = ({
  onCommand,
  activeKey,
  isMuted,
}) => {
  return (
    <div className="w-full flex flex-col gap-2.5 sm:gap-4">
      {/* Top Power & Primary System Row */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Power Button */}
        <button
          onClick={() => onCommand('POWER')}
          className={`flex-1 py-1.5 sm:py-2 pixel-btn-red flex items-center justify-center gap-1 sm:gap-1.5 font-pixel text-[9px] sm:text-[10px] cursor-pointer ${
            activeKey === 'POWER' ? 'pressed' : ''
          }`}
          title="TV Power On / Sleep (Keyboard: P)"
        >
          <Power className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>POWER</span>
        </button>

        {/* Home Button */}
        <button
          onClick={() => onCommand('HOME')}
          className={`flex-1 py-1.5 sm:py-2 pixel-btn-dark flex items-center justify-center gap-1 sm:gap-1.5 font-pixel text-[9px] sm:text-[10px] cursor-pointer ${
            activeKey === 'HOME' ? 'pressed' : ''
          }`}
          title="Home Dashboard (Keyboard: H)"
        >
          <Home className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#38bdf8]" />
          <span>HOME</span>
        </button>

        {/* Back Button */}
        <button
          onClick={() => onCommand('BACK')}
          className={`flex-1 py-1.5 sm:py-2 pixel-btn-dark flex items-center justify-center gap-1 sm:gap-1.5 font-pixel text-[9px] sm:text-[10px] cursor-pointer ${
            activeKey === 'BACK' ? 'pressed' : ''
          }`}
          title="Back / Return (Keyboard: Esc / Backspace / B)"
        >
          <Undo2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#fcbc00]" />
          <span>BACK</span>
        </button>
      </div>

      {/* Secondary Controls: Volume & Media Playback */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {/* Volume Rockers */}
        <div className="bg-[#181820] p-1.5 sm:p-2 border-2 border-black flex flex-col gap-1 sm:gap-1.5">
          <div className="text-[8px] sm:text-[9px] font-pixel text-[#888899] text-center border-b border-[#333] pb-0.5 sm:pb-1">
            VOLUME
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => onCommand('VOLUME_DOWN')}
              className={`flex-1 py-1 sm:py-1.5 pixel-btn-dark font-pixel text-[10px] sm:text-xs flex items-center justify-center cursor-pointer ${
                activeKey === 'VOLUME_DOWN' ? 'pressed' : ''
              }`}
              title="Volume Down (Keyboard: -)"
            >
              -
            </button>
            <button
              onClick={() => onCommand('MUTE')}
              className={`px-1.5 sm:px-2 py-1 sm:py-1.5 pixel-btn-dark font-pixel text-[10px] sm:text-xs flex items-center justify-center cursor-pointer ${
                activeKey === 'MUTE' ? 'pressed' : ''
              } ${isMuted ? 'text-[#d82800]' : 'text-[#888]'}`}
              title="Mute / Unmute (Keyboard: M)"
            >
              {isMuted ? <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            </button>
            <button
              onClick={() => onCommand('VOLUME_UP')}
              className={`flex-1 py-1 sm:py-1.5 pixel-btn-dark font-pixel text-[10px] sm:text-xs flex items-center justify-center cursor-pointer ${
                activeKey === 'VOLUME_UP' ? 'pressed' : ''
              }`}
              title="Volume Up (Keyboard: +)"
            >
              +
            </button>
          </div>
        </div>

        {/* Media Playback Controls */}
        <div className="bg-[#181820] p-1.5 sm:p-2 border-2 border-black flex flex-col gap-1 sm:gap-1.5">
          <div className="text-[8px] sm:text-[9px] font-pixel text-[#888899] text-center border-b border-[#333] pb-0.5 sm:pb-1">
            PLAYBACK
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => onCommand('REWIND')}
              className={`flex-1 py-1 sm:py-1.5 pixel-btn-dark flex items-center justify-center cursor-pointer ${
                activeKey === 'REWIND' ? 'pressed' : ''
              }`}
              title="Rewind"
            >
              <Rewind className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#38bdf8]" />
            </button>
            <button
              onClick={() => onCommand('PLAY_PAUSE')}
              className={`flex-1 py-1 sm:py-1.5 pixel-btn-gold flex items-center justify-center cursor-pointer ${
                activeKey === 'PLAY_PAUSE' ? 'pressed' : ''
              }`}
              title="Play / Pause"
            >
              <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-black" />
            </button>
            <button
              onClick={() => onCommand('FAST_FORWARD')}
              className={`flex-1 py-1 sm:py-1.5 pixel-btn-dark flex items-center justify-center cursor-pointer ${
                activeKey === 'FAST_FORWARD' ? 'pressed' : ''
              }`}
              title="Fast Forward"
            >
              <FastForward className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#38bdf8]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
