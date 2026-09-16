import { PageHero } from "@/components/page-hero";
import { AuthForm } from "@/components/auth-form";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import { profileIncomplete, readSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "account.completeTitle") };
}

export default async function CompleteProfilePage() {
  const session = await readSession();
  if (!session) redirect("/account/login");
  if (!profileIncomplete(session)) redirect("/sitemap");
  const locale = await readLocale();
  return (
    <>
      <PageHero kicker={t(locale, "nav.account")} title={t(locale, "account.completeTitle")} lead={t(locale, "account.completeLead")} />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <AuthForm
          mode="complete"
          defaults={{
            username: session.username,
            name: session.name,
            phone: session.phone,
            email: session.email,
            title: session.title,
          }}
        />
      </div>
    </>
  );
}
