'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { sendChatMessage, ChatMessageRequest } from '@/lib/api';
import { X, Send, Loader2 } from 'lucide-react';
import { SkeletonLoader } from './SkeletonLoader';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface TextChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TextChatDrawer: React.FC<TextChatDrawerProps> = ({ isOpen, onClose }) => {
  const { connected, publicKey } = useWallet();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !connected || !publicKey) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const conversationHistory = messages
        .slice(-4)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      const request: ChatMessageRequest = {
        message: userMessage.content,
        walletAddress: publicKey.toString(),
        userTier: 'free',
        conversationHistory,
      };

      const response = await sendChatMessage(request);

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.response?.data?.error || 'Failed to send message');
      
      const errorMessage: Message = {
        role: 'assistant',
        content: err.response?.status === 402
          ? 'Insufficient tokens. Please deposit more tokens to continue.'
          : 'Error: Could not reach the AI. Please try again.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full md:w-[480px] z-50 bg-black border-l border-white/10 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-xl font-normal text-white" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
            Text Chat
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white hover:bg-opacity-10 rounded transition-colors text-white"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ height: 'calc(100% - 160px)' }}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-white text-opacity-60" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                Begin a conversation with Likable AI
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-white'
                }`}
                style={{ fontFamily: "'Times New Roman', Times, serif" }}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {msg.content}
                </p>
              </div>
              <span
                className="text-xs text-white text-opacity-50 mt-1 px-1"
                style={{ fontFamily: "'Times New Roman', Times, serif" }}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ))}

          {loading && (
            <div className="flex items-start">
              <div className="px-4 py-2.5 rounded-2xl bg-white/5">
                <SkeletonLoader lines={2} />
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/30 text-sm text-red-300" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/5 p-4">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={connected ? "Type your message..." : "Connect wallet to chat..."}
              disabled={loading || !connected}
              className="flex-1 px-4 py-2.5 bg-white/5 text-white border border-white/10 rounded-full focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-40 placeholder-white placeholder-opacity-50"
              style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: '0.875rem' }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !connected || !input.trim()}
              className="px-4 py-2.5 bg-white text-black rounded-full hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: '0.875rem', boxShadow: '0 2px 8px rgba(255, 255, 255, 0.1)' }}
              aria-label="Send message"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
