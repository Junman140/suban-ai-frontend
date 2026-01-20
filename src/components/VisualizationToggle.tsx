'use client';

import React from 'react';
import { User, Waves } from 'lucide-react';

export type VisualizationMode = 'character' | 'waves';

interface VisualizationToggleProps {
  mode: VisualizationMode;
  onChange: (mode: VisualizationMode) => void;
  className?: string;
}

export const VisualizationToggle: React.FC<VisualizationToggleProps> = ({
  mode,
  onChange,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center gap-2 p-1 rounded-xl ${className}`}
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(var(--blur-md))',
        WebkitBackdropFilter: 'blur(var(--blur-md))',
        border: '1px solid var(--glass-border)',
      }}
    >
      <button
        onClick={() => onChange('character')}
        className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
          mode === 'character' ? 'opacity-100' : 'opacity-50 hover:opacity-75'
        }`}
        style={{
          background: mode === 'character' ? 'var(--bg-hover)' : 'transparent',
          color: 'var(--text)',
        }}
        aria-label="Character mode"
      >
        <User className="w-4 h-4" />
      </button>
      <button
        onClick={() => onChange('waves')}
        className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
          mode === 'waves' ? 'opacity-100' : 'opacity-50 hover:opacity-75'
        }`}
        style={{
          background: mode === 'waves' ? 'var(--bg-hover)' : 'transparent',
          color: 'var(--text)',
        }}
        aria-label="Waves mode"
      >
        <Waves className="w-4 h-4" />
      </button>
    </div>
  );
};
