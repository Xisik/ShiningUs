import { useEffect, useState } from 'react';
import { useLanguage } from '../state/LanguageContext.jsx';
import { useTheme } from '../state/ThemeContext.jsx';
import { toHash } from '../router/useHashRoute.js';
import { Footer } from './Footer.jsx';

const navItems = [
  ['/', 'home', '\uf015'],
  ['/about', 'about', '\uf129'],
  ['/activities', 'activities', '\uf073'],
  ['/statements', 'statements', '\uf15c'],
  ['/region', 'region', '\uf0ac'],
  ['/poli', 'poli', '\uf24e'],
  ['/payments', 'payments', '\uf09d'],
  ['/donate', 'donate', '\uf004'],
  ['/contact', 'contact', '\uf0e0']
];

export function Layout({ activePath, children }) {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);


  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dataset.language = language;
  }, [language]);

  useEffect(() => {
    if (!menuOpen) {
      document.body.classList.remove('nav-open');
      return undefined;
    }

    document.body.classList.add('nav-open');

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('nav-open');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <>
      <header className="site-header">
        <div className="container">
          <div className="header-bar">
            <a className="brand-link" href={toHash('/')} aria-label={t('brand')}>
              <img className="logo" src="./assets/img/logo.jpg" alt={t('brand')} />
            </a>

            <nav className={`nav${menuOpen ? ' is-open' : ''}`} id="siteNav" aria-label="Primary menu">
              <button
                type="button"
                className="nav-close"
                aria-label={t('closeMenu')}
                onClick={() => setMenuOpen(false)}
              >
                <span className="nav-close-icon" aria-hidden="true">{'\uf00d'}</span>
              </button>

              {navItems.map(([path, key, icon]) => (
                  <a
                      key={path}
                      className={`nav-link${activePath === path ? ' is-active' : ''}`}
                      href={toHash(path)}
                      onClick={() => setMenuOpen(false)}
                  >
                    <span className="nav-icon" aria-hidden="true">{icon}</span>
                    <span className="nav-label">{t(key)}</span>
                  </a>
              ))}
            </nav>

            <div className="header-actions">
              <button
                type="button"
                className="menu-toggle"
                aria-controls="siteNav"
                aria-expanded={menuOpen}
                aria-label={t('menu')}
                onClick={() => setMenuOpen((open) => !open)}
              >
                {t('menu')}
              </button>

              <button
                type="button"
                className="theme-toggle"
                aria-pressed={theme === 'dark'}
                aria-label={theme === 'dark' ? t('lightMode') : t('darkMode')}
                onClick={toggleTheme}
              >
                {theme === 'dark' ? (
                  <svg className="theme-toggle-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="18.36" x2="5.64" y2="16.93" />
                    <line x1="18.36" y1="4.22" x2="19.78" y2="5.64" />
                  </svg>
                ) : (
                  <svg className="theme-toggle-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>

              <div className="language-switch" role="group" aria-label="Language">
                <button
                  type="button"
                  className={`language-option${language === 'ko' ? ' is-active' : ''}`}
                  aria-pressed={language === 'ko'}
                  onClick={() => setLanguage('ko')}
                >
                  KOR
                </button>
                <button
                  type="button"
                  className={`language-option${language === 'en' ? ' is-active' : ''}`}
                  aria-pressed={language === 'en'}
                  onClick={() => setLanguage('en')}
                >
                  ENG
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {children}

      <Footer />
    </>
  );
}
