"use client";

import { Paragraphs } from "@/components/paragraphs";
import { SALE_STEPS, pastelCardClass } from "@/lib/site";
import { useT } from "@/components/locale-provider";
import { cn } from "@/lib/utils";

export type SaleStepView = { n: string; title: string; text: string };

export function SaleSteps({
  compact = false,
  steps,
}: {
  compact?: boolean;
  /** CMS에서 넘긴 단계. 없으면 i18n 기본 5단계 */
  steps?: SaleStepView[];
}) {
  const t = useT();
  const rows: SaleStepView[] =
    steps && steps.length
      ? steps
      : SALE_STEPS.map((step) => ({
          n: step.n,
          title: t(step.titleKey),
          text: t(step.textKey),
        }));

  return (
    <ol className="grid gap-4 md:grid-cols-5">
      {rows.map((step, index) => (
        <li key={`${step.n}-${step.title}`} className={cn("rounded-xl border p-4 shadow-sm", pastelCardClass(index))}>
          <p className="font-serif text-sm text-primary">{t("step.n", { n: step.n })}</p>
          <h3 className="mt-1 text-base font-semibold text-primary">{step.title}</h3>
          {compact || !step.text ? null : (
            <div className="mt-2 space-y-2 text-sm text-muted-foreground">
              <Paragraphs text={step.text} />
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
