'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getTokenBalance, getTokenPrice } from '@/lib/api';
import { Wallet, RefreshCw } from 'lucide-react';

interface TokenBalanceData {
  currentBalance: number;
  depositedAmount: number;
  consumedAmount: number;
  lastUpdated: string;
}

export const TokenBalance: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const [balance, setBalance] = useState<TokenBalanceData | null>(null);
  const [tokenPrice, setTokenPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!connected || !publicKey) return;

    setLoading(true);
    try {
      const data = await getTokenBalance(publicKey.toString());
      setBalance(data);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey]);

  const fetchPrice = useCallback(async () => {
    try {
      const data = await getTokenPrice();
      setTokenPrice(data.twapPrice);
    } catch (error) {
      console.error('Failed to fetch price:', error);
    }
  }, []);

  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
      fetchPrice();

      const interval = setInterval(() => {
        fetchBalance();
        fetchPrice();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [connected, publicKey, fetchBalance, fetchPrice]);

  if (!connected || !publicKey || !balance) {
    return null;
  }

  const usdValue = balance.currentBalance * tokenPrice;

  return (
    <div 
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(var(--blur-md))',
        WebkitBackdropFilter: 'blur(var(--blur-md))',
        border: '1px solid var(--glass-border)',
      }}
    >
      <Wallet className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent-primary)' }} />
      <div className="flex items-center gap-1">
        <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
          {balance.currentBalance.toFixed(2)}
        </span>
        <span className="text-xs opacity-60" style={{ color: 'var(--text-secondary)' }}>
          tokens
        </span>
      </div>
      {usdValue > 0 && (
        <span className="text-xs opacity-60" style={{ color: 'var(--text-secondary)' }}>
          (${usdValue.toFixed(2)})
        </span>
      )}
      <button
        onClick={fetchBalance}
        disabled={loading}
        className="p-1 rounded disabled:opacity-50 transition-all flex items-center justify-center ml-1"
        style={{ color: 'var(--text-secondary)' }}
        aria-label="Refresh balance"
      >
        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};
