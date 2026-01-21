'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export type VoiceOption = 'Ara' | 'Rex' | 'Sal' | 'Eve' | 'Leo';

interface VoiceSelectorDropdownProps {
  selectedVoice: VoiceOption;
  onVoiceChange: (voice: VoiceOption) => void;
  disabled?: boolean;
  className?: string;
}

const VOICE_OPTIONS: Array<{ value: VoiceOption; label: string; description: string }> = [
  { value: 'Ara', label: 'Ara', description: 'Warm, friendly' },
  { value: 'Rex', label: 'Rex', description: 'Confident, clear' },
  { value: 'Sal', label: 'Sal', description: 'Smooth, balanced' },
  { value: 'Eve', label: 'Eve', description: 'Energetic, upbeat' },
  { value: 'Leo', label: 'Leo', description: 'Authoritative, strong' },
];

export const VoiceSelectorDropdown: React.FC<VoiceSelectorDropdownProps> = ({
  selectedVoice,
  onVoiceChange,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = VOICE_OPTIONS.find((opt) => opt.value === selectedVoice);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-3 border border-neutral-700 bg-neutral-800/50 text-neutral-100 text-left flex items-center justify-between transition-all ${
          disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:border-neutral-600 cursor-pointer'
        }`}
        aria-label="Select voice"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-sm text-neutral-100 leading-none">{selectedOption?.label}</span>
        <ChevronDown
          className={`w-4 h-4 text-neutral-400 transition-transform duration-200 flex-shrink-0 ml-3 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && !disabled && (
        <div
          className="absolute z-50 w-full mt-2 bg-neutral-900/95 backdrop-blur-md border-2 border-neutral-700/60 rounded-xl shadow-2xl max-h-64 overflow-y-auto"
        >
          <div role="listbox" className="p-1.5">
            {VOICE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onVoiceChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all rounded-lg ${
                  selectedVoice === option.value
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-md'
                    : 'text-neutral-300 hover:bg-neutral-800/70 border border-transparent'
                }`}
                role="option"
                aria-selected={selectedVoice === option.value}
              >
                {selectedVoice === option.value && (
                  <Check className="w-5 h-5 flex-shrink-0 text-blue-400" />
                )}
                <div className="flex-1">
                  <div className="text-sm font-semibold">{option.label}</div>
                  <div className={`text-xs ${selectedVoice === option.value ? 'text-blue-300/80' : 'text-neutral-400'}`}>
                    {option.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
