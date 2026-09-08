import { t } from "../../../lib/i18n-messages";
import { getLocale } from "../../../lib/locale";
import { ConsultFormClient } from "./ConsultFormClient";

export default async function ConsultPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; source?: string; type?: string }>;
}) {
  const { ok, source, type } = await searchParams;
  const locale = await getLocale();
  const lotDefault = type === "memorial" ? "추모 대행" : "봉안묘";
  const sourceValue = source || (type === "memorial" ? "memorial" : "consult");

  return (
    <article className="article">
      <p className="kicker">{t(locale, "consult.kicker")}</p>
      <h1>{t(locale, "consult.title")}</h1>
      <p className="lead">{t(locale, "consult.lead")}</p>
      <p className="meta">
        {t(locale, "consult.meta")} <a href="/lots/fees">{t(locale, "nav.lots.fees")}</a>
      </p>
      {ok === "1" && <p className="ok">{t(locale, "consult.ok")}</p>}
      <ConsultFormClient lotDefault={lotDefault} sourceValue={sourceValue} />
    </article>
  );
}
