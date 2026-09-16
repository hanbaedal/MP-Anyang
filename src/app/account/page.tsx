import Link from "next/link";
import { PageHero, Prose } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import { isStaffRole, profileIncomplete, readSession } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "account.myTitle") };
}

export default async function AccountPage() {
  const locale = await readLocale();
  const session = await readSession();
  if (!session) {
    return (
      <>
        <PageHero kicker={t(locale, "nav.account")} title={t(locale, "account.myTitle")} lead={t(locale, "account.needLogin")} />
        <div className="mx-auto max-w-6xl px-4 py-12">
          <Button asChild>
            <Link href="/account/login">{t(locale, "account.submitLogin")}</Link>
          </Button>
        </div>
      </>
    );
  }
  if (profileIncomplete(session)) redirect("/account/complete");

  return (
    <>
      <PageHero kicker={t(locale, "nav.account")} title={t(locale, "account.myTitle")} lead={t(locale, "account.myLead")} />
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-12">
        <Prose>
          <p>{t(locale, "account.hello", { name: session.name })}</p>
          <p>
            {t(locale, "account.username")}: {session.username}
          </p>
          <p>
            {t(locale, "form.phone")}: {session.phone || "—"}
          </p>
          <p>
            {t(locale, "account.email")}: {session.email || "—"}
          </p>
          {session.title ? (
            <p>
              {t(locale, "account.titleField")}: {session.title}
            </p>
          ) : null}
          <p>
            {t(locale, "phone")}{" "}
            <a className="text-primary underline-offset-4 hover:underline" href={SITE.phoneTel}>
              {SITE.phone}
            </a>
          </p>
        </Prose>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/sitemap">{t(locale, "account.gotoSitemap")}</Link>
          </Button>
          {isStaffRole(session.role) ? (
            <Button asChild variant="outline">
              <Link href="/manage">{t(locale, "header.manage")}</Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link href="/support/inquiry">{t(locale, "nav.inquiry")}</Link>
            </Button>
          )}
          <LogoutButton />
        </div>
      </div>
    </>
  );
}
