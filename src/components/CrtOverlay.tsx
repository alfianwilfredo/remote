import React from 'react';

interface CrtOverlayProps {
  enabled: boolean;
}

export const CrtOverlay: React.FC<CrtOverlayProps> = ({ enabled }) => {
  if (!enabled) return null;

  return (
    <div 
      className="fixed inset-0 crt-overlay z-50 pointer-events-none opacity-60" 
      aria-hidden="true"
    />
  );
};
