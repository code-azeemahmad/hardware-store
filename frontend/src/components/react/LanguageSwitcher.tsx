import React from 'react';

interface LanguageSwitcherProps {
  currentLang: 'en' | 'ur';
  currentPath: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ currentLang, currentPath }) => {
  // Determine target path
  let targetPath = '/';
  if (currentLang === 'en') {
    // Switch to Urdu: prepend /ur
    targetPath = currentPath === '/' ? '/ur/' : `/ur${currentPath.startsWith('/') ? '' : '/'}${currentPath}`;
  } else {
    // Switch to English: remove /ur prefix
    targetPath = currentPath.replace(/^\/ur(\/|$)/, '/') || '/';
  }

  return (
    <div className="language-switcher" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}>
      <a
        href={targetPath}
        className="lang-pill"
        style={{
          padding: '0.25rem 0.6rem',
          borderRadius: '4px',
          border: '1px solid var(--border)',
          fontWeight: 600,
          color: 'var(--text)',
          textDecoration: 'none',
          backgroundColor: 'var(--bg-alt)',
        }}
        title={currentLang === 'en' ? 'اردو میں دیکھیں' : 'Switch to English'}
      >
        {currentLang === 'en' ? 'اردو' : 'EN'}
      </a>
    </div>
  );
};
