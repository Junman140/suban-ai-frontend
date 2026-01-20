'use client';

import React, { useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const WalletButton: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const getNetworkName = () => {
    const rpcUrl = connection?.rpcEndpoint || '';
    if (rpcUrl.includes('devnet')) return 'Devnet';
    if (rpcUrl.includes('testnet')) return 'Testnet';
    return '';
  };

  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'wallet-adapter-styles';
    styleSheet.textContent = `
      .wallet-adapter-button {
        background: var(--glass-bg) !important;
        backdrop-filter: blur(var(--blur-md)) !important;
        -webkit-backdrop-filter: blur(var(--blur-md)) !important;
        border: 1px solid var(--glass-border) !important;
        color: var(--text) !important;
        border-radius: var(--radius-xl) !important;
        padding: var(--space-3) var(--space-4) !important;
        font-size: var(--font-sm) !important;
        font-weight: 500 !important;
        min-height: 44px !important;
        transition: all var(--transition-base) !important;
        box-shadow: var(--shadow-sm) !important;
      }
      .wallet-adapter-button:hover:not([disabled]) {
        background: var(--bg-hover) !important;
        transform: translateY(-1px) !important;
        box-shadow: var(--shadow-md) !important;
        opacity: 1 !important;
      }
      .wallet-adapter-button:active:not([disabled]) {
        transform: translateY(0) !important;
      }
      .wallet-adapter-button[disabled] {
        opacity: 0.5 !important;
        cursor: not-allowed !important;
      }
      .wallet-adapter-modal-wrapper {
        background: rgba(0, 0, 0, 0.5) !important;
        backdrop-filter: blur(8px) !important;
        -webkit-backdrop-filter: blur(8px) !important;
      }
      .wallet-adapter-modal {
        background: var(--glass-bg) !important;
        backdrop-filter: blur(var(--blur-xl)) !important;
        -webkit-backdrop-filter: blur(var(--blur-xl)) !important;
        border: 1px solid var(--glass-border) !important;
        border-radius: var(--radius-2xl) !important;
        box-shadow: var(--shadow-xl) !important;
        color: var(--text) !important;
        padding: var(--space-6) !important;
      }
      .wallet-adapter-modal-title {
        color: var(--text) !important;
        font-weight: 600 !important;
        font-size: var(--font-lg) !important;
        margin-bottom: var(--space-4) !important;
      }
      .wallet-adapter-modal-list {
        display: flex !important;
        flex-direction: column !important;
        gap: var(--space-2) !important;
      }
      .wallet-adapter-modal-list-item {
        background: transparent !important;
        border: 1px solid var(--border-subtle) !important;
        border-radius: var(--radius-xl) !important;
        padding: var(--space-4) !important;
        transition: all var(--transition-base) !important;
        color: var(--text) !important;
      }
      .wallet-adapter-modal-list-item:hover {
        background: var(--bg-hover) !important;
        border-color: var(--border-medium) !important;
        transform: translateY(-1px) !important;
      }
      .wallet-adapter-modal-button-close {
        background: transparent !important;
        border: 1px solid var(--border-subtle) !important;
        border-radius: var(--radius-lg) !important;
        color: var(--text) !important;
        transition: all var(--transition-base) !important;
      }
      .wallet-adapter-modal-button-close:hover {
        background: var(--bg-hover) !important;
        border-color: var(--border-medium) !important;
      }
    `;
    
    // Remove existing stylesheet if present
    const existing = document.getElementById('wallet-adapter-styles');
    if (existing) {
      document.head.removeChild(existing);
    }
    
    document.head.appendChild(styleSheet);

    return () => {
      const toRemove = document.getElementById('wallet-adapter-styles');
      if (toRemove) {
        document.head.removeChild(toRemove);
      }
    };
  }, []);

  if (!mounted) {
    return (
      <div className="wallet-button-wrapper w-full h-[44px]">
        <div 
          className="w-full h-full rounded-xl animate-pulse"
          style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-stretch gap-2 w-full">
      <div className="wallet-button-wrapper w-full flex items-center">
        <WalletMultiButton className="!w-full !justify-center" />
      </div>
      {connected && publicKey && getNetworkName() && (
        <div 
          className="text-xs px-3 py-1.5 rounded-lg text-center flex items-center justify-center"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-secondary)",
          }}
        >
          {getNetworkName()}
        </div>
      )}
    </div>
  );
};
