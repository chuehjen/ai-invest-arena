import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ThemeName = 'terminal' | 'editorial';

interface ThemeContextValue {
  theme: ThemeName;
  toggleTheme: () => void;
  setTheme: (t: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'ai-arena-theme';

const readInitial = (): ThemeName => {
  if (typeof window === 'undefined') return 'terminal';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'editorial' || stored === 'terminal') return stored;
  } catch (_) {
    // ignore storage errors (private mode etc.)
  }
  return 'terminal';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeName>(readInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (_) {
      // ignore
    }
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      document.body.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const setTheme = useCallback((t: ThemeName) => setThemeState(t), []);
  const toggleTheme = useCallback(
    () => setThemeState(prev => (prev === 'terminal' ? 'editorial' : 'terminal')),
    [],
  );

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return ctx;
};
