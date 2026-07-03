import { useEffect, useState } from 'react';
import { useLanguage } from '../state/LanguageContext.jsx';
import { useTheme } from '../state/ThemeContext.jsx';
import { toHash } from '../router/useHashRoute.js';
import { Footer } from './Footer.jsx';

const navItems = [
  ['/', 'home'],
  ['/about', 'about'],
  ['/activities', 'activities'],
  ['/statements', 'statements'],
  ['/payments', 'payments'],
  ['/contact', 'contact'],
  ['/donate', 'donate'],
  ['/region', 'region'],
  ['/poli', 'poli']
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
                <span className="nav-close-icon" aria-hidden="true">{'\u2715'}</span>
              </button>

              {navItems.map(([path, key]) => (
                  <a
                      key={path}
                      className={`nav-link${activePath === path ? ' is-active' : ''}`}
                      href={toHash(path)}
                      onClick={() => setMenuOpen(false)}
                  >
                    {t(key)}
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
                <span aria-hidden="true">{theme === 'dark' ? '\u2600' : '\u263E'}</span>
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
