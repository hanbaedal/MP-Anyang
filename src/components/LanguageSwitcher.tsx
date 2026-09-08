"use client";

import type { ReactElement } from "react";
import { LOCALES, LOCALE_META, type Locale } from "../lib/i18n";
import { useI18n } from "./I18nProvider";

function FlagKR() {
  return (
    <svg viewBox="0 0 24 16" aria-hidden="true">
      <rect width="24" height="16" fill="#fff" />
      <circle cx="12" cy="8" r="4.2" fill="#cd2e3a" />
      <path d="M12 8a4.2 4.2 0 0 0 0-8.4 4.2 4.2 0 0 1 0 8.4Z" fill="#0047a0" transform="rotate(180 12 8)" />
      <g fill="#111">
        <rect x="3.1" y="2.2" width="3.6" height="0.55" transform="rotate(-33 4.9 2.5)" />
        <rect x="3.1" y="3.15" width="3.6" height="0.55" transform="rotate(-33 4.9 3.4)" />
        <rect x="3.1" y="4.1" width="3.6" height="0.55" transform="rotate(-33 4.9 4.4)" />
        <rect x="17.3" y="11.3" width="3.6" height="0.55" transform="rotate(-33 19.1 11.6)" />
        <rect x="17.3" y="12.25" width="3.6" height="0.55" transform="rotate(-33 19.1 12.5)" />
        <rect x="17.3" y="13.2" width="3.6" height="0.55" transform="rotate(-33 19.1 13.5)" />
      </g>
    </svg>
  );
}

function FlagUS() {
  return (
    <svg viewBox="0 0 24 16" aria-hidden="true">
      <rect width="24" height="16" fill="#bf0a30" />
      <rect y="1.23" width="24" height="1.23" fill="#fff" />
      <rect y="3.69" width="24" height="1.23" fill="#fff" />
      <rect y="6.15" width="24" height="1.23" fill="#fff" />
      <rect y="8.62" width="24" height="1.23" fill="#fff" />
      <rect y="11.08" width="24" height="1.23" fill="#fff" />
      <rect y="13.54" width="24" height="1.23" fill="#fff" />
      <rect width="10.2" height="8.6" fill="#002868" />
    </svg>
  );
}

function FlagCN() {
  return (
    <svg viewBox="0 0 24 16" aria-hidden="true">
      <rect width="24" height="16" fill="#de2910" />
      <polygon points="5.2,3.2 5.9,5.3 8.1,5.3 6.3,6.6 7,8.7 5.2,7.4 3.4,8.7 4.1,6.6 2.3,5.3 4.5,5.3" fill="#ffde00" />
      <polygon points="9.6,2.4 9.85,3.15 10.65,3.15 10,3.6 10.25,4.35 9.6,3.9 8.95,4.35 9.2,3.6 8.55,3.15 9.35,3.15" fill="#ffde00" />
      <polygon points="11.3,4.1 11.5,4.7 12.15,4.7 11.65,5.1 11.85,5.7 11.3,5.3 10.75,5.7 10.95,5.1 10.45,4.7 11.1,4.7" fill="#ffde00" />
      <polygon points="11.3,6.5 11.5,7.1 12.15,7.1 11.65,7.5 11.85,8.1 11.3,7.7 10.75,8.1 10.95,7.5 10.45,7.1 11.1,7.1" fill="#ffde00" />
      <polygon points="9.6,7.9 9.85,8.65 10.65,8.65 10,9.1 10.25,9.85 9.6,9.4 8.95,9.85 9.2,9.1 8.55,8.65 9.35,8.65" fill="#ffde00" />
    </svg>
  );
}

function FlagJP() {
  return (
    <svg viewBox="0 0 24 16" aria-hidden="true">
      <rect width="24" height="16" fill="#fff" />
      <circle cx="12" cy="8" r="4.4" fill="#bc002d" />
    </svg>
  );
}

const FLAGS: Record<Locale, () => ReactElement> = {
  ko: FlagKR,
  en: FlagUS,
  zh: FlagCN,
  ja: FlagJP,
};

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <nav className="lang-switcher" aria-label={t("lang.label")}>
      {LOCALES.map((code) => {
        const Flag = FLAGS[code];
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            className={`lang-flag${active ? " active" : ""}`}
            aria-pressed={active}
            aria-label={LOCALE_META[code].label}
            title={LOCALE_META[code].label}
            onClick={() => setLocale(code)}
          >
            <Flag />
          </button>
        );
      })}
    </nav>
  );
}
