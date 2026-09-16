import Link from "next/link";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export default async function NotFound() {
  const locale = await readLocale();
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-serif text-3xl">{t(locale, "notFoundTitle")}</h1>
      <p className="mt-3 text-muted-foreground">{t(locale, "notFoundLead")}</p>
      <Button asChild className="mt-6">
        <Link href="/">{t(locale, "goHome")}</Link>
      </Button>
    </div>
  );
}
