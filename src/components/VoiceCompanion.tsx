'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { createVoiceSession, closeVoiceSession } from '@/lib/api';

export type VoiceState = 'idle' | 'connecting' | 'listening' | 'processing' | 'speaking' | 'error';

export interface UseVoiceCompanionReturn {
  state: VoiceState;
  sessionId: string | null;
  transcripts: Array<{ text: string; isUser: boolean; timestamp: number }>;
  startSession: () => Promise<void>;
  startListening: () => void;
  stopListening: () => void;
  isConnected: boolean;
  audioLevel: number;
}

export interface UseVoiceCompanionOptions {
  onStateChange?: (state: VoiceState) => void;
  onTranscript?: (text: string, isUser: boolean) => void;
  onError?: (error: string) => void;
}

export const useVoiceCompanion = (options: UseVoiceCompanionOptions = {}): UseVoiceCompanionReturn => {
  const { connected, publicKey } = useWallet();
  const { onStateChange, onTranscript, onError } = options;
  
  const [state, setState] = useState<VoiceState>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<Array<{ text: string; isUser: boolean; timestamp: number }>>([]);
  const [audioLevel, setAudioLevel] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const updateState = useCallback((newState: VoiceState) => {
    setState(newState);
    onStateChange?.(newState);
  }, [onStateChange]);

  // Audio level detection
  const detectAudioLevel = useCallback(() => {
    if (!analyserRef.current || state === 'idle' || state === 'error') {
      return;
    }

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    const normalizedLevel = Math.min(average / 255, 1);
    
    setAudioLevel(normalizedLevel);

    if (state !== 'idle' && state !== 'error') {
      animationFrameRef.current = requestAnimationFrame(detectAudioLevel);
    }
  }, [state]);

  // Initialize audio context and analyser
  const initializeAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      // Start MediaRecorder for sending audio
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Audio = (reader.result as string).split(',')[1];
            wsRef.current?.send(JSON.stringify({
              type: 'audio',
              data: base64Audio,
            }));
          };
          reader.readAsDataURL(audioBlob);
          audioChunksRef.current = [];
        }
      };

      // Start audio level detection
      detectAudioLevel();
    } catch (err) {
      console.error('Error initializing audio:', err);
      updateState('error');
      onError?.('Failed to access microphone. Please check permissions.');
    }
  }, [detectAudioLevel, updateState, onError]);

  // Create voice session and connect WebSocket
  const startSession = useCallback(async () => {
    if (!connected || !publicKey) {
      onError?.('Please connect your wallet first');
      return;
    }

    try {
      updateState('connecting');

      // Initialize audio first
      await initializeAudio();

      // Create voice session
      const session = await createVoiceSession({
        walletAddress: publicKey.toString(),
        voice: 'Ara',
        model: 'grok-4-1-fast-non-reasoning',
      });

      setSessionId(session.sessionId);

      // Connect WebSocket
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
      const wsBaseUrl = apiUrl.replace(/^https?:\/\//, '');
      const wsUrl = `${wsProtocol}://${wsBaseUrl}${session.wsUrl}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        updateState('idle');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'audio':
              // Play received audio
              if (data.data) {
                const audio = new Audio(`data:audio/webm;base64,${data.data}`);
                audio.play().catch(console.error);
                updateState('speaking');
                audio.onended = () => {
                  if (state !== 'listening') {
                    updateState('idle');
                  }
                };
              }
              break;

            case 'transcript':
              if (data.text) {
                const isUser = data.isUser || false;
                const transcript = { text: data.text, isUser, timestamp: Date.now() };
                setTranscripts((prev) => [...prev, transcript]);
                onTranscript?.(data.text, isUser);
              }
              break;

            case 'response_done':
              updateState('idle');
              break;

            case 'error':
              updateState('error');
              onError?.(data.message || 'An error occurred');
              break;
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        updateState('error');
        onError?.('Connection error. Please try again.');
      };

      ws.onclose = () => {
        updateState('idle');
        setSessionId(null);
      };

      wsRef.current = ws;
    } catch (err: any) {
      console.error('Error starting session:', err);
      updateState('error');
      
      // Handle specific error cases
      if (err.response?.status === 503) {
        const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Voice service not configured';
        onError?.(errorMessage);
      } else if (err.response?.status === 402) {
        const errorMessage = err.response?.data?.error || 'Insufficient tokens';
        onError?.(errorMessage);
      } else {
        const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to start voice session';
        onError?.(errorMessage);
      }
    }
  }, [connected, publicKey, initializeAudio, updateState, onError, onTranscript, state]);

  // Start/stop listening
  const startListening = useCallback(() => {
    if (state === 'idle' && mediaRecorderRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
      mediaRecorderRef.current.start(100); // Collect chunks every 100ms
      updateState('listening');
      detectAudioLevel();
    }
  }, [state, updateState, detectAudioLevel]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && state === 'listening') {
      mediaRecorderRef.current.stop();
      updateState('processing');
    }
  }, [state, updateState]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (sessionId) {
        closeVoiceSession(sessionId).catch(console.error);
      }
    };
  }, [sessionId]);

  return {
    state,
    sessionId,
    transcripts,
    startSession,
    startListening,
    stopListening,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    audioLevel,
  };
};
