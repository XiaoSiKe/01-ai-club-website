import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
import { createTranslator, initialLocale, LOCALE_STORAGE_KEY, normalizeLocale } from './i18n/translate';
import './i18n/language.css';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState(initialLocale);
  const t = useMemo(() => createTranslator(locale), [locale]);
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }), [locale]);
  const formatDate = useCallback(date => dateFormatter.format(new Date(`${date}T12:00:00Z`)), [dateFormatter]);
  const changeLocale = useCallback(value => {
    const next = normalizeLocale(value);
    if (next) setLocale(next);
  }, []);

  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.locale = locale;
    try { localStorage.setItem(LOCALE_STORAGE_KEY, locale); } catch { /* Switching also works without storage. */ }
    // Keep an explicitly shared language URL in sync without changing the page or anchor.
    const url = new URL(window.location.href);
    if (url.searchParams.has('lang')) {
      url.searchParams.set('lang', locale);
      window.history.replaceState(window.history.state, '', url);
    }
    const brand = t('零一 AI 日新社｜01AIClub');
    document.querySelector('meta[name="description"]')?.setAttribute('content', `${brand} — ${t('从零到一，让技术进步成为每个人的机会')}`);
    for (const property of ['og:site_name', 'og:title']) {
      document.querySelector(`meta[property="${property}"]`)?.setAttribute('content', brand);
    }
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', t('从零到一，让技术进步成为每个人的机会'));
  }, [locale, t]);

  const value = useMemo(() => ({ locale, setLocale: changeLocale, t, formatDate }), [locale, changeLocale, t, formatDate]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
