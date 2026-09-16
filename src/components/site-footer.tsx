import Link from "next/link";
import { SITE, siteUrl } from "@/lib/site";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export async function SiteFooter() {
  const locale = await readLocale();
  const url = siteUrl();

  return (
    <footer className="mt-auto border-t bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-serif text-xl">{SITE.legalName}</p>
          <p className="mt-3 text-sm/6 text-primary-foreground/80">
            {t(locale, "footer.visit")}: {SITE.address} ({SITE.visitName})
            <br />
            {SITE.addressAlt}
            <br />
            {t(locale, "phone")}{" "}
            <a className="underline-offset-4 hover:underline" href={SITE.phoneTel}>
              {SITE.phone}
            </a>
            {SITE.postalCode ? ` · ${SITE.postalCode}` : null}
          </p>
          <p className="mt-3 text-xs text-primary-foreground/70">
            {t(locale, "hoursNote")}: {t(locale, "hoursWeekday")} · {t(locale, "hoursWeekend")} · {t(locale, "hoursHoliday")}
          </p>
          {url ? (
            <p className="mt-3 text-sm text-primary-foreground/80">
              {t(locale, "footer.site")}{" "}
              <a className="underline-offset-4 hover:underline" href={url}>
                {url.replace(/^https?:\/\//, "")}
              </a>
            </p>
          ) : null}
        </div>
        <div className="text-sm">
          <p className="mb-2 font-medium">{t(locale, "footer.links")}</p>
          <ul className="space-y-1 text-primary-foreground/80">
            <li>
              <Link className="hover:underline" href="/lots/prices">
                {t(locale, "nav.prices")}
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="/guide/procedure">
                {t(locale, "nav.procedure")}
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="/support/faq">
                {t(locale, "nav.faq")}
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="/support/inquiry">
                {t(locale, "nav.inquiry")}
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-2 font-medium">{t(locale, "footer.info")}</p>
          <ul className="space-y-1 text-primary-foreground/80">
            <li>
              <Link className="hover:underline" href="/sitemap">
                {t(locale, "footer.sitemap")}
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="/privacy">
                {t(locale, "footer.privacy")}
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="/pay">
                {t(locale, "nav.pay")}
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="/account/login">
                {t(locale, "nav.account")}
              </Link>
            </li>
            <li>
              <a className="hover:underline" href={SITE.phoneTel}>
                {t(locale, "phone")} {SITE.phone}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
