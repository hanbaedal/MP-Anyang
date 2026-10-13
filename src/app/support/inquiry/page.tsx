import { InquiryForm } from "@/components/inquiry-form";
import { PageHero } from "@/components/page-hero";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "inquiry.title") };
}

export default async function InquiryPage() {
  const locale = await readLocale();
  return (
    <>
      <PageHero kicker={t(locale, "inquiry.kicker")} title={t(locale, "inquiry.title")} lead={t(locale, "inquiry.lead")} />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <InquiryForm />
      </div>
    </>
  );
}
