import React from 'react';
import { POPULAR_APPS } from '../utils/keycodes';

interface QuickAppCartridgesProps {
  onLaunchApp: (appUrlOrPkg: string) => void;
  activeApp?: string;
}

export const QuickAppCartridges: React.FC<QuickAppCartridgesProps> = ({
  onLaunchApp,
  activeApp,
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5 sm:gap-2">
      <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-pixel text-[#888899] px-0.5">
        <span>APP CARTRIDGES</span>
        <span>1-CLICK LAUNCH</span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {POPULAR_APPS.map((app) => {
          const isActive =
            activeApp &&
            (activeApp.includes(app.id.toUpperCase()) ||
              activeApp.includes(app.name.toUpperCase()));

          return (
            <button
              key={app.id}
              onClick={() => onLaunchApp(app.deepLink || app.packageName)}
              className={`p-1.5 sm:p-2 border-2 border-black flex flex-col items-center justify-center gap-1 sm:gap-1.5 cursor-pointer relative overflow-hidden transition-transform active:translate-y-[1px] ${
                isActive
                  ? 'bg-[#2a2a38] border-[#fcbc00]'
                  : 'bg-[#181822] hover:bg-[#20202c]'
              }`}
              style={{
                boxShadow: isActive
                  ? '0 0 8px rgba(252, 188, 0, 0.4), inset 0 2px 0 #444'
                  : 'inset 0 2px 0 #333, inset 0 -2px 0 #000',
              }}
              title={`Launch ${app.name} on TV`}
            >
              {/* Cartridge Notch / Top Bar */}
              <div
                className="w-full h-1 mb-0.5"
                style={{ backgroundColor: app.color }}
              />

              {/* Badge */}
              <span
                className="px-1 py-0.5 font-pixel text-[7px] sm:text-[8px] font-bold text-white rounded-none leading-none"
                style={{ backgroundColor: app.color }}
              >
                {app.badge}
              </span>

              {/* App Label */}
              <span className="font-pixel text-[7px] sm:text-[8px] text-[#e0e0e0] truncate max-w-full">
                {app.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
