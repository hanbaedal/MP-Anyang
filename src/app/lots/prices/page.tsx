import { PageHero, Prose } from "@/components/page-hero";
import { ConfirmNote } from "@/components/confirm-note";
import { PRICES, REMAINING, UNCONFIRMED } from "@/lib/facts";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "prices.title") };
}

export default async function PricesPage() {
  const locale = await readLocale();
  return (
    <>
      <PageHero kicker={t(locale, "prices.kicker")} title={t(locale, "prices.title")} lead={t(locale, "prices.lead")} />
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-12">
        <ConfirmNote>{t(locale, "prices.note")}</ConfirmNote>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-3">{t(locale, "prices.product")}</th>
                <th className="px-4 py-3">{t(locale, "prices.won")}</th>
              </tr>
            </thead>
            <tbody>
              {PRICES.map((row) => (
                <tr key={row.nameKey} className="border-t">
                  <td className="px-4 py-3">{t(locale, row.nameKey)}</td>
                  <td className="px-4 py-3 font-medium text-amber-800">{row.won === UNCONFIRMED ? t(locale, "unconfirmed") : row.won}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-3">{t(locale, "prices.kind")}</th>
                <th className="px-4 py-3">{t(locale, "prices.remaining")}</th>
              </tr>
            </thead>
            <tbody>
              {REMAINING.map((row) => (
                <tr key={row.nameKey} className="border-t">
                  <td className="px-4 py-3">{t(locale, row.nameKey)}</td>
                  <td className="px-4 py-3 font-medium text-amber-800">{row.seats === UNCONFIRMED ? t(locale, "unconfirmed") : row.seats}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Prose>
          <p>{t(locale, "prices.deposit")}</p>
        </Prose>
        <Button asChild>
          <Link href="/support/inquiry">{t(locale, "prices.ask")}</Link>
        </Button>
      </div>
    </>
  );
}
