import { Download } from "lucide-react";
import {
  FUNERAL_BURIAL_ROWS,
  FUNERAL_CREMATION_ROWS,
  FUNERAL_DOC_META,
  type FuneralDocFile,
  type FuneralDocId,
} from "@/lib/funeral-docs-types";
import { mediaUrl } from "@/lib/media";
import { Prose } from "@/components/page-hero";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

function DocItems({
  rows,
  docs,
  locale,
}: {
  rows: typeof FUNERAL_BURIAL_ROWS;
  docs: Partial<Record<FuneralDocId, FuneralDocFile>>;
  locale: Locale;
}) {
  return (
    <ul className="list-none space-y-2 pl-0">
      {rows.map((row) => {
        if (row.type === "text") {
          return (
            <li key={row.i18n} className="text-[15px] leading-7 text-foreground/90">
              {t(locale, row.i18n)}
            </li>
          );
        }
        const label = t(locale, FUNERAL_DOC_META[row.docId].i18n);
        const file = docs[row.docId];
        if (file) {
          const href = mediaUrl(file.filePath);
          return (
            <li key={row.docId}>
              <a
                href={href}
                download={file.fileName}
                className="inline-flex flex-wrap items-center gap-1.5 text-[15px] text-primary underline-offset-4 hover:underline"
              >
                <span>{label}</span>
                <Download className="size-4 shrink-0 opacity-80" aria-hidden />
                <span className="sr-only">{t(locale, "fun.docDownload")}</span>
              </a>
            </li>
          );
        }
        return (
          <li key={row.docId} className="text-[15px] leading-7">
            <span className="text-foreground/90">{label}</span>
            <span className="ml-2 text-sm text-muted-foreground">({t(locale, "fun.docPreparing")})</span>
          </li>
        );
      })}
    </ul>
  );
}

export function FuneralDocList({
  locale,
  docs,
}: {
  locale: Locale;
  docs: Partial<Record<FuneralDocId, FuneralDocFile>>;
}) {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Prose>
        <h2 className="text-xl">{t(locale, "fun.burialDocs")}</h2>
        <p className="text-sm text-muted-foreground">{t(locale, "fun.docsPublicHint")}</p>
        <DocItems rows={FUNERAL_BURIAL_ROWS} docs={docs} locale={locale} />
      </Prose>
      <Prose>
        <h2 className="text-xl">{t(locale, "fun.cremationDocs")}</h2>
        <p className="text-sm text-muted-foreground">{t(locale, "fun.docsPublicHint")}</p>
        <DocItems rows={FUNERAL_CREMATION_ROWS} docs={docs} locale={locale} />
      </Prose>
    </div>
  );
}
