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
        background: #FFFFFF !important;
        border: none !important;
        color: #000000 !important;
        border-radius: 9999px !important;
        padding: 0.5rem 0.875rem !important;
        font-family: 'Times New Roman', Times, serif !important;
        font-size: 0.8125rem !important;
        font-weight: 400 !important;
        min-height: auto !important;
        height: auto !important;
        transition: all 200ms !important;
        text-transform: none !important;
        box-shadow: 0 2px 8px rgba(255, 255, 255, 0.1) !important;
      }
      .wallet-adapter-button:hover:not([disabled]) {
        background: #F5F5F5 !important;
        color: #000000 !important;
        transform: translateY(-1px) !important;
        opacity: 1 !important;
        box-shadow: 0 4px 12px rgba(255, 255, 255, 0.15) !important;
      }
      .wallet-adapter-button:active:not([disabled]) {
        transform: translateY(0) !important;
      }
      .wallet-adapter-button[disabled] {
        opacity: 0.4 !important;
        cursor: not-allowed !important;
      }
      .wallet-adapter-modal-wrapper {
        background: rgba(0, 0, 0, 0.2) !important;
      }
      .wallet-adapter-modal {
        background: #FFFFFF !important;
        border: 1px solid rgba(0, 0, 0, 0.1) !important;
        border-radius: 1rem !important;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
        color: #000000 !important;
        padding: 2rem !important;
        font-family: 'Times New Roman', Times, serif !important;
      }
      .wallet-adapter-modal-title {
        color: #000000 !important;
        font-family: 'Times New Roman', Times, serif !important;
        font-weight: 400 !important;
        font-size: 1.5rem !important;
        margin-bottom: 1.5rem !important;
      }
      .wallet-adapter-modal-list {
        display: flex !important;
        flex-direction: column !important;
        gap: 0.5rem !important;
      }
      .wallet-adapter-modal-list-item {
        background: #FFFFFF !important;
        border: 1px solid rgba(0, 0, 0, 0.1) !important;
        border-radius: 0.75rem !important;
        padding: 1rem !important;
        transition: all 200ms !important;
        color: #000000 !important;
        font-family: 'Times New Roman', Times, serif !important;
      }
      .wallet-adapter-modal-list-item:hover {
        background: #F5F5F5 !important;
        color: #000000 !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
      }
      .wallet-adapter-modal-button-close {
        background: #FFFFFF !important;
        border: 1px solid rgba(0, 0, 0, 0.1) !important;
        border-radius: 0.5rem !important;
        color: #000000 !important;
        transition: all 200ms !important;
      }
      .wallet-adapter-modal-button-close:hover {
        background: #F5F5F5 !important;
        color: #000000 !important;
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
    <div className="flex flex-col items-stretch gap-1.5 w-auto">
      <div className="wallet-button-wrapper flex items-center">
        <WalletMultiButton className="!w-auto !justify-center" />
      </div>
      {connected && publicKey && getNetworkName() && (
        <div 
          className="text-xs px-2 py-1 text-center flex items-center justify-center rounded-lg border border-white/10 bg-white/5"
          style={{
            color: "#FFFFFF",
            fontFamily: "'Times New Roman', Times, serif",
          }}
        >
          {getNetworkName()}
        </div>
      )}
    </div>
  );
};
