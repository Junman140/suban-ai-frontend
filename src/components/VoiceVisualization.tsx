'use client';

import React from 'react';
import { AudioWaveform } from './AudioWaveform';
import { CharacterAvatar } from './CharacterAvatar';
import { VisualizationToggle, VisualizationMode } from './VisualizationToggle';
import { VoiceState } from './VoiceCompanion';

interface VoiceVisualizationProps {
  mode: VisualizationMode;
  state: VoiceState;
  audioLevel: number;
  onModeChange: (mode: VisualizationMode) => void;
  className?: string;
  characterImageUrl?: string;
}

export const VoiceVisualization: React.FC<VoiceVisualizationProps> = ({
  mode,
  state,
  audioLevel,
  onModeChange,
  className = '',
  characterImageUrl,
}) => {
  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* Toggle Button */}
      <div className="absolute top-4 right-4 z-10">
        <VisualizationToggle mode={mode} onChange={onModeChange} />
      </div>

      {/* Visualization Container */}
      <div
        className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden transition-all duration-500"
        style={{
          background: mode === 'character' 
            ? 'transparent'
            : 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          boxShadow: state === 'speaking' 
            ? '0 0 60px rgba(139, 92, 246, 0.6)'
            : state === 'listening'
            ? '0 0 40px rgba(99, 102, 241, 0.5)'
            : '0 0 30px rgba(99, 102, 241, 0.3)',
        }}
      >
        {mode === 'character' ? (
          <CharacterAvatar
            state={state}
            imageUrl={characterImageUrl}
            className="w-full h-full"
          />
        ) : (
          <AudioWaveform
            audioLevel={audioLevel}
            state={state}
            className="w-full h-full"
          />
        )}
      </div>

      {/* State Indicator Text */}
      <div className="mt-6 text-center">
        <p
          className="text-sm md:text-base font-medium capitalize"
          style={{ color: 'var(--text-secondary)' }}
        >
          {state === 'idle' && 'Ready to talk'}
          {state === 'connecting' && 'Connecting...'}
          {state === 'listening' && 'Listening...'}
          {state === 'processing' && 'Processing...'}
          {state === 'speaking' && 'Speaking...'}
          {state === 'error' && 'Error occurred'}
        </p>
      </div>
    </div>
  );
};
