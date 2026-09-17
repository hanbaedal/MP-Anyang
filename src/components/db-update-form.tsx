"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/locale-provider";

export function DbUpdateForm({ envReady }: { envReady: boolean }) {
  const t = useT();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(t("work.syncing"));
    try {
      const res = await fetch("/api/work/sync", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
      });
      const json = (await res.json()) as { message?: string; error?: string; ok?: boolean };
      setMessage(json.message || json.error || t("work.offline"));
    } catch {
      setMessage(t("work.offline"));
    } finally {
      setLoading(false);
      setPassword("");
    }
  }

  const field =
    "h-9 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-3" autoComplete="off">
      <p className="text-sm text-muted-foreground">{envReady ? t("work.sourceEnvReady") : t("work.sourceEnvMissing")}</p>
      <div className="space-y-1.5">
        <label htmlFor="source-id" className="text-sm font-medium">
          {t("work.sourceId")}
        </label>
        <input
          id="source-id"
          name="source-id"
          value={id}
          onChange={(e) => setId(e.target.value)}
          required={!envReady}
          autoComplete="off"
          className={field}
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="source-password" className="text-sm font-medium">
          {t("work.sourcePassword")}
        </label>
        <input
          id="source-password"
          name="source-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!envReady}
          autoComplete="new-password"
          className={field}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? t("work.syncing") : t("work.dbUpdate")}
      </Button>
      {message ? (
        <p className="text-sm text-muted-foreground" role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
