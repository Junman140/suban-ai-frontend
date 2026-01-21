'use client';

import React from 'react';
import { X } from 'lucide-react';
import { VoiceSelectorDropdown, VoiceOption } from './VoiceSelectorDropdown';
import { VisualizationToggle, VisualizationMode } from './VisualizationToggle';
import { ModelSelectorDropdown, ModelOption } from './ModelSelectorDropdown';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVoice: VoiceOption;
  onVoiceChange: (voice: VoiceOption) => void;
  selectedModel: ModelOption;
  onModelChange: (model: ModelOption) => void;
  visualizationMode: VisualizationMode;
  onVisualizationModeChange: (mode: VisualizationMode) => void;
  unhingedMode: boolean;
  onUnhingedModeChange: (enabled: boolean) => void;
  isSessionActive: boolean;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  selectedVoice,
  onVoiceChange,
  selectedModel,
  onModelChange,
  visualizationMode,
  onVisualizationModeChange,
  unhingedMode,
  onUnhingedModeChange,
  isSessionActive,
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-200"
          onClick={onClose}
        />
      )}

      {/* Popup Modal */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md z-50 bg-neutral-900 shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Close Button - Top Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
          aria-label="Close settings"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="h-full overflow-y-auto px-6 py-8">
          {/* Voice Section */}
          <section className="mb-10">
            <h3 className="text-sm font-medium text-neutral-100 mb-4">Voice</h3>
            <VoiceSelectorDropdown
              selectedVoice={selectedVoice}
              onVoiceChange={onVoiceChange}
              disabled={isSessionActive}
            />
          </section>

          {/* Model Section */}
          <section className="mb-10">
            <h3 className="text-sm font-medium text-neutral-100 mb-4">Model</h3>
            <ModelSelectorDropdown
              selectedModel={selectedModel}
              onModelChange={onModelChange}
              disabled={isSessionActive}
            />
          </section>

          {/* Visualization Section */}
          <section className="mb-10">
            <h3 className="text-sm font-medium text-neutral-100 mb-4">Display Mode</h3>
            <div className="mb-3">
              <VisualizationToggle
                mode={visualizationMode}
                onChange={onVisualizationModeChange}
              />
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              {visualizationMode === 'character'
                ? 'Showing character avatar and expressions'
                : 'Showing audio waveform visualization'}
            </p>
          </section>

          {/* Personality Section */}
          <section className="mb-10">
            <h3 className="text-sm font-medium text-neutral-100 mb-4">Personality</h3>
            
            {/* Unhinged Mode Tool Card */}
            <div className="flex items-start justify-between gap-6 p-5 bg-neutral-800/30 border border-neutral-700/50 mb-5">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 flex items-center justify-center bg-neutral-700/50 flex-shrink-0">
                  <span className="text-lg">💬</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-neutral-100 mb-2">Unhinged Mode</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Casual, expressive, and human-like conversation style
                  </p>
                </div>
              </div>
              <button
                onClick={() => !isSessionActive && onUnhingedModeChange(!unhingedMode)}
                disabled={isSessionActive}
                className={`relative flex h-7 w-12 items-center transition-all duration-200 flex-shrink-0 border border-transparent ${
                  unhingedMode
                    ? 'bg-orange-500'
                    : 'bg-neutral-700'
                } ${isSessionActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                aria-label="Toggle unhinged mode"
                aria-pressed={unhingedMode}
              >
                <span
                  className={`inline-block h-5 w-5 bg-white transition-transform duration-200 rounded-none ${
                    unhingedMode ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Status Messages */}
            {isSessionActive && (
              <div className="p-4 mb-5 bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-300 leading-relaxed">
                  Disconnect the session to modify personality settings
                </p>
              </div>
            )}

            {unhingedMode && !isSessionActive && (
              <div className="p-4 mb-5 bg-orange-500/10 border border-orange-500/20">
                <p className="text-xs text-orange-300 leading-relaxed">
                  Mode active: Embrace the expressive, human-like tone
                </p>
              </div>
            )}
          </section>

          {/* Session Active Banner */}
          {isSessionActive && (
            <div className="mb-10 flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/20">
              <div className="w-2 h-2 bg-amber-400 animate-pulse flex-shrink-0" />
              <span className="text-sm font-medium text-amber-300">Session active</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="sticky bottom-0 pt-8 pb-6 bg-neutral-900 border-t border-neutral-800 mt-8">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => {
                  // Reset to defaults logic can be added here
                  onUnhingedModeChange(false);
                }}
                className="px-5 py-2.5 text-sm font-medium text-neutral-300 border border-neutral-700 hover:bg-neutral-800 transition-colors"
              >
                Reset to defaults
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-neutral-100 bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
