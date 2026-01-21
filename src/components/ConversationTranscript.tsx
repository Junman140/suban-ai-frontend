'use client';

import React, { useEffect, useRef } from 'react';

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
    return null;
  }

  return (
    <div
      ref={scrollRef}
      className={`flex-1 flex flex-col gap-8 overflow-y-auto p-6 lg:p-8 ${className}`}
    >
      {transcripts.map((item, index) => (
        <div
          key={index}
          className={`flex flex-col ${item.isUser ? 'items-end' : 'items-start'}`}
        >
          {/* Label */}
          <div className="mb-2 px-1">
            <span
              className="text-xs font-normal uppercase tracking-wide text-white text-opacity-50"
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            >
              {item.isUser ? 'You' : 'Likable AI'}
            </span>
          </div>

          {/* Message */}
          <div
            className={`max-w-[85%] lg:max-w-[75%] px-5 py-3.5 rounded-2xl ${
              item.isUser
                ? 'bg-white text-black'
                : 'bg-white/5 text-white'
            }`}
          >
            <p
              className="text-base leading-relaxed whitespace-pre-wrap break-words"
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            >
              {item.text}
            </p>
          </div>

          {/* Timestamp */}
          <div className="mt-1 px-1">
            <span
              className="text-xs text-white text-opacity-50"
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            >
              {new Date(item.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
