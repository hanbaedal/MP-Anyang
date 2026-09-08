"use client";

import Link from "next/link";
import { SITE } from "../lib/site";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function AuthLangBar() {
  return (
    <div className="auth-lang-bar">
      <Link href="/" className="auth-lang-home">
        {SITE.shortName}
      </Link>
      <LanguageSwitcher />
    </div>
  );
}
