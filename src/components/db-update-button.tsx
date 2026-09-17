"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/locale-provider";

export function DbUpdateButton({ envReady }: { envReady: boolean }) {
  const t = useT();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onRun() {
    if (!envReady) return;
    setLoading(true);
    setMessage(t("work.syncing"));
    try {
      const res = await fetch("/api/work/sync", { method: "POST", cache: "no-store" });
      const json = (await res.json()) as { message?: string; error?: string; ok?: boolean };
      setMessage(json.message || json.error || t("work.offline"));
    } catch {
      setMessage(t("work.offline"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{envReady ? t("work.sourceEnvReady") : t("work.sourceEnvMissing")}</p>
      <Button type="button" onClick={onRun} disabled={loading || !envReady}>
        {loading ? t("work.syncing") : t("work.dbUpdate")}
      </Button>
      {message ? (
        <p className="text-sm text-muted-foreground" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
