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
  closeSession: () => Promise<void>;
  startListening: () => void;
  stopListening: () => void;
  isConnected: boolean;
  audioLevel: number;
}

export interface UseVoiceCompanionOptions {
  onStateChange?: (state: VoiceState) => void;
  onTranscript?: (text: string, isUser: boolean) => void;
  onError?: (error: string) => void;
  voice?: 'Ara' | 'Rex' | 'Sal' | 'Eve' | 'Leo';
}

export const useVoiceCompanion = (options: UseVoiceCompanionOptions = {}): UseVoiceCompanionReturn => {
  const { connected, publicKey } = useWallet();
  const { onStateChange, onTranscript, onError, voice = 'Ara' } = options;
  
  const [state, setState] = useState<VoiceState>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<Array<{ text: string; isUser: boolean; timestamp: number }>>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const currentAssistantTranscriptRef = useRef<string>('');

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackTimeRef = useRef<number>(0);
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
    if (!analyserRef.current) {
      return;
    }

    // Only stop if in error state - allow detection in idle/connected state
    if (state === 'error') {
      return;
    }

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    const normalizedLevel = Math.min(average / 255, 1);
    
    setAudioLevel(normalizedLevel);

    // Continue animation frame
    animationFrameRef.current = requestAnimationFrame(detectAudioLevel);
  }, [state]);

  // Initialize audio context and analyser
  const initializeAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Prefer a 24kHz AudioContext to match Grok Voice Agent default PCM rate
      // (helps avoid resampling artifacts / "chipmunk" / "double voice" effects)
      const AC = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
      const audioContext = new AC({ sampleRate: 24000 } as any);
      audioContextRef.current = audioContext;
      playbackTimeRef.current = audioContext.currentTime;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      // Create ScriptProcessorNode for PCM16 audio conversion
      // Note: ScriptProcessorNode is deprecated but works for this use case
      // With server_vad, audio streams continuously - the server detects speech automatically
      const bufferSize = 4096;
      const scriptProcessor = audioContext.createScriptProcessor(bufferSize, 1, 1);
      
      // Grok expects 24kHz, but browser AudioContext is usually 44.1kHz or 48kHz
      const targetSampleRate = 24000;
      const sourceSampleRate = audioContext.sampleRate;
      const resampleRatio = targetSampleRate / sourceSampleRate;
      
      let audioSendCount = 0;
      scriptProcessor.onaudioprocess = (event) => {
        // Always send audio when WebSocket is open (server_vad handles speech detection)
        // Check WebSocket state before processing to avoid errors
        if (wsRef.current?.readyState === WebSocket.OPEN && mediaStreamRef.current) {
          try {
            const inputData = event.inputBuffer.getChannelData(0);
            
            // Resample from source rate to 24kHz (only if needed)
            const resampled =
              sourceSampleRate === targetSampleRate
                ? inputData
                : (() => {
                    const resampledLength = Math.floor(inputData.length * resampleRatio);
                    const out = new Float32Array(resampledLength);
                    // Simple linear interpolation resampling (good enough for speech)
                    for (let i = 0; i < resampledLength; i++) {
                      const srcIndex = i / resampleRatio;
                      const srcIndexFloor = Math.floor(srcIndex);
                      const srcIndexCeil = Math.min(srcIndexFloor + 1, inputData.length - 1);
                      const t = srcIndex - srcIndexFloor;
                      out[i] = inputData[srcIndexFloor] * (1 - t) + inputData[srcIndexCeil] * t;
                    }
                    return out;
                  })();
            
            // Convert Float32Array to Int16Array (PCM16)
            const pcm16 = new Int16Array(resampled.length);
            for (let i = 0; i < resampled.length; i++) {
              const s = Math.max(-1, Math.min(1, resampled[i]));
              pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }
            
            // Convert to base64
            const bytes = new Uint8Array(pcm16.buffer);
            const base64Audio = btoa(String.fromCharCode(...bytes));
            
            // Debug: log first few audio sends
            if (audioSendCount < 3) {
              console.log('📤 Sending audio chunk', { 
                count: audioSendCount + 1, 
                size: base64Audio.length,
                sourceRate: sourceSampleRate,
                targetRate: targetSampleRate,
                originalLength: inputData.length,
                resampledLength: resampled.length
              });
              audioSendCount++;
            }
            
            // Double-check WebSocket is still open before sending
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({
                type: 'audio',
                data: base64Audio,
              }));
            }
          } catch (err: any) {
            // WebSocket might be closed - silently fail (don't spam console)
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              console.warn('⚠️ Failed to send audio chunk:', err.message);
            }
          }
        }
      };
      source.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);

      // Store script processor for cleanup
      (mediaRecorderRef as any).current = scriptProcessor;

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
      const error = 'Please connect your wallet first';
      onError?.(error);
      throw new Error(error);
    }

    try {
      console.log('🚀 Starting voice session...');
      updateState('connecting');

      // Initialize audio first
      console.log('🎤 Initializing audio...');
      await initializeAudio();
      console.log('✅ Audio initialized');

      // Create voice session
      console.log('📞 Creating voice session...');
      const session = await createVoiceSession({
        walletAddress: publicKey.toString(),
        voice: voice,
        model: 'grok-4-1-fast-non-reasoning',
      });
      console.log('✅ Voice session created:', session.sessionId);

      setSessionId(session.sessionId);

      // Connect WebSocket
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
      const wsBaseUrl = apiUrl.replace(/^https?:\/\//, '');
      const wsUrl = `${wsProtocol}://${wsBaseUrl}${session.wsUrl}`;
      console.log('🔌 Connecting to WebSocket:', wsUrl);
      console.log('📝 Session ID:', session.sessionId);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        console.log('🎤 Audio streaming started (server_vad will detect speech automatically)');
        // With server_vad, audio is already streaming, just wait for speech detection
        updateState('idle');
        // Start audio level detection for UI feedback
        detectAudioLevel();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'audio':
              // Play received PCM16 audio
              if (data.data && audioContextRef.current) {
                try {
                  // Decode base64 PCM16 to Float32Array
                  const binaryString = atob(data.data);
                  const bytes = new Uint8Array(binaryString.length);
                  for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                  }
                  const pcm16 = new Int16Array(bytes.buffer);
                  const float32 = new Float32Array(pcm16.length);
                  for (let i = 0; i < pcm16.length; i++) {
                    float32[i] = pcm16[i] / 32768.0;
                  }

                  // Queue playback (prevents overlapping chunks => "multiple voices" / garble)
                  const audioContext = audioContextRef.current;
                  const sampleRate = 24000; // Match Grok API config
                  const audioBuffer = audioContext.createBuffer(1, float32.length, sampleRate);
                  audioBuffer.copyToChannel(float32, 0);

                  const source = audioContext.createBufferSource();
                  source.buffer = audioBuffer;
                  source.connect(audioContext.destination);

                  // Schedule sequential playback
                  const now = audioContext.currentTime;
                  const startAt = Math.max(playbackTimeRef.current, now + 0.02); // small jitter buffer
                  source.start(startAt);
                  playbackTimeRef.current = startAt + audioBuffer.duration;

                  updateState('speaking');
                } catch (err) {
                  console.error('Error playing audio:', err);
                }
              }
              break;

            case 'transcript':
              // Assistant transcript delta - accumulate text
              if (data.text) {
                currentAssistantTranscriptRef.current += data.text;
                // Update the last assistant transcript or create new one
                setTranscripts((prev) => {
                  const newTranscripts = [...prev];
                  const lastIndex = newTranscripts.length - 1;
                  if (lastIndex >= 0 && !newTranscripts[lastIndex].isUser) {
                    // Update existing assistant transcript
                    newTranscripts[lastIndex] = {
                      ...newTranscripts[lastIndex],
                      text: currentAssistantTranscriptRef.current,
                    };
                  } else {
                    // Create new assistant transcript
                    newTranscripts.push({
                      text: currentAssistantTranscriptRef.current,
                      isUser: false,
                      timestamp: Date.now(),
                    });
                  }
                  return newTranscripts;
                });
                onTranscript?.(data.text, false);
              }
              break;

            case 'transcript_done':
              // Assistant transcript complete - finalize it
              currentAssistantTranscriptRef.current = '';
              break;

            case 'user_transcript':
              // User's transcribed audio (from conversation.item.input_audio_transcription.completed)
              if (data.text) {
                // Reset assistant transcript accumulator when user speaks
                currentAssistantTranscriptRef.current = '';
                const transcript = { text: data.text, isUser: true, timestamp: Date.now() };
                setTranscripts((prev) => [...prev, transcript]);
                onTranscript?.(data.text, true);
              }
              break;

            case 'speech_started':
              // Server detected speech start (server_vad)
              console.log('🎤 Speech detected - server started listening');
              updateState('listening');
              break;

            case 'speech_stopped':
              // Server detected speech end (server_vad)
              console.log('🔇 Speech ended - server processing');
              updateState('processing');
              break;

            case 'response_created':
              // Grok started generating a response
              console.log('💬 Grok started responding');
              updateState('speaking');
              break;

            case 'response_done':
              // Response complete
              console.log('✅ Grok response completed');
              // Reset playback timeline so next response doesn't "rush" to catch up
              if (audioContextRef.current) {
                playbackTimeRef.current = audioContextRef.current.currentTime;
              }
              updateState('idle');
              break;

            case 'connected':
              console.log('✅ Backend confirmed WebSocket connection');
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
        console.error('❌ WebSocket error:', error);
        console.error('WebSocket readyState:', ws.readyState);
        console.error('WebSocket URL:', wsUrl);
        updateState('error');
        onError?.('Connection error. Please try again.');
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket closed:', { code: event.code, reason: event.reason, wasClean: event.wasClean });
        // Only update state if this wasn't an intentional close
        if (event.code !== 1000) {
          updateState('idle');
          setSessionId(null);
        }
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

  // Start/stop listening (with server_vad, these are mostly for UI state)
  const startListening = useCallback(() => {
    // With server_vad, audio is already streaming
    // This is just for UI feedback - the server will detect speech automatically
    if (state === 'idle' && wsRef.current?.readyState === WebSocket.OPEN) {
      detectAudioLevel();
    }
  }, [state, detectAudioLevel]);

  const stopListening = useCallback(() => {
    // With server_vad, we don't manually commit - the server does it automatically
    // This is just for UI state
    if (state === 'listening') {
      updateState('idle');
    }
  }, [state, updateState]);

  // Close session and cleanup
  const closeSession = useCallback(async () => {
    console.log('🔌 Closing voice session...');
    
    // Set a flag to prevent audio from being sent during cleanup
    const isClosingRef = { current: true };
    
    // Stop audio stream first (stops sending new audio)
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Disconnect script processor (stops audio processing)
    const processor = (mediaRecorderRef as any).current;
    if (processor && typeof processor.disconnect === 'function') {
      try {
        processor.disconnect();
      } catch (err) {
        // Ignore errors
      }
      (mediaRecorderRef as any).current = null;
    }

    // Close WebSocket (with proper close code)
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      try {
        wsRef.current.close(1000, 'User disconnected');
      } catch (err) {
        console.error('Error closing WebSocket:', err);
      }
      wsRef.current = null;
    }

    // Close backend session
    const currentSessionId = sessionId;
    if (currentSessionId && publicKey) {
      try {
        await closeVoiceSession(currentSessionId, publicKey.toString());
        console.log('✅ Voice session closed');
      } catch (err) {
        console.error('Error closing voice session:', err);
      }
    }

    // Close audio context (after stopping streams)
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        await audioContextRef.current.close();
      } catch (err) {
        console.error('Error closing audio context:', err);
      }
      audioContextRef.current = null;
    }

    // Reset state
    setSessionId(null);
    updateState('idle');
    setTranscripts([]);
    currentAssistantTranscriptRef.current = '';
    
    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [sessionId, publicKey, updateState]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up voice companion (unmount)...');
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close().catch(console.error);
        } catch (err) {
          // AudioContext might already be closed, ignore error
        }
      }
      // Disconnect script processor
      const processor = (mediaRecorderRef as any).current;
      if (processor && typeof processor.disconnect === 'function') {
        try {
          processor.disconnect();
        } catch (err) {
          // Ignore errors
        }
      }
      if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
        console.log('🔌 Closing WebSocket on unmount');
        wsRef.current.close();
      }
      // Close session on unmount
      const currentSessionId = sessionId;
      if (currentSessionId && publicKey) {
        console.log('🗑️ Closing voice session on unmount:', currentSessionId);
        closeVoiceSession(currentSessionId, publicKey.toString()).catch(console.error);
      }
    };
    // Only run cleanup on unmount, not when sessionId changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps = only on unmount

  return {
    state,
    sessionId,
    transcripts,
    startSession,
    closeSession,
    startListening,
    stopListening,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    audioLevel,
  };
};
