import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Role } from "@/lib/auth-types";
import { t, type Locale } from "@/lib/i18n";
import { workCopyEmptyLines } from "@/lib/work-copy-text";
import type { WorkStorage } from "@/lib/work-store";

export function WorkCopyEmpty({
  locale,
  role,
  envReady,
  storage,
}: {
  locale: Locale;
  role: Role;
  envReady: boolean;
  storage: WorkStorage;
}) {
  const lines = workCopyEmptyLines({ locale, role, envReady, storage });
  return (
    <div className="space-y-3 rounded-lg border bg-card px-4 py-6">
      {lines.map((line) => (
        <p key={line} className="text-sm text-muted-foreground">
          {line}
        </p>
      ))}
      {role === "supervisor" ? (
        <Button asChild>
          <Link href="/work/sync">{t(locale, "work.dbUpdate")}</Link>
        </Button>
      ) : null}
    </div>
  );
}
