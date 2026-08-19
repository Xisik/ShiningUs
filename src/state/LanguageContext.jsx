import { createContext, useContext, useMemo, useState } from 'react';
import { messages } from '../i18n/messages.js';

const LanguageContext = createContext(null);
const STORAGE_KEY = 'language';

function getInitialLanguage() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'ko';
  } catch {
    return 'ko';
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);

  function setLanguage(nextLanguage) {
    const normalized = nextLanguage === 'en' ? 'en' : 'ko';
    setLanguageState(normalized);
    try {
      localStorage.setItem(STORAGE_KEY, normalized);
    } catch {
      // Ignore unavailable storage.
    }
  }

  const value = useMemo(() => ({
    language,
    setLanguage,
    t(key) {
      return messages[language]?.[key] || messages.ko[key] || key;
    }
  }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}
