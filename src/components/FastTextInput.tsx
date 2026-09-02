import React, { useState } from 'react';
import { Send, CornerDownLeft, X, Play, Keyboard } from 'lucide-react';
import { sfx } from '../utils/sfx';

interface FastTextInputProps {
  onSendText: (
    text: string,
    mode?: 'type' | 'youtube_search' | 'global_search',
    submitEnter?: boolean
  ) => void;
  disabled?: boolean;
}

export const FastTextInput: React.FC<FastTextInputProps> = ({ onSendText, disabled }) => {
  const [text, setText] = useState('');
  const [autoEnter, setAutoEnter] = useState(false);

  const handleTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendText(text.trim(), 'type', autoEnter);
    setText('');
  };

  const handleYouTubeSearch = () => {
    if (!text.trim()) return;
    onSendText(text.trim(), 'youtube_search', false);
    setText('');
  };

  return (
    <div className="w-full bg-[#181820] p-2 sm:p-3 border-2 border-black flex flex-col gap-1.5 sm:gap-2">
      {/* Header bar with Auto-Enter toggle */}
      <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-pixel text-[#5cd016]">
        <span className="flex items-center gap-1">
          <span className="text-[#fcbc00]">&gt;&gt;</span> FAST TEXT INPUT
        </span>

        <button
          type="button"
          onClick={() => {
            sfx.playVolume();
            setAutoEnter((prev) => !prev);
          }}
          className={`px-1.5 py-0.5 border border-black flex items-center gap-1 cursor-pointer font-pixel text-[7px] sm:text-[8px] ${
            autoEnter ? 'bg-[#2b2b36] text-[#fcbc00]' : 'bg-[#15151a] text-[#555]'
          }`}
          title="Otomatis tekan Enter / Search setelah mengirim teks"
        >
          <CornerDownLeft className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
          <span>AUTO-ENTER: {autoEnter ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      <form onSubmit={handleTypeSubmit} className="flex flex-col gap-1.5 sm:gap-2">
        <div className="w-full relative flex items-center">
          <input
            type="text"
            value={text}
            disabled={disabled}
            onChange={(e) => setText(e.target.value)}
            placeholder={disabled ? 'Hubungkan TV untuk mengetik...' : 'Ketik judul / pencarian...'}
            className="w-full bg-[#0c1808] border-2 border-black pl-2 pr-6 py-1 sm:py-1.5 font-silkscreen text-[11px] sm:text-xs text-[#5cd016] placeholder:text-[#385c28] focus:outline-none focus:border-[#5cd016]"
          />
          {text && (
            <button
              type="button"
              onClick={() => setText('')}
              className="absolute right-1.5 text-[#666] hover:text-[#d82800] cursor-pointer p-0.5"
              title="Clear text"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Action Buttons: YouTube Deep Search vs Direct Text Input */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleYouTubeSearch}
            disabled={disabled || !text.trim()}
            className="flex-1 py-1 sm:py-1.5 bg-[#d82800] text-white border-2 border-black font-pixel text-[8px] sm:text-[9px] flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-[1px] hover:brightness-110"
            title="Cari video langsung di aplikasi YouTube TV"
          >
            <Play className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-white text-white" />
            <span>YT SEARCH</span>
          </button>

          <button
            type="submit"
            disabled={disabled || !text.trim()}
            className="flex-1 py-1 sm:py-1.5 pixel-btn-gold font-pixel text-[8px] sm:text-[9px] flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-[1px]"
            title="Ketik teks langsung ke input box aktif di TV"
          >
            <Keyboard className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <Send className="w-2 sm:w-2.5 h-2 sm:h-2.5" />
            <span>TYPE TEXT</span>
          </button>
        </div>
      </form>
    </div>
  );
};
