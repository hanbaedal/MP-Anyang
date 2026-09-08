"use client";

import Link from "next/link";
import { useI18n } from "./I18nProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function AuthLangBar() {
  const { t } = useI18n();
  return (
    <div className="auth-lang-bar">
      <Link href="/" className="auth-lang-home">
        {t("site.shortName")}
      </Link>
      <LanguageSwitcher />
    </div>
  );
}
