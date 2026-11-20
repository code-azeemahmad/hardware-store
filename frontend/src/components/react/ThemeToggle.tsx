import React, { useState, useEffect } from 'react';

interface ThemeToggleProps {
  lang?: 'en' | 'ur';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ lang = 'en' }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Determine active theme on load
    const currentTheme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' | null;
    if (currentTheme === 'dark' || currentTheme === 'light') {
      setTheme(currentTheme);
    } else {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(isSystemDark ? 'dark' : 'light');
    }

    // Listen for OS preference changes when no explicit choice in localStorage
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      try {
        const saved = localStorage.getItem('theme');
        if (!saved) {
          const newTheme = e.matches ? 'dark' : 'light';
          document.documentElement.setAttribute('data-theme', newTheme);
          setTheme(newTheme);
          updateMetaThemeColor(newTheme);
        }
      } catch (err) {}
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, []);

  const updateMetaThemeColor = (newTheme: 'light' | 'dark') => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', newTheme === 'dark' ? '#0e0e0e' : '#ffffff');
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    try {
      localStorage.setItem('theme', nextTheme);
    } catch (err) {}
    updateMetaThemeColor(nextTheme);
  };

  const isDark = theme === 'dark';
  const label = isDark
    ? (lang === 'ur' ? 'روشن موڈ پر جائیں' : 'Switch to light theme')
    : (lang === 'ur' ? 'ڈارک موڈ پر جائیں' : 'Switch to dark theme');

  return (
    <button
      type="button"
      id="theme-toggle-btn"
      className="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={isDark}
      title={label}
    >
      {isDark ? (
        /* Sun Icon */
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="theme-toggle-icon"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      ) : (
        /* Moon Icon */
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="theme-toggle-icon"
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      )}

      <style>{`
        .theme-toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text);
          cursor: pointer;
          transition: background-color var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
          padding: 0;
          flex-shrink: 0;
        }

        .theme-toggle-btn:hover {
          background-color: var(--bg-alt);
          color: var(--red-text);
          border-color: var(--red-text);
        }

        .theme-toggle-icon {
          display: block;
        }

        @media (max-width: 480px) {
          .theme-toggle-btn {
            width: 32px;
            height: 32px;
          }
          .theme-toggle-btn svg {
            width: 17px;
            height: 17px;
          }
        }

        @media (max-width: 360px) {
          .theme-toggle-btn {
            width: 28px;
            height: 28px;
          }
          .theme-toggle-btn svg {
            width: 15px;
            height: 15px;
          }
        }
      `}</style>
    </button>
  );
};
