import { SALE_STEPS } from "@/lib/site";

export function SaleSteps({ compact = false }: { compact?: boolean }) {
  return (
    <ol className="grid gap-4 md:grid-cols-5">
      {SALE_STEPS.map((step) => (
        <li key={step.n} className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="font-serif text-sm text-primary">
            {step.n}단계
          </p>
          <h3 className="mt-1 text-base font-semibold text-primary">{step.title}</h3>
          {compact ? null : <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>}
        </li>
      ))}
    </ol>
  );
}
