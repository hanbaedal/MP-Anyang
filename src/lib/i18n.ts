export const LOCALES = ["ko", "en", "zh", "ja"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ko";
export const LOCALE_COOKIE = "ap_locale";

export const LOCALE_META: Record<
  Locale,
  { label: string; htmlLang: string; country: string }
> = {
  ko: { label: "한국어", htmlLang: "ko", country: "대한민국" },
  en: { label: "English", htmlLang: "en", country: "United States" },
  zh: { label: "中文", htmlLang: "zh-CN", country: "中国" },
  ja: { label: "日本語", htmlLang: "ja", country: "日本" },
};

export function parseLocale(value?: string | null): Locale {
  if (value && (LOCALES as readonly string[]).includes(value)) return value as Locale;
  return DEFAULT_LOCALE;
}

export function navKey(href: string) {
  return `nav${href.replaceAll("/", ".")}`;
}
