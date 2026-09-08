"use client";

import Link from "next/link";
import { SITE } from "../lib/site";
import { useI18n } from "./I18nProvider";
import { SocialBar } from "./SocialBar";

export function CompactFooter({ light = false }: { light?: boolean }) {
  const { t, locale } = useI18n();
  return (
    <footer className={`compact-footer ${light ? "light" : ""}`}>
      <SocialBar light={light} />
      <p className="compact-footer-info">
        {t("site.addressShort")} · {t("footer.office")} {SITE.phone}
      </p>
      {locale !== "ko" ? (
        <p className="compact-footer-official">{SITE.addressShort}</p>
      ) : null}
      <p className="compact-footer-home">
        <Link href="/">{t("footer.home")}</Link>
      </p>
    </footer>
  );
}
