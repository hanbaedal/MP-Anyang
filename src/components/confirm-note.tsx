"use client";

import { useT } from "@/components/locale-provider";

export function ConfirmNote({ children }: { children: React.ReactNode }) {
  const t = useT();
  return (
    <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950">
      <span className="font-semibold">{t("unconfirmed")}</span> — {children}
    </p>
  );
}
