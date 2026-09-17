"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/locale-provider";
import { cn } from "@/lib/utils";

export function DbUpdateButton({ className, onDone }: { className?: string; onDone?: () => void }) {
  const t = useT();
  const [message, setMessage] = useState("");

  async function onClick() {
    try {
      const res = await fetch("/api/work/sync", { method: "POST" });
      const json = (await res.json()) as { message?: string; error?: string };
      setMessage(json.message || json.error || t("work.offline"));
    } catch {
      setMessage(t("work.offline"));
    }
    onDone?.();
  }

  return (
    <div className={cn("px-1 py-1", className)}>
      <Button type="button" size="xs" variant="outline" className="h-6 w-full justify-start px-1 text-[11px]" onClick={onClick}>
        {t("work.dbUpdate")}
      </Button>
      {message ? (
        <p className="mt-1 px-0.5 text-[10px] leading-tight text-muted-foreground" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
