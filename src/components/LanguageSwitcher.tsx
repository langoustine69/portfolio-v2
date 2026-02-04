'use client';

import { useState, useRef, useEffect } from 'react';
import { useI18n } from './I18nProvider';
import { Locale, localeNames, localeFlags } from '@/lib/i18n';
import { GlobeAltIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'inline';
  className?: string;
}

export default function LanguageSwitcher({ variant = 'dropdown', className = '' }: LanguageSwitcherProps) {
  const { locale, setLocale, availableLocales } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  if (variant === 'inline') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {availableLocales.map((loc) => (
          <button
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${locale === loc
                ? 'bg-lobster-500 text-white'
                : 'bg-shell-800 text-shell-300 hover:bg-shell-700 hover:text-white'
              }
            `}
            aria-label={`Switch to ${localeNames[loc]}`}
            aria-pressed={locale === loc}
          >
            <span className="mr-1.5">{localeFlags[loc]}</span>
            {localeNames[loc]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-shell-800/50 hover:bg-shell-800 text-shell-300 hover:text-white transition-colors border border-shell-700/50"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select language"
      >
        <GlobeAltIcon className="w-4 h-4" />
        <span className="text-sm">{localeFlags[locale]}</span>
        <span className="text-sm hidden sm:inline">{localeNames[locale]}</span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 py-2 bg-shell-900 border border-shell-700 rounded-xl shadow-xl z-50"
          role="listbox"
          aria-label="Available languages"
        >
          {availableLocales.map((loc) => (
            <button
              key={loc}
              onClick={() => handleLocaleChange(loc)}
              className={`
                w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors
                ${locale === loc
                  ? 'bg-lobster-500/20 text-lobster-400'
                  : 'text-shell-300 hover:bg-shell-800 hover:text-white'
                }
              `}
              role="option"
              aria-selected={locale === loc}
            >
              <span className="text-lg">{localeFlags[loc]}</span>
              <span className="text-sm font-medium">{localeNames[loc]}</span>
              {locale === loc && (
                <span className="ml-auto text-lobster-400">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
