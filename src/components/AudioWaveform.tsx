'use client';

import React, { useEffect, useRef } from 'react';

interface AudioWaveformProps {
  audioLevel: number;
  state: 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
  className?: string;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ audioLevel, state, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Base gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      
      if (state === 'error') {
        gradient.addColorStop(0, '#ef4444');
        gradient.addColorStop(1, '#dc2626');
      } else if (state === 'listening') {
        gradient.addColorStop(0, '#6366f1');
        gradient.addColorStop(1, '#8b5cf6');
      } else if (state === 'speaking') {
        gradient.addColorStop(0, '#8b5cf6');
        gradient.addColorStop(1, '#ec4899');
      } else if (state === 'processing') {
        gradient.addColorStop(0, '#f59e0b');
        gradient.addColorStop(1, '#f97316');
      } else {
        gradient.addColorStop(0, '#6366f1');
        gradient.addColorStop(1, '#8b5cf6');
      }

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';

      // Number of bars
      const barCount = 50;
      const barWidth = width / barCount;
      const spacing = barWidth * 0.2;

      // Draw waveform based on state
      if (state === 'idle') {
        // Gentle pulsing
        const pulse = Math.sin(Date.now() / 1000) * 0.3 + 0.7;
        for (let i = 0; i < barCount; i++) {
          const x = i * barWidth + spacing;
          const barHeight = (height * 0.1) * pulse * (0.5 + Math.random() * 0.5);
          const y = centerY - barHeight / 2;
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + barHeight);
          ctx.stroke();
        }
      } else if (state === 'listening') {
        // Pulses inward
        const intensity = audioLevel * 0.8 + 0.2;
        for (let i = 0; i < barCount; i++) {
          const x = i * barWidth + spacing;
          const progress = i / barCount;
          const centerDistance = Math.abs(progress - 0.5) * 2;
          const barHeight = (height * 0.4) * intensity * (1 - centerDistance * 0.5);
          const y = centerY - barHeight / 2;
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + barHeight);
          ctx.stroke();
        }
      } else if (state === 'processing') {
        // Processing pattern
        const time = Date.now() / 500;
        for (let i = 0; i < barCount; i++) {
          const x = i * barWidth + spacing;
          const wave = Math.sin(time + i * 0.2) * 0.5 + 0.5;
          const barHeight = (height * 0.3) * wave;
          const y = centerY - barHeight / 2;
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + barHeight);
          ctx.stroke();
        }
      } else if (state === 'speaking') {
        // Pulses outward with audio level
        const intensity = audioLevel * 0.9 + 0.1;
        for (let i = 0; i < barCount; i++) {
          const x = i * barWidth + spacing;
          const progress = i / barCount;
          const centerDistance = Math.abs(progress - 0.5) * 2;
          const variation = Math.sin(Date.now() / 100 + i * 0.3) * 0.3 + 0.7;
          const barHeight = (height * 0.5) * intensity * variation * (1 - centerDistance * 0.3);
          const y = centerY - barHeight / 2;
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + barHeight);
          ctx.stroke();
        }
      } else if (state === 'error') {
        // Error pulse
        const pulse = Math.sin(Date.now() / 200) * 0.5 + 0.5;
        for (let i = 0; i < barCount; i++) {
          const x = i * barWidth + spacing;
          const barHeight = (height * 0.2) * pulse;
          const y = centerY - barHeight / 2;
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + barHeight);
          ctx.stroke();
        }
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioLevel, state]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        maxWidth: '400px',
        maxHeight: '400px',
      }}
    />
  );
};
