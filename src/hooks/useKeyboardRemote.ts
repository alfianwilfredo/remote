import { useEffect } from 'react';
import type { RemoteCommand } from '../types/remote';

interface UseKeyboardRemoteOptions {
  onCommand: (cmd: RemoteCommand) => void;
  enabled?: boolean;
}

export function useKeyboardRemote({ onCommand, enabled = true }: UseKeyboardRemoteOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        // If Escape is pressed inside input, blur it
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      let cmd: RemoteCommand | null = null;

      switch (e.key) {
        case 'ArrowUp':
          cmd = 'UP';
          break;
        case 'ArrowDown':
          cmd = 'DOWN';
          break;
        case 'ArrowLeft':
          cmd = 'LEFT';
          break;
        case 'ArrowRight':
          cmd = 'RIGHT';
          break;
        case 'Enter':
        case ' ':
          cmd = 'OK';
          break;
        case 'Escape':
        case 'Backspace':
        case 'b':
        case 'B':
          cmd = 'BACK';
          break;
        case 'h':
        case 'H':
          cmd = 'HOME';
          break;
        case 'm':
        case 'M':
          cmd = 'MUTE';
          break;
        case '+':
        case '=':
          cmd = 'VOLUME_UP';
          break;
        case '-':
        case '_':
          cmd = 'VOLUME_DOWN';
          break;
        case 'p':
        case 'P':
          cmd = 'POWER';
          break;
      }

      if (cmd) {
        e.preventDefault();
        onCommand(cmd);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCommand, enabled]);
}
