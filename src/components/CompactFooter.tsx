"use client";

import Link from "next/link";
import { SITE } from "../lib/site";
import { useI18n } from "./I18nProvider";
import { SocialBar } from "./SocialBar";

export function CompactFooter({ light = false }: { light?: boolean }) {
  const { t } = useI18n();
  return (
    <footer className={`compact-footer ${light ? "light" : ""}`}>
      <SocialBar light={light} />
      <p className="compact-footer-info">
        {SITE.addressShort} · {t("footer.office")} {SITE.phone}
      </p>
      <p className="compact-footer-home">
        <Link href="/">{t("footer.home")}</Link>
      </p>
    </footer>
  );
}
