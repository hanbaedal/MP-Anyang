import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { after } from "next/server";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import { ANON_VISITOR_COOKIE, isValidVisitorId } from "@/lib/analytics-cookie";
import { PageViewTracker } from "@/components/page-view-tracker";
import { StaffActivityBeacon } from "@/components/staff-activity-beacon";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteSidebar } from "@/components/site-sidebar";
import { LocaleProvider } from "@/components/locale-provider";
import { SITE, metadataBase } from "@/lib/site";
import { LOCALE_HTML, t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import { readSession } from "@/lib/auth";
import { trackPageView } from "@/lib/site-analytics";
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
  const session = await readSession();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/";
  const userAgent = h.get("user-agent");
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip")?.trim() ?? null;
  let visitorId = h.get("x-visitor-id");
  if (!isValidVisitorId(visitorId)) {
    visitorId = (await cookies()).get(ANON_VISITOR_COOKIE)?.value ?? null;
  }
  after(async () => {
    await trackPageView({
      pathname,
      session,
      visitorId: session ? null : visitorId,
      userAgent,
      ip,
    });
  });
  return (
    <html lang={LOCALE_HTML[locale]} className={`${sans.variable} ${serif.variable} h-full overflow-hidden`}>
      <body className="flex h-dvh flex-col overflow-hidden antialiased">
        <LocaleProvider locale={locale}>
          <PageViewTracker />
          {session ? <StaffActivityBeacon /> : null}
          <a
            href="#content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2"
          >
            {t(locale, "skip")}
          </a>
          <SiteHeader signedIn={Boolean(session)} role={session?.role ?? null} />
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <SiteSidebar role={session?.role ?? null} />
            <div id="content" className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain">
              <div className="h-full min-h-full">{children}</div>
            </div>
          </div>
          <SiteFooter />
        </LocaleProvider>
      </body>
    </html>
  );
}
