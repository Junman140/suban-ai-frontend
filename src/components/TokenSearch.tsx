'use client';

import React, { useState } from 'react';
import { searchTokens } from '@/lib/api';
import { Search, Info, TrendingUp, Users, ChevronRight, AlertCircle } from 'lucide-react';

interface TokenInfo {
  mint: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  marketCap?: number;
  organicScore?: number;
  holderCount?: number;
  description?: string;
}

const TokenSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await searchTokens(query);
      setResults(data);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.response?.data?.message || 'Failed to search tokens. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="w-full max-w-4xl mx-auto p-4 md:p-8 rounded-3xl transition-all duration-300"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(var(--blur-xl))',
        WebkitBackdropFilter: 'blur(var(--blur-xl))',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-xl)',
      }}
    >
      <div className="flex items-center gap-4 mb-8">
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <Search className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col justify-center">
          <h2 className="text-xl md:text-2xl font-bold leading-tight" style={{ color: 'var(--text)' }}>Token Explorer</h2>
          <p className="text-sm opacity-60 leading-tight" style={{ color: 'var(--text-secondary)' }}>Powered by Jupiter Ultra API</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="relative mb-8 group">
        <input
          type="text"
          placeholder="Search by name, symbol, or mint address..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-6 py-4 rounded-2xl transition-all duration-200 outline-none"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text)',
            fontSize: '1rem',
          }}
        />
        <button 
          type="submit" 
          disabled={loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            color: 'white',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : 'Search'}
        </button>
      </form>

      {error && (
        <div 
          className="p-4 mb-6 rounded-2xl flex items-center gap-3"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
          }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {results.length > 0 ? (
          results.map((token) => (
            <div 
              key={token.mint}
              className="p-4 rounded-2xl transition-all duration-200 group cursor-pointer"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.background = 'var(--bg-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.background = 'var(--bg-elevated)';
              }}
            >
              <div className="flex items-center gap-4">
                {token.logoURI ? (
                  <img src={token.logoURI} alt={token.symbol} className="w-12 h-12 rounded-xl shadow-sm" />
                ) : (
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg"
                    style={{
                      background: 'var(--bg-hover)',
                      color: 'var(--accent-primary)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {token.symbol[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold truncate" style={{ color: 'var(--text)' }}>{token.name}</h3>
                    <span 
                      className="text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider"
                      style={{
                        background: 'var(--bg-hover)',
                        color: 'var(--accent-secondary)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {token.symbol}
                    </span>
                  </div>
                  <p className="text-[10px] opacity-40 truncate font-mono mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {token.mint}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--accent-primary)' }} />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div 
                  className="flex flex-col gap-1 p-2 rounded-lg"
                  style={{ background: 'var(--bg-hover)' }}
                >
                  <div className="flex items-center gap-1 text-[10px] opacity-60" style={{ color: 'var(--text-secondary)' }}>
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span>Score</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>
                    {token.organicScore?.toFixed(1) || 'N/A'}
                  </span>
                </div>
                <div 
                  className="flex flex-col gap-1 p-2 rounded-lg"
                  style={{ background: 'var(--bg-hover)' }}
                >
                  <div className="flex items-center gap-1 text-[10px] opacity-60" style={{ color: 'var(--text-secondary)' }}>
                    <Users className="w-3 h-3 text-blue-500" />
                    <span>Holders</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>
                    {token.holderCount ? (token.holderCount > 1000 ? (token.holderCount/1000).toFixed(1) + 'k' : token.holderCount) : 'N/A'}
                  </span>
                </div>
                <div 
                  className="flex flex-col gap-1 p-2 rounded-lg"
                  style={{ background: 'var(--bg-hover)' }}
                >
                  <div className="flex items-center gap-1 text-[10px] opacity-60" style={{ color: 'var(--text-secondary)' }}>
                    <Info className="w-3 h-3 text-purple-500" />
                    <span>MCap</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>
                    {token.marketCap ? '$' + (token.marketCap / 1e6).toFixed(1) + 'M' : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : !loading && query ? (
          <div className="col-span-full py-12 text-center">
            <p className="text-base opacity-40" style={{ color: 'var(--text-secondary)' }}>No tokens found for "{query}"</p>
          </div>
        ) : (
          <div className="col-span-full py-12 text-center opacity-20">
            <Search className="w-16 h-16 mx-auto mb-4" />
            <p className="text-sm">Enter a search query to explore Solana tokens</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenSearch;
