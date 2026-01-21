'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useVoiceCompanion } from './VoiceCompanion';
import { VoiceVisualization } from './VoiceVisualization';
import { VisualizationMode } from './VisualizationToggle';
import { ConversationTranscript } from './ConversationTranscript';
import { TextChatDrawer } from './TextChatDrawer';
import { SettingsDrawer } from './SettingsDrawer';
import { Sidebar } from './Sidebar';
import { TokenBalance } from './TokenBalance';
import { WalletButton } from './WalletButton';
import { Mic, Square, Loader2, Radio } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { VoiceOption } from './VoiceSelectorDropdown';
import { ModelOption } from './ModelSelectorDropdown';

export const CompanionInterface: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>('character');
  const [isTextChatOpen, setIsTextChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>('Ara');
  const [selectedModel, setSelectedModel] = useState<ModelOption>('grok-4-1-fast-non-reasoning');
  const [unhingedMode, setUnhingedMode] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('visualizationMode') as VisualizationMode;
    if (savedMode === 'character' || savedMode === 'waves') {
      setVisualizationMode(savedMode);
    }

    const savedVoice = localStorage.getItem('selectedVoice') as VoiceOption;
    if (savedVoice && ['Ara', 'Rex', 'Sal', 'Eve', 'Leo'].includes(savedVoice)) {
      setSelectedVoice(savedVoice);
    }

    const savedUnhingedMode = localStorage.getItem('unhingedMode');
    if (savedUnhingedMode === 'true') {
      setUnhingedMode(true);
    }

    const savedModel = localStorage.getItem('selectedModel') as ModelOption;
    if (savedModel && ['grok-4-1-fast-non-reasoning', 'grok-4-1-fast-reasoning'].includes(savedModel)) {
      setSelectedModel(savedModel);
    }
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('visualizationMode', visualizationMode);
  }, [visualizationMode]);

  useEffect(() => {
    localStorage.setItem('selectedVoice', selectedVoice);
  }, [selectedVoice]);

  useEffect(() => {
    localStorage.setItem('unhingedMode', unhingedMode.toString());
  }, [unhingedMode]);

  useEffect(() => {
    localStorage.setItem('selectedModel', selectedModel);
  }, [selectedModel]);

  const {
    state,
    transcripts,
    startSession,
    closeSession,
    startListening,
    stopListening,
    isConnected,
    audioLevel,
    frequencyData,
  } = useVoiceCompanion({
    voice: selectedVoice,
    model: selectedModel,
    unhingedMode: unhingedMode,
    onStateChange: (newState) => {
      if (newState === 'listening') {
        setIsListening(true);
        setErrorMessage(null);
      } else if (newState === 'idle') {
        setIsListening(false);
        setErrorMessage(null);
      } else if (newState === 'error') {
        setIsListening(false);
      }
    },
    onTranscript: (text, isUser) => {
      // Transcripts are automatically added to the transcripts array
    },
    onError: (error) => {
      console.error('Voice companion error:', error);
      setErrorMessage(error);
      setTimeout(() => setErrorMessage(null), 5000);
    },
  });

  const handleVoiceToggle = async () => {
    if (!connected || !publicKey) {
      return;
    }

    if (!isConnected) {
      setErrorMessage(null);
      try {
        await startSession();
      } catch (error: any) {
        console.error('Failed to start session:', error);
        setErrorMessage(error?.message || 'Failed to start voice session');
      }
    } else if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const hasConversationStarted = transcripts.length > 0;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-black">
      {/* Sidebar */}
      <Sidebar
        onTextChatOpen={() => setIsTextChatOpen(true)}
        onSettingsOpen={() => setIsSettingsOpen(true)}
      />

      {/* Header - Wallet UI in top right */}
      <header className="fixed top-2 right-2 lg:right-2 p-2 flex items-center justify-end gap-2 z-40 bg-black border border-white/10 rounded-lg">
        <TokenBalance />
        <WalletButton />
      </header>

      {/* Main Content */}
      <div className="flex-1 lg:ml-[280px] overflow-hidden pt-16">
        <div className={`h-full flex transition-all duration-500 ${
          hasConversationStarted 
            ? 'flex-col lg:flex-row' // Split view when conversation started
            : 'flex-col items-center justify-center' // Centered view initially
        }`}>
          {/* Left Section - Voice Control */}
          <div className={`flex-1 flex flex-col items-center justify-center p-8 lg:p-12 transition-all duration-500 ${
            hasConversationStarted 
              ? 'border-b lg:border-b-0 lg:border-r border-white/10' 
              : ''
          }`}>
            <div className="w-full max-w-md space-y-8">
              {/* Voice Visualization */}
              <VoiceVisualization
                mode={visualizationMode}
                state={state}
                audioLevel={audioLevel}
                frequencyData={frequencyData}
                className="w-full"
              />

              {/* Controls */}
              {connected && publicKey ? (
                <div className="space-y-4">
                  <button
                    onClick={handleVoiceToggle}
                    disabled={state === 'connecting' || state === 'error'}
                    className={`w-full px-6 py-3 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                      isListening
                        ? 'bg-red-600 text-white'
                        : isConnected
                        ? 'bg-white text-black'
                        : 'bg-white text-black hover:bg-gray-100'
                    }`}
                    style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: '1rem', boxShadow: '0 2px 8px rgba(255, 255, 255, 0.1)' }}
                  >
                    {state === 'connecting' && 'Connecting...'}
                    {state === 'idle' && isConnected && (
                      <>
                        <Radio className="w-5 h-5" />
                        <span>Start Talking</span>
                      </>
                    )}
                    {state === 'idle' && !isConnected && (
                      <>
                        <Radio className="w-5 h-5" />
                        <span>Connect Voice</span>
                      </>
                    )}
                    {isListening && (
                      <>
                        <Square className="w-5 h-5" />
                        <span>Stop Listening</span>
                      </>
                    )}
                    {state === 'processing' && (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    )}
                    {state === 'speaking' && (
                      <>
                        <Radio className="w-5 h-5 animate-pulse" />
                        <span>Speaking...</span>
                      </>
                    )}
                    {state === 'error' && 'Error - Try Again'}
                  </button>

                  {isConnected && (
                    <button
                      onClick={closeSession}
                      className="w-full px-4 py-2 bg-white text-black rounded-full hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                      style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: '0.875rem', boxShadow: '0 2px 8px rgba(255, 255, 255, 0.1)' }}
                    >
                      <Square className="w-4 h-4" />
                      <span>Disconnect</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-sm text-white" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                    Connect your wallet to start using the voice companion
                  </p>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/30 text-center">
                  <p className="text-sm text-red-300" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                    {errorMessage}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Transcript (only show when conversation started) */}
          {hasConversationStarted && (
            <div className="flex-1 flex flex-col overflow-hidden pb-20 lg:pb-0">
              <ConversationTranscript transcripts={transcripts} />
            </div>
          )}
        </div>
      </div>

      {/* Settings Drawer */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedVoice={selectedVoice}
        onVoiceChange={setSelectedVoice}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        visualizationMode={visualizationMode}
        onVisualizationModeChange={setVisualizationMode}
        unhingedMode={unhingedMode}
        onUnhingedModeChange={setUnhingedMode}
        isSessionActive={isConnected}
      />

      {/* Text Chat Drawer */}
      <TextChatDrawer isOpen={isTextChatOpen} onClose={() => setIsTextChatOpen(false)} />
    </div>
  );
};
