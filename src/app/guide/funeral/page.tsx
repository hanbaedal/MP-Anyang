import { FuneralDocList } from "@/components/funeral-doc-list";
import { PageHero, Prose } from "@/components/page-hero";
import { funeralDocsById } from "@/lib/funeral-docs";
import { SITE } from "@/lib/site";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "fun.title") };
}

export default async function FuneralPage() {
  const locale = await readLocale();
  const docs = await funeralDocsById();
  const steps = [
    { n: "1", t: t(locale, "fun.s1t"), d: t(locale, "fun.s1d", { phone: SITE.phone }) },
    { n: "2", t: t(locale, "fun.s2t"), d: t(locale, "fun.s2d") },
    { n: "3", t: t(locale, "fun.s3t"), d: t(locale, "fun.s3d") },
    { n: "4", t: t(locale, "fun.s4t"), d: t(locale, "fun.s4d") },
  ];
  return (
    <>
      <PageHero kicker={t(locale, "fun.kicker")} title={t(locale, "fun.title")} lead={t(locale, "fun.lead")} />
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-12">
        <ol className="grid gap-4 md:grid-cols-4">
          {steps.map((step) => (
            <li key={step.n} className="rounded-xl border bg-card p-4">
              <p className="text-sm text-primary">{step.n}</p>
              <h2 className="mt-1 text-lg">{step.t}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{step.d}</p>
            </li>
          ))}
        </ol>
        <FuneralDocList locale={locale} docs={docs} />
        <Prose>
          <p className="break-keep">{t(locale, "fun.more")}</p>
          <p>
            <a className="text-primary underline-offset-4 hover:underline" href={SITE.phoneTel}>
              {SITE.phone}
            </a>
          </p>
        </Prose>
      </div>
    </>
  );
}
