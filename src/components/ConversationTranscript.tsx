'use client';

import React, { useEffect, useRef } from 'react';
import { Bot, User } from 'lucide-react';

interface TranscriptItem {
  text: string;
  isUser: boolean;
  timestamp: number;
}

interface ConversationTranscriptProps {
  transcripts: TranscriptItem[];
  className?: string;
}

export const ConversationTranscript: React.FC<ConversationTranscriptProps> = ({
  transcripts,
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new transcripts arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts]);

  if (transcripts.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(var(--blur-lg))',
          WebkitBackdropFilter: 'blur(var(--blur-lg))',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-2xl)',
        }}
      >
        <Bot className="w-8 h-8 mb-3 opacity-50" style={{ color: 'var(--accent-primary)' }} />
        <p className="text-sm opacity-60 text-center" style={{ color: 'var(--text-secondary)' }}>
          Your conversation will appear here
        </p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className={`flex flex-col gap-3 overflow-y-auto max-h-96 ${className}`}
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(var(--blur-lg))',
        WebkitBackdropFilter: 'blur(var(--blur-lg))',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-2xl)',
        padding: 'var(--space-4)',
      }}
    >
      {transcripts.map((item, index) => (
        <div
          key={index}
          className={`flex gap-3 ${item.isUser ? 'justify-end' : 'justify-start'}`}
        >
          {!item.isUser && (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              }}
            >
              <Bot className="w-4 h-4 text-white" />
            </div>
          )}

          <div
            className={`flex flex-col gap-1 max-w-[80%] ${
              item.isUser ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`px-4 py-2 rounded-xl text-sm ${
                item.isUser
                  ? 'rounded-br-sm'
                  : 'rounded-bl-sm'
              }`}
              style={
                item.isUser
                  ? {
                      background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                      color: 'white',
                    }
                  : {
                      background: 'var(--bg-elevated)',
                      color: 'var(--text)',
                      border: '1px solid var(--border-subtle)',
                    }
              }
            >
              <p className="whitespace-pre-wrap break-words">{item.text}</p>
            </div>
            <span
              className="text-xs opacity-50 px-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              {new Date(item.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {item.isUser && (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <User className="w-4 h-4" style={{ color: 'var(--text)' }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
