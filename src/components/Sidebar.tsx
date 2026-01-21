'use client';

import React, { useState } from 'react';
import { Menu, X, MessageCircle, Settings as SettingsIcon, Wallet as WalletIcon } from 'lucide-react';
import { WalletButton } from './WalletButton';
import { TokenBalance } from './TokenBalance';

interface SidebarProps {
  onTextChatOpen: () => void;
  onSettingsOpen: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onTextChatOpen, onSettingsOpen }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex lg:flex-col fixed left-2 top-2 bottom-2 bg-black border border-white/10 rounded-lg transition-all duration-300 z-30 ${
          isExpanded ? 'w-64' : 'w-16'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          {isExpanded && (
            <h1 className="text-xl font-normal text-white" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              Likable AI
            </h1>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-white hover:bg-opacity-10 rounded transition-colors text-white"
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isExpanded ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Nav Items */}
        <div className="flex-1 py-4">
          <nav className="space-y-2 px-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTextChatOpen();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors text-left text-white cursor-pointer ${
                !isExpanded && 'justify-center'
              }`}
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            >
              <MessageCircle className="w-5 h-5 flex-shrink-0" />
              {isExpanded && <span className="text-sm">Text Chat</span>}
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSettingsOpen();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors text-left text-white cursor-pointer ${
                !isExpanded && 'justify-center'
              }`}
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            >
              <SettingsIcon className="w-5 h-5 flex-shrink-0" />
              {isExpanded && <span className="text-sm">Settings</span>}
            </button>
          </nav>
        </div>

        {/* Footer - Empty now, wallet moved to header */}
        <div className="border-t border-white/5 p-4">
          {!isExpanded && (
            <div className="w-full flex justify-center">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <WalletIcon className="w-4 h-4 text-white opacity-50" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 z-30 safe-area-bottom">
        <div className="flex items-center justify-around px-4 py-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onTextChatOpen();
            }}
            className="flex flex-col items-center gap-1 p-2 text-white cursor-pointer"
            aria-label="Text Chat"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              Chat
            </span>
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSettingsOpen();
            }}
            className="flex flex-col items-center gap-1 p-2 text-white cursor-pointer"
            aria-label="Settings"
          >
            <SettingsIcon className="w-6 h-6" />
            <span className="text-xs" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              Settings
            </span>
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Trigger wallet connection - this will open the wallet adapter modal
              const walletButton = document.querySelector('.wallet-adapter-button') as HTMLElement;
              if (walletButton) {
                walletButton.click();
              }
            }}
            className="flex flex-col items-center gap-1 p-2 text-white cursor-pointer"
            aria-label="Wallet"
          >
            <WalletIcon className="w-6 h-6" />
            <span className="text-xs" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              Wallet
            </span>
          </button>
        </div>
      </div>
    </>
  );
};
