'use client';

import React, { useState } from 'react';

interface CharacterAvatarProps {
  state: 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
  className?: string;
  imageUrl?: string;
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({ 
  state, 
  className = '',
  imageUrl = '/placeholder-character.png' // Placeholder - replace with your character image
}) => {
  const [imageError, setImageError] = useState(false);

  // Animation classes based on state
  const getAnimationClass = () => {
    switch (state) {
      case 'idle':
        return 'animate-pulse-glow';
      case 'listening':
        return 'scale-105 transition-transform duration-200';
      case 'processing':
        return 'animate-spin-slow';
      case 'speaking':
        return 'scale-110 transition-transform duration-200';
      case 'error':
        return 'animate-pulse';
      default:
        return '';
    }
  };

  // Filter/overlay based on state
  const getStateStyle = () => {
    switch (state) {
      case 'error':
        return {
          filter: 'hue-rotate(0deg) saturate(1.5)',
          boxShadow: '0 0 30px rgba(239, 68, 68, 0.5)',
        };
      case 'listening':
        return {
          filter: 'brightness(1.1)',
          boxShadow: '0 0 30px rgba(99, 102, 241, 0.5)',
        };
      case 'speaking':
        return {
          filter: 'brightness(1.15)',
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)',
        };
      case 'processing':
        return {
          filter: 'brightness(1.05)',
          boxShadow: '0 0 25px rgba(245, 158, 11, 0.4)',
        };
      default:
        return {
          filter: 'brightness(1)',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
        };
    }
  };

  return (
    <div
      className={`relative ${className} ${getAnimationClass()}`}
      style={{
        ...getStateStyle(),
        transition: 'all 0.3s ease-in-out',
      }}
    >
      {/* Character Image */}
      <div 
        className="relative w-full h-full rounded-full overflow-hidden"
        style={
          imageError
            ? {
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              }
            : {}
        }
      >
        {!imageError && (
          <img
            src={imageUrl}
            alt="AI Companion Character"
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        )}
        {imageError && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-1/2 h-1/2 rounded-full bg-white/20" />
          </div>
        )}
      </div>

      {/* State Indicator Overlay */}
      {state === 'listening' && (
        <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping opacity-75" />
      )}
      {state === 'speaking' && (
        <div className="absolute inset-0 rounded-full border-4 border-purple-400 animate-pulse" />
      )}
      {state === 'error' && (
        <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-pulse" />
      )}

      {/* Microphone indicator for listening state */}
      {state === 'listening' && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
};

// Add custom animation for slow spin
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-spin-slow {
      animation: spin-slow 3s linear infinite;
    }
  `;
  document.head.appendChild(style);
}
