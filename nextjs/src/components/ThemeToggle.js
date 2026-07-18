'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-lg bg-steel-700/50 border border-steel-600/30" />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      id="theme-toggle-btn"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="w-9 h-9 rounded-lg bg-steel-700 hover:bg-steel-600 border border-steel-600 flex items-center justify-center text-paper-100 hover:text-paper-100 transition-colors shadow-sm"
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-phosphor-500 animate-fade-in" />
      ) : (
        <Moon className="w-4 h-4 text-phosphor-500 animate-fade-in" />
      )}
    </button>
  );
}
