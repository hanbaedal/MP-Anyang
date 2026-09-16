import { PageHero } from "@/components/page-hero";
import { AuthForm } from "@/components/auth-form";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import { readSession } from "@/lib/members";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "account.registerTitle") };
}

export default async function RegisterPage() {
  const session = await readSession();
  if (session) redirect("/account");
  const locale = await readLocale();
  return (
    <>
      <PageHero kicker={t(locale, "nav.account")} title={t(locale, "account.registerTitle")} lead={t(locale, "account.registerLead")} />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <AuthForm mode="register" />
      </div>
    </>
  );
}
