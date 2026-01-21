'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useVoiceCompanion } from './VoiceCompanion';
import { VoiceVisualization } from './VoiceVisualization';
import { VisualizationMode } from '@/types/voice';
import { ConversationTranscript } from './ConversationTranscript';
import { TextChatDrawer } from './TextChatDrawer';
import { TokenBalance } from './TokenBalance';
import { WalletButton } from './WalletButton';
import { MessageSquare, Mic, Square, Settings } from 'lucide-react';
import { VoiceSelector, VoiceOption } from './VoiceSelector';

export const CompanionInterface: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>('character');
  const [isTextChatOpen, setIsTextChatOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>('Ara');

  // Load visualization preference from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('visualizationMode') as VisualizationMode;
    if (savedMode === 'character' || savedMode === 'waves') {
      setVisualizationMode(savedMode);
    }
  }, []);

  // Save visualization preference
  useEffect(() => {
    localStorage.setItem('visualizationMode', visualizationMode);
  }, [visualizationMode]);

  // Load voice preference from localStorage
  useEffect(() => {
    const savedVoice = localStorage.getItem('selectedVoice') as VoiceOption;
    if (savedVoice && ['Ara', 'Rex', 'Sal', 'Eve', 'Leo'].includes(savedVoice)) {
      setSelectedVoice(savedVoice);
    }
  }, []);

  // Save voice preference
  useEffect(() => {
    localStorage.setItem('selectedVoice', selectedVoice);
  }, [selectedVoice]);

  const {
    state,
    transcripts,
    startSession,
    closeSession,
    startListening,
    stopListening,
    isConnected,
    audioLevel,
  } = useVoiceCompanion({
    voice: selectedVoice,
    onStateChange: (newState) => {
      if (newState === 'listening') {
        setIsListening(true);
        setErrorMessage(null); // Clear error when successfully listening
      } else if (newState === 'idle') {
        setIsListening(false);
        // Clear error when successfully connected (idle state after connection)
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
      // Clear error message after 5 seconds
      setTimeout(() => setErrorMessage(null), 5000);
    },
  });

  const handleVoiceToggle = async () => {
    if (!connected || !publicKey) {
      return;
    }

    // Clear any previous error when attempting to connect
    if (!isConnected) {
      setErrorMessage(null);
      console.log('🔵 Starting voice session...');
      try {
        await startSession();
        console.log('✅ Voice session started');
      } catch (error: any) {
        console.error('❌ Failed to start session:', error);
        setErrorMessage(error?.message || 'Failed to start voice session');
      }
    } else if (isListening) {
      stopListening();
    } else {
      // With server_vad, audio is already streaming - just log for debugging
      console.log('🎤 Audio is already streaming (server_vad active)');
      startListening();
    }
  };

  return (
    <div
      className="flex flex-col h-screen w-full overflow-hidden"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 md:px-6 py-4 border-b shrink-0"
        style={{
          borderBottomColor: 'var(--border-subtle)',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(var(--blur-xl))',
          WebkitBackdropFilter: 'blur(var(--blur-xl))',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            }}
          >
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-lg font-semibold leading-tight" style={{ color: 'var(--text)' }}>
              Justin Lee AI
            </h1>
            <p className="text-xs opacity-60 leading-tight" style={{ color: 'var(--text-secondary)' }}>
              Voice Companion
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {connected && <TokenBalance />}
          {connected && (
            <VoiceSelector
              selectedVoice={selectedVoice}
              onVoiceChange={setSelectedVoice}
              disabled={isConnected}
              className="hidden md:flex"
            />
          )}
          <button
            onClick={() => setIsTextChatOpen(true)}
            className="p-2 rounded-lg hover:bg-hover transition-colors flex items-center justify-center"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Open text chat"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <WalletButton />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12 overflow-hidden">
        {/* Voice Visualization */}
        <div className="mb-8 md:mb-12">
          <VoiceVisualization
            mode={visualizationMode}
            state={state}
            audioLevel={audioLevel}
            onModeChange={setVisualizationMode}
            className="w-full max-w-md"
          />
        </div>

        {/* Voice Selector (when not connected) */}
        {connected && publicKey && !isConnected && (
          <div className="mb-6 w-full max-w-md">
            <VoiceSelector
              selectedVoice={selectedVoice}
              onVoiceChange={setSelectedVoice}
              disabled={false}
            />
          </div>
        )}

        {/* Voice Control Buttons */}
        {connected && publicKey && (
          <div className="flex flex-col items-center gap-3 mb-8">
            <button
              onClick={handleVoiceToggle}
              disabled={state === 'connecting' || state === 'error'}
              className={`px-8 py-4 rounded-2xl font-medium text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                isListening ? 'animate-pulse' : ''
              }`}
              style={
                isListening
                  ? {
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: 'white',
                      boxShadow: '0 0 30px rgba(239, 68, 68, 0.5)',
                    }
                  : isConnected
                  ? {
                      background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                      color: 'white',
                      boxShadow: 'var(--shadow-lg)',
                    }
                  : {
                      background: 'var(--glass-bg)',
                      backdropFilter: 'blur(var(--blur-md))',
                      WebkitBackdropFilter: 'blur(var(--blur-md))',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text)',
                    }
              }
            >
              {state === 'connecting' && 'Connecting...'}
              {state === 'idle' && isConnected && (
                <>
                  <Mic className="w-5 h-5" />
                  <span>Start Talking</span>
                </>
              )}
              {state === 'idle' && !isConnected && (
                <>
                  <Mic className="w-5 h-5" />
                  <span>Connect Voice</span>
                </>
              )}
              {isListening && (
                <>
                  <Square className="w-5 h-5" />
                  <span>Stop Listening</span>
                </>
              )}
              {state === 'processing' && 'Processing...'}
              {state === 'speaking' && 'Speaking...'}
              {state === 'error' && 'Error - Try Again'}
            </button>
            
            {/* Disconnect Button */}
            {isConnected && (
              <button
                onClick={closeSession}
                className="px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                style={{
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(var(--blur-md))',
                  WebkitBackdropFilter: 'blur(var(--blur-md))',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-secondary)',
                }}
              >
                <Square className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            )}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div
            className="mb-4 p-4 rounded-2xl text-center max-w-md"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <p className="text-sm font-medium" style={{ color: '#ef4444' }}>
              {errorMessage}
            </p>
          </div>
        )}

        {/* Connection Prompt */}
        {(!connected || !publicKey) && (
          <div
            className="p-6 rounded-2xl text-center max-w-md"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(var(--blur-lg))',
              WebkitBackdropFilter: 'blur(var(--blur-lg))',
              border: '1px solid var(--glass-border)',
            }}
          >
            <p className="text-sm opacity-70 mb-4" style={{ color: 'var(--text-secondary)' }}>
              Connect your wallet to start using the voice companion
            </p>
          </div>
        )}

        {/* Conversation Transcript */}
        {connected && transcripts.length > 0 && (
          <div className="w-full max-w-2xl mt-8">
            <ConversationTranscript transcripts={transcripts} />
          </div>
        )}
      </div>

      {/* Text Chat Drawer */}
      <TextChatDrawer isOpen={isTextChatOpen} onClose={() => setIsTextChatOpen(false)} />
    </div>
  );
};
