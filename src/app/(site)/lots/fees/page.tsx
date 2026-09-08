import Link from "next/link";
import { t } from "../../../../lib/i18n-messages";
import { getLocale } from "../../../../lib/locale";
import { SITE } from "../../../../lib/site";

export default async function LotFeesPage() {
  const locale = await getLocale();
  const { prices } = SITE;

  return (
    <article className="article lot-fees-page">
      <p className="kicker">{t(locale, "fees.kicker")}</p>
      <h1>{t(locale, "fees.title")}</h1>
      <p className="lead">{t(locale, "fees.lead")}</p>
      <p className="meta">{t(locale, "fees.source", { asOf: prices.asOf, source: prices.source })}</p>

      <section className="panel lot-fees-section">
        <h2>{t(locale, "fees.priceInfo")}</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t(locale, "fees.item")}</th>
                <th>{t(locale, "fees.amount")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{t(locale, "fees.saleItem")}</td>
                <td>{prices.saleAmount.toLocaleString()}원</td>
              </tr>
              <tr>
                <td>{t(locale, "fees.annualItem")}</td>
                <td>{prices.annualAmount.toLocaleString()}원</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel lot-fees-section">
        <h2>{t(locale, "fees.items")}</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t(locale, "fees.category")}</th>
                <th>{t(locale, "fees.product")}</th>
                <th>{t(locale, "fees.amount")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{prices.saleLabel}</td>
                <td>{prices.saleItem}</td>
                <td>{prices.saleAmount.toLocaleString()}원</td>
              </tr>
              <tr>
                <td>{prices.annualLabel}</td>
                <td>{prices.annualItem}</td>
                <td>{prices.annualAmount.toLocaleString()}원</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel lot-fees-note">
        <h2>{t(locale, "fees.noteTitle")}</h2>
        <p>
          {t(locale, "fees.note1", { phone: SITE.phone }).split(SITE.phone).map((part, index, parts) =>
            index < parts.length - 1 ? (
              <span key={index}>
                {part}
                <a href={`tel:${SITE.phone.replace(/-/g, "")}`}>{SITE.phone}</a>
              </span>
            ) : (
              <span key={index}>{part}</span>
            ),
          )}
        </p>
        <p>
          {t(locale, "fees.note2")}{" "}
          <Link href="/memorial/plans">{t(locale, "fees.memorialLink")}</Link>
        </p>
      </section>
    </article>
  );
}
