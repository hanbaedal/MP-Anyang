import { AuthForm } from "@/components/auth-form";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import { afterLoginPath, readSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "account.loginTitle") };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await readSession();
  if (session) redirect(afterLoginPath(session));
  const params = await searchParams;
  return (
    <div className="mx-auto flex min-h-full max-w-6xl items-start px-4 py-10 sm:py-16">
      <AuthForm mode="login" oauthError={params.error === "oauth"} />
    </div>
  );
}
