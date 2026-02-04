'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Locale, locales, defaultLocale, getNestedValue, interpolate } from '@/lib/i18n';

// Import all locale files
import en from '@/locales/en.json';
import es from '@/locales/es.json';
import zh from '@/locales/zh.json';
import ja from '@/locales/ja.json';
import de from '@/locales/de.json';
import fr from '@/locales/fr.json';

const translations: Record<Locale, Record<string, unknown>> = {
  en,
  es,
  zh,
  ja,
  de,
  fr,
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
  availableLocales: typeof locales;
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = 'langoustine-locale';

function detectBrowserLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;
  
  const browserLang = navigator.language.split('-')[0];
  return locales.includes(browserLang as Locale) ? (browserLang as Locale) : defaultLocale;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);

  // Initialize locale from storage or browser
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && locales.includes(stored)) {
      setLocaleState(stored);
    } else {
      const detected = detectBrowserLocale();
      setLocaleState(detected);
    }
    setMounted(true);
  }, []);

  // Update HTML lang attribute when locale changes
  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = locale;
    }
  }, [locale, mounted]);

  const setLocale = useCallback((newLocale: Locale) => {
    if (locales.includes(newLocale)) {
      setLocaleState(newLocale);
      localStorage.setItem(STORAGE_KEY, newLocale);
    }
  }, []);

  const t = useCallback((key: string, values?: Record<string, string | number>): string => {
    const translation = getNestedValue(translations[locale] as Record<string, unknown>, key);
    return interpolate(translation, values);
  }, [locale]);

  const contextValue = useMemo(() => ({
    locale,
    setLocale,
    t,
    availableLocales: locales,
  }), [locale, setLocale, t]);

  // Prevent hydration mismatch by rendering with default locale first
  if (!mounted) {
    return (
      <I18nContext.Provider value={{
        locale: defaultLocale,
        setLocale,
        t: (key: string, values?: Record<string, string | number>) => 
          interpolate(getNestedValue(translations[defaultLocale] as Record<string, unknown>, key), values),
        availableLocales: locales,
      }}>
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export function useTranslation() {
  const { t, locale } = useI18n();
  return { t, locale };
}
