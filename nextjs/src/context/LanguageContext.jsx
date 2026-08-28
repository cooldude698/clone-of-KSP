'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TRANSLATIONS, SUPPORTED_LANGUAGES } from '@/lib/translations';

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key, fallback) => fallback || key,
  supportedLanguages: SUPPORTED_LANGUAGES,
  currentLanguageObj: SUPPORTED_LANGUAGES[0],
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('drishti_lang');
      if (saved && ['en', 'kn', 'hi'].includes(saved)) {
        setLanguageState(saved);
      }
    } catch (e) {}
  }, []);

  const setLanguage = useCallback((newLang) => {
    if (!['en', 'kn', 'hi'].includes(newLang)) return;
    setLanguageState(newLang);
    try {
      localStorage.setItem('drishti_lang', newLang);
      window.dispatchEvent(new CustomEvent('drishti_lang_change', { detail: newLang }));
    } catch (e) {}
  }, []);

  const t = useCallback((key, fallback = '') => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (dict && dict[key]) return dict[key];
    if (TRANSLATIONS.en && TRANSLATIONS.en[key]) return TRANSLATIONS.en[key];
    return fallback || key;
  }, [language]);

  const currentLanguageObj = SUPPORTED_LANGUAGES.find(l => l.id === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, supportedLanguages: SUPPORTED_LANGUAGES, currentLanguageObj }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
