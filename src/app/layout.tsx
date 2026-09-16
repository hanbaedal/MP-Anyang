import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteSidebar } from "@/components/site-sidebar";
import { LocaleProvider } from "@/components/locale-provider";
import { SITE, metadataBase } from "@/lib/site";
import { LOCALE_HTML, t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import "./globals.css";

export const dynamic = "force-dynamic";

const sans = Noto_Sans_KR({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const serif = Noto_Serif_KR({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: metadataBase(),
  title: {
    default: SITE.legalName,
    template: `%s | ${SITE.legalName}`,
  },
  description: SITE.description,
  formatDetection: { telephone: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await readLocale();
  return (
    <html lang={LOCALE_HTML[locale]} className={`${sans.variable} ${serif.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <LocaleProvider locale={locale}>
          <a
            href="#content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2"
          >
            {t(locale, "skip")}
          </a>
          <SiteHeader />
          <div className="flex min-h-0 flex-1">
            <SiteSidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <div id="content" className="flex-1">
                {children}
              </div>
              <SiteFooter />
            </div>
          </div>
        </LocaleProvider>
      </body>
    </html>
  );
}
