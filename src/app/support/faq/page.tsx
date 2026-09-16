import { PageHero, Prose } from "@/components/page-hero";
import { FaqForm } from "@/components/faq-form";
import { listFaq } from "@/lib/faq";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "faq.title") };
}

export default async function FaqPage() {
  const locale = await readLocale();
  const items = await listFaq();
  return (
    <>
      <PageHero kicker={t(locale, "faq.kicker")} title={t(locale, "faq.title")} lead={t(locale, "faq.lead")} />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1.1fr_0.9fr]">
        {items.length === 0 ? (
          <p className="text-muted-foreground">{t(locale, "faq.empty")}</p>
        ) : (
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.id} className="rounded-xl border bg-card p-5">
                <p className="font-medium">{item.question}</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.answer || t(locale, "faq.pending")}</p>
              </li>
            ))}
          </ul>
        )}
        <div>
          <Prose>
            <h2 className="text-xl">{t(locale, "faq.ask")}</h2>
            <p>{t(locale, "faq.askLead")}</p>
          </Prose>
          <div className="mt-4">
            <FaqForm />
          </div>
        </div>
      </div>
    </>
  );
}
