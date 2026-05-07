import { createContext, useContext, useState, ReactNode } from 'react';
import { Locale, messages } from './messages';

type I18nContextType = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

function getBrowserLocale(): Locale {
  const lang = ((navigator.languages?.[0] || navigator.language) ?? 'en').toLowerCase().slice(0, 2);
  if (lang === 'pt') return 'pt';
  if (lang === 'es') return 'es';
  return 'en';
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(getBrowserLocale);

  function t(key: string): string {
    return messages[locale][key] ?? messages.en[key] ?? key;
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
