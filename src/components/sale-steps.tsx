"use client";

import { SALE_STEPS } from "@/lib/site";
import { useT } from "@/components/locale-provider";

export function SaleSteps({ compact = false }: { compact?: boolean }) {
  const t = useT();
  return (
    <ol className="grid gap-4 md:grid-cols-5">
      {SALE_STEPS.map((step) => (
        <li key={step.n} className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="font-serif text-sm text-primary">{t("step.n", { n: step.n })}</p>
          <h3 className="mt-1 text-base font-semibold text-primary">{t(step.titleKey)}</h3>
          {compact ? null : <p className="mt-2 text-sm text-muted-foreground">{t(step.textKey)}</p>}
        </li>
      ))}
    </ol>
  );
}
