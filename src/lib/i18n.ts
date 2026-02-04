// i18n - Internationalization Support
// Supported locales: en, es, zh, ja, de, fr

export type Locale = 'en' | 'es' | 'zh' | 'ja' | 'de' | 'fr';

export const locales: Locale[] = ['en', 'es', 'zh', 'ja', 'de', 'fr'];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  zh: '中文',
  ja: '日本語',
  de: 'Deutsch',
  fr: 'Français',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  zh: '🇨🇳',
  ja: '🇯🇵',
  de: '🇩🇪',
  fr: '🇫🇷',
};

export const defaultLocale: Locale = 'en';

// Nested key access helper
export function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // Return key if not found
    }
  }
  
  return typeof current === 'string' ? current : path;
}

// Interpolation helper for dynamic values
export function interpolate(text: string, values?: Record<string, string | number>): string {
  if (!values) return text;
  
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return values[key]?.toString() ?? `{{${key}}}`;
  });
}
