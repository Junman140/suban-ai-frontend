'use client';

import React from 'react';
import { AudioWaveform } from './AudioWaveform';
import { CharacterAvatar } from './CharacterAvatar';
import { VisualizationMode } from './VisualizationToggle';
import { VoiceState } from './VoiceCompanion';

interface VoiceVisualizationProps {
  mode: VisualizationMode;
  state: VoiceState;
  audioLevel: number;
  frequencyData?: Uint8Array;
  className?: string;
  characterImageUrl?: string;
}

export const VoiceVisualization: React.FC<VoiceVisualizationProps> = ({
  mode,
  state,
  audioLevel,
  frequencyData,
  className = '',
  characterImageUrl,
}) => {
  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* Visualization Container */}
      <div
        className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-full overflow-hidden transition-all duration-500"
        style={{
          background: mode === 'character' 
            ? 'transparent'
            : 'linear-gradient(135deg, #FFFFFF, #CCCCCC)',
          boxShadow: state === 'speaking' 
            ? '0 0 60px rgba(255, 255, 255, 0.4), 0 0 120px rgba(255, 255, 255, 0.2)'
            : state === 'listening'
            ? '0 0 40px rgba(255, 255, 255, 0.3), 0 0 80px rgba(255, 255, 255, 0.15)'
            : '0 0 20px rgba(255, 255, 255, 0.15), 0 0 40px rgba(255, 255, 255, 0.1)',
        }}
      >
        {mode === 'character' ? (
          <CharacterAvatar
            state={state === 'connecting' ? 'idle' : state}
            imageUrl={characterImageUrl}
            className="w-full h-full"
          />
        ) : (
          <AudioWaveform
            audioLevel={audioLevel}
            frequencyData={frequencyData}
            state={state}
            className="w-full h-full"
          />
        )}
      </div>

      {/* State Indicator Text */}
      <div className="mt-6 text-center">
        <p
          className="text-sm font-normal uppercase tracking-wider text-white"
          style={{ 
            fontFamily: "'Times New Roman', Times, serif",
            color: state === 'error' ? '#ef4444' : '#FFFFFF',
            opacity: state === 'idle' ? 0.7 : 1,
          }}
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
