import type { Metadata } from "next";
import { I18nProvider } from "../components/I18nProvider";
import { LOCALE_META } from "../lib/i18n";
import { t } from "../lib/i18n-messages";
import { getLocale } from "../lib/locale";
import { SITE } from "../lib/site";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: SITE.legalName,
    description: t(locale, "header.slogan"),
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={LOCALE_META[locale].htmlLang}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600&family=Noto+Sans+KR:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;600&family=Noto+Serif+JP:wght@600&family=Noto+Serif+KR:wght@600&family=Noto+Serif+SC:wght@600&display=swap"
        />
      </head>
      <body>
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
