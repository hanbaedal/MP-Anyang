"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { LOCALE_COOKIE, LOCALE_META, parseLocale, type Locale } from "../lib/i18n";
import { t as translate } from "../lib/i18n-messages";

type I18nContextValue = {
  locale: Locale;
  t: (key: string, vars?: Record<string, string | number>) => string;
  setLocale: (locale: Locale) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale: initialLocale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    setLocaleState(initialLocale);
  }, [initialLocale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      t: (key, vars) => translate(locale, key, vars),
      setLocale: (next) => {
        const resolved = parseLocale(next);
        document.cookie = `${LOCALE_COOKIE}=${resolved}; Path=/; Max-Age=31536000; SameSite=Lax`;
        document.documentElement.lang = LOCALE_META[resolved].htmlLang;
        setLocaleState(resolved);
        window.location.reload();
      },
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return {
      locale: "ko" as Locale,
      t: (key: string, vars?: Record<string, string | number>) => translate("ko", key, vars),
      setLocale: () => undefined,
    };
  }
  return ctx;
}
