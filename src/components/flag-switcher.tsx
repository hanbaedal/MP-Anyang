"use client";

import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { FLAGS, type Locale, LOCALE_LABEL } from "@/lib/i18n";
import { useLocale, useT } from "@/components/locale-provider";

function FlagSvg({ code }: { code: "KR" | "US" | "JP" | "CN" }) {
  if (code === "KR") {
    return (
      <svg viewBox="0 0 24 16" className="h-3 w-[1.125rem] rounded-[2px] ring-1 ring-black/10 lg:h-4 lg:w-6" aria-hidden>
        <rect width="24" height="16" fill="#fff" />
        <circle cx="12" cy="6.4" r="3.3" fill="#CD2E3A" />
        <circle cx="12" cy="9.6" r="3.3" fill="#0047A0" />
      </svg>
    );
  }
  if (code === "US") {
    return (
      <svg viewBox="0 0 24 16" className="h-3 w-[1.125rem] rounded-[2px] ring-1 ring-black/10 lg:h-4 lg:w-6" aria-hidden>
        <rect width="24" height="16" fill="#BF0A30" />
        <rect y="1.2" width="24" height="1.2" fill="#fff" />
        <rect y="3.6" width="24" height="1.2" fill="#fff" />
        <rect y="6" width="24" height="1.2" fill="#fff" />
        <rect y="8.4" width="24" height="1.2" fill="#fff" />
        <rect y="10.8" width="24" height="1.2" fill="#fff" />
        <rect y="13.2" width="24" height="1.2" fill="#fff" />
        <rect width="10" height="8.6" fill="#002868" />
      </svg>
    );
  }
  if (code === "JP") {
    return (
      <svg viewBox="0 0 24 16" className="h-3 w-[1.125rem] rounded-[2px] ring-1 ring-black/10 lg:h-4 lg:w-6" aria-hidden>
        <rect width="24" height="16" fill="#fff" />
        <circle cx="12" cy="8" r="4.4" fill="#BC002D" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 16" className="h-3 w-[1.125rem] rounded-[2px] ring-1 ring-black/10 lg:h-4 lg:w-6" aria-hidden>
      <rect width="24" height="16" fill="#DE2910" />
      <polygon fill="#FFDE00" points="4.2,2.2 5,4.6 7.6,4.6 5.5,6.1 6.3,8.5 4.2,7 2.1,8.5 2.9,6.1 0.8,4.6 3.4,4.6" />
    </svg>
  );
}

export function FlagSwitcher() {
  const current = useLocale();
  const t = useT();
  const [pending, start] = useTransition();

  function choose(locale: Locale) {
    start(async () => {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      window.location.reload();
    });
  }

  return (
    <div className="flex items-center gap-0" role="group" aria-label={t("lang")} aria-busy={pending}>
      {FLAGS.map(({ locale, code }) => {
        const selected = current === locale;
        return (
          <button
            key={locale}
            type="button"
            disabled={pending}
            onClick={() => choose(locale)}
            aria-label={LOCALE_LABEL[locale]}
            aria-pressed={selected}
            title={LOCALE_LABEL[locale]}
            className={cn(
              "inline-flex size-6 items-center justify-center rounded-md hover:bg-accent lg:size-9",
              selected && "ring-2 ring-primary lg:ring-offset-1",
            )}
          >
            <FlagSvg code={code} />
            <span className="sr-only">{LOCALE_LABEL[locale]}</span>
          </button>
        );
      })}
    </div>
  );
}
