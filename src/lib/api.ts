import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Voice Session APIs
export interface VoiceSessionConfig {
  walletAddress: string;
  userId?: string;
  voice?: 'Ara' | 'Rex' | 'Sal' | 'Eve' | 'Leo';
  model?: string;
  systemInstructions?: string;
  temperature?: number;
}

export interface VoiceSessionResponse {
  sessionId: string;
  message: string;
  wsUrl: string;
  maxDuration: number;
  estimatedCost: number;
}

export const createVoiceSession = async (config: VoiceSessionConfig): Promise<VoiceSessionResponse> => {
  const response = await api.post('/voice/session', config);
  return response.data;
};

export const getVoiceSession = async (sessionId: string) => {
  const response = await api.get(`/voice/session/${sessionId}`);
  return response.data;
};

export const closeVoiceSession = async (sessionId: string) => {
  const response = await api.delete(`/voice/session/${sessionId}`);
  return response.data;
};

export const getVoiceCost = async () => {
  const response = await api.get('/voice/cost');
  return response.data;
};

// Chat APIs
export interface ChatMessageRequest {
  message: string;
  walletAddress: string;
  userTier?: 'free' | 'paid';
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  userId?: string;
}

export interface ChatMessageResponse {
  reply: string;
  tokenInfo: {
    cost: number;
    costUsd: number;
    remainingBalance: number;
    llmUsage?: {
      inputTokens: number;
      outputTokens: number;
      model: string;
      provider: string;
      intent?: string;
    };
  };
  modelInfo?: {
    selectedModel: string;
    provider: string;
    intent?: string;
  };
}

export const sendChatMessage = async (request: ChatMessageRequest): Promise<ChatMessageResponse> => {
  const response = await api.post('/chat/message', request);
  return response.data;
};

export const getChatCost = async (userTier: 'free' | 'paid' = 'free') => {
  const response = await api.get('/chat/cost', { params: { userTier } });
  return response.data;
};

// Token APIs
export const getTokenBalance = async (walletAddress: string) => {
  const response = await api.get(`/token/balance/${walletAddress}`);
  return response.data;
};

export const getTokenPrice = async () => {
  const response = await api.get('/token/price');
  return response.data;
};

export const getTokenStats = async () => {
  const response = await api.get('/token/stats');
  return response.data;
};

// Legacy function for backward compatibility (deprecated)
export const sendMessage = async (message: string, walletAddress: string) => {
  return sendChatMessage({ message, walletAddress });
};

export default api;
