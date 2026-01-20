'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useVoiceCompanion } from './VoiceCompanion';
import { VoiceVisualization, VisualizationMode } from './VoiceVisualization';
import { ConversationTranscript } from './ConversationTranscript';
import { TextChatDrawer } from './TextChatDrawer';
import { TokenBalance } from './TokenBalance';
import { WalletButton } from './WalletButton';
import { MessageSquare, Mic, Square, Settings } from 'lucide-react';

export const CompanionInterface: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>('character');
  const [isTextChatOpen, setIsTextChatOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

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

  const {
    state,
    transcripts,
    startSession,
    startListening,
    stopListening,
    isConnected,
    audioLevel,
  } = useVoiceCompanion({
    onStateChange: (newState) => {
      if (newState === 'listening') {
        setIsListening(true);
      } else if (newState === 'idle' || newState === 'error') {
        setIsListening(false);
      }
    },
    onTranscript: (text, isUser) => {
      // Transcripts are automatically added to the transcripts array
    },
    onError: (error) => {
      console.error('Voice companion error:', error);
    },
  });

  const handleVoiceToggle = () => {
    if (!connected || !publicKey) {
      return;
    }

    if (!isConnected) {
      startSession();
    } else if (isListening) {
      stopListening();
    } else {
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

        {/* Voice Control Button */}
        {connected && publicKey && (
          <button
            onClick={handleVoiceToggle}
            disabled={state === 'connecting' || state === 'error'}
            className={`mb-8 px-8 py-4 rounded-2xl font-medium text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
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
