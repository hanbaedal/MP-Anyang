import { PageHero } from "@/components/page-hero";
import { AuthForm } from "@/components/auth-form";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import { readSession } from "@/lib/members";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "account.loginTitle") };
}

export default async function LoginPage() {
  const session = await readSession();
  if (session) redirect("/account");
  const locale = await readLocale();
  return (
    <>
      <PageHero kicker={t(locale, "nav.account")} title={t(locale, "account.loginTitle")} lead={t(locale, "account.loginLead")} />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <AuthForm mode="login" />
      </div>
    </>
  );
}
