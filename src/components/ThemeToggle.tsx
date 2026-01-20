'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  mounted: boolean;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('system');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
  }, []);

  useEffect(() => {
    const updateActualTheme = () => {
      let resolved: 'light' | 'dark';
      
      if (theme === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        resolved = systemPrefersDark ? 'dark' : 'light';
      } else {
        resolved = theme;
      }

      setActualTheme(resolved);
      document.documentElement.setAttribute('data-theme', resolved);
    };

    updateActualTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => updateActualTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, mounted, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <div 
        className="flex items-center gap-1 p-1 rounded-xl w-32 h-10"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(var(--blur-md))',
          WebkitBackdropFilter: 'blur(var(--blur-md))',
          border: '1px solid var(--glass-border)',
        }}
      />
    );
  }
  return (
    <div 
      className="flex items-center gap-1 p-1 rounded-xl"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(var(--blur-md))',
        WebkitBackdropFilter: 'blur(var(--blur-md))',
        border: '1px solid var(--glass-border)',
      }}
    >
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
          theme === 'light'
            ? 'text-current'
            : 'text-current opacity-60 hover:opacity-100'
        }`}
        style={theme === 'light' ? {
          backgroundColor: 'var(--bg-hover)',
        } : {}}
        aria-label="Light theme"
        title="Light theme"
      >
        <Sun className="w-4 h-4" style={{ color: 'var(--text)' }} />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
          theme === 'dark'
            ? 'text-current'
            : 'text-current opacity-60 hover:opacity-100'
        }`}
        style={theme === 'dark' ? {
          backgroundColor: 'var(--bg-hover)',
        } : {}}
        aria-label="Dark theme"
        title="Dark theme"
      >
        <Moon className="w-4 h-4" style={{ color: 'var(--text)' }} />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
          theme === 'system'
            ? 'text-current'
            : 'text-current opacity-60 hover:opacity-100'
        }`}
        style={theme === 'system' ? {
          backgroundColor: 'var(--bg-hover)',
        } : {}}
        aria-label="System theme"
        title="Use system preference"
      >
        <Monitor className="w-4 h-4" style={{ color: 'var(--text)' }} />
      </button>
    </div>
  );
};

