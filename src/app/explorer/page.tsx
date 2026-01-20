'use client';

import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import TokenSearch from '@/components/TokenSearch';

export default function ExplorerPage() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 
            className="text-3xl md:text-5xl font-black mb-4 tracking-tight"
            style={{ color: 'var(--text)' }}
          >
            Token <span style={{ color: 'var(--accent-primary)' }}>Explorer</span>
          </h1>
          <p className="text-lg opacity-60" style={{ color: 'var(--text-secondary)' }}>
            Search and analyze any token on the Solana network using Jupiter Ultra.
          </p>
        </div>
        
        <TokenSearch />
      </div>
    </AppLayout>
  );
}
