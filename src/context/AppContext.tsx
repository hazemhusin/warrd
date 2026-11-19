import React, { createContext, useContext, useEffect, useState } from 'react';
import { translations } from '../i18n/translations.ts';
import type { Lang } from '../i18n/translations.ts';

export type RoutePath =
  | '/'
  | '/services'
  | '/products'
  | '/quote'
  | '/track'
  | '/about'
  | '/faq'
  | '/contact'
  | '/admin';

interface AppContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (typeof translations)['ar'] | (typeof translations)['en'];
  route: string;
  queryParams: URLSearchParams;
  navigate: (to: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem('wardly_lang');
      return saved === 'en' ? 'en' : 'ar';
    } catch {
      return 'ar';
    }
  });

  const [locationState, setLocationState] = useState(() => ({
    pathname: window.location.pathname || '/',
    search: window.location.search || '',
  }));

  useEffect(() => {
    const onPopState = () => {
      setLocationState({
        pathname: window.location.pathname || '/',
        search: window.location.search || '',
      });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;

    const currentT = translations[lang];
    document.title = currentT.seo.title;
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute('content', currentT.seo.description);
    }
    try {
      localStorage.setItem('wardly_lang', lang);
    } catch {
      // ignore storage errors
    }
  }, [lang]);

  const setLang = (next: Lang) => setLangState(next);
  const toggleLang = () => setLangState((prev) => (prev === 'ar' ? 'en' : 'ar'));

  const navigate = (to: string) => {
    const url = new URL(to, window.location.origin);
    if (url.pathname === locationState.pathname && url.search === locationState.search) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.history.pushState({}, '', `${url.pathname}${url.search}`);
    setLocationState({
      pathname: url.pathname,
      search: url.search,
    });
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        t: translations[lang],
        route: locationState.pathname,
        queryParams: new URLSearchParams(locationState.search),
        navigate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
