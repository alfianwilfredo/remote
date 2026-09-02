import React from 'react';
import type { RemoteCommand } from '../types/remote';

interface DPadProps {
  onCommand: (cmd: RemoteCommand) => void;
  activeKey: RemoteCommand | null;
}

export const DPad: React.FC<DPadProps> = ({ onCommand, activeKey }) => {
  return (
    <div className="flex flex-col items-center justify-center p-1 sm:p-2">
      {/* 3x3 Grid NES Cross Layout */}
      <div className="relative w-40 h-40 sm:w-44 sm:h-44 bg-[#18181e] p-1.5 sm:p-2 border-3 sm:border-4 border-black box-shadow-pixel flex items-center justify-center">
        {/* Center Cross Body */}
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center">
          {/* UP Button */}
          <button
            onClick={() => onCommand('UP')}
            className={`absolute top-0 w-11 sm:w-12 h-12 sm:h-14 pixel-btn-dark flex flex-col items-center justify-start pt-1 font-pixel text-xs cursor-pointer z-10 ${
              activeKey === 'UP' ? 'pressed' : ''
            }`}
            title="D-Pad Up (Keyboard: Up Arrow)"
          >
            <span className="text-[#fcbc00] text-xs sm:text-sm">▲</span>
          </button>

          {/* DOWN Button */}
          <button
            onClick={() => onCommand('DOWN')}
            className={`absolute bottom-0 w-11 sm:w-12 h-12 sm:h-14 pixel-btn-dark flex flex-col items-center justify-end pb-1 font-pixel text-xs cursor-pointer z-10 ${
              activeKey === 'DOWN' ? 'pressed' : ''
            }`}
            title="D-Pad Down (Keyboard: Down Arrow)"
          >
            <span className="text-[#fcbc00] text-xs sm:text-sm">▼</span>
          </button>

          {/* LEFT Button */}
          <button
            onClick={() => onCommand('LEFT')}
            className={`absolute left-0 w-12 sm:w-14 h-11 sm:h-12 pixel-btn-dark flex items-center justify-start pl-1 font-pixel text-xs cursor-pointer z-10 ${
              activeKey === 'LEFT' ? 'pressed' : ''
            }`}
            title="D-Pad Left (Keyboard: Left Arrow)"
          >
            <span className="text-[#fcbc00] text-xs sm:text-sm">◀</span>
          </button>

          {/* RIGHT Button */}
          <button
            onClick={() => onCommand('RIGHT')}
            className={`absolute right-0 w-12 sm:w-14 h-11 sm:h-12 pixel-btn-dark flex items-center justify-end pr-1 font-pixel text-xs cursor-pointer z-10 ${
              activeKey === 'RIGHT' ? 'pressed' : ''
            }`}
            title="D-Pad Right (Keyboard: Right Arrow)"
          >
            <span className="text-[#fcbc00] text-xs sm:text-sm">▶</span>
          </button>

          {/* CENTER / OK Button */}
          <button
            onClick={() => onCommand('OK')}
            className={`w-11 sm:w-12 h-11 sm:h-12 pixel-btn-red rounded-none flex items-center justify-center font-pixel text-[10px] sm:text-[11px] font-bold cursor-pointer z-20 ${
              activeKey === 'OK' ? 'pressed' : ''
            }`}
            title="Select / OK (Keyboard: Enter or Space)"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
