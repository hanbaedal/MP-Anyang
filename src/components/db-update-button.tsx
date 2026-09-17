"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/locale-provider";

type CollectionProgress = {
  name: string;
  percent: number;
  done: number;
  total: number;
};

type ProgressPayload = {
  running?: boolean;
  phase?: string;
  overallPercent?: number;
  collections?: CollectionProgress[];
  message?: string;
};

function Bar({ value, label, detail }: { value: number; label: string; detail?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="mb-0.5 flex items-baseline justify-between gap-2">
        <span className="font-mono text-[11px] text-foreground">{label}</span>
        <span className="tabular-nums text-[11px] text-muted-foreground">
          {detail ? `${detail} · ${pct}%` : `${pct}%`}
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={label}
      >
        <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function applyProgress(
  json: ProgressPayload,
  collections: string[],
  setOverall: (n: number) => void,
  setRows: (rows: CollectionProgress[]) => void,
  setMessage: (s: string) => void,
) {
  if (typeof json.overallPercent === "number") setOverall(json.overallPercent);
  if (json.collections?.length) setRows(json.collections);
  else setRows(collections.map((name) => ({ name, percent: 0, done: 0, total: 0 })));
  if (json.message) setMessage(json.message);
}

export function DbUpdateButton({
  envReady,
  mongoReady,
  mongoDb,
  collections,
}: {
  envReady: boolean;
  mongoReady: boolean;
  mongoDb: string;
  collections: string[];
}) {
  const t = useT();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [overall, setOverall] = useState(0);
  const [rows, setRows] = useState<CollectionProgress[]>(
    collections.map((name) => ({ name, percent: 0, done: 0, total: 0 })),
  );
  const selfRun = useRef(false);

  useEffect(() => {
    let stop = false;
    async function tick() {
      try {
        const res = await fetch("/api/work/sync/progress", { cache: "no-store" });
        const json = (await res.json()) as ProgressPayload;
        if (stop) return;
        applyProgress(json, collections, setOverall, setRows, setMessage);
        if (json.phase === "done") setOverall(100);
        if (json.running) setLoading(true);
        else if (!selfRun.current) setLoading(false);
      } catch {
        /* keep last snapshot */
      }
    }
    void tick();
    if (!loading) {
      return () => {
        stop = true;
      };
    }
    const id = window.setInterval(tick, 400);
    return () => {
      stop = true;
      window.clearInterval(id);
    };
  }, [loading, collections]);

  async function onRun() {
    if (!envReady) return;
    selfRun.current = true;
    setLoading(true);
    setOverall(0);
    setRows(collections.map((name) => ({ name, percent: 0, done: 0, total: 0 })));
    setMessage(t("work.syncing"));
    try {
      const res = await fetch("/api/work/sync", { method: "POST", cache: "no-store" });
      const json = (await res.json()) as { message?: string; error?: string; ok?: boolean };
      const progress = await fetch("/api/work/sync/progress", { cache: "no-store" })
        .then((r) => r.json() as Promise<ProgressPayload>)
        .catch(() => null);
      if (progress) applyProgress(progress, collections, setOverall, setRows, setMessage);
      setOverall(json.ok ? 100 : progress?.overallPercent ?? 0);
      setMessage(json.message || json.error || t("work.offline"));
    } catch {
      setMessage(t("form.errNetwork"));
    } finally {
      selfRun.current = false;
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{envReady ? t("work.sourceEnvReady") : t("work.sourceEnvMissing")}</p>
      <p className="text-sm text-muted-foreground">
        {mongoReady ? t("work.mongoSaveReady", { db: mongoDb }) : t("work.mongoSaveMissing")}
      </p>
      <div>
        <h2 className="text-sm font-medium text-primary">{t("work.mongoCollections")}</h2>
        <ul className="mt-1 font-mono text-xs leading-5 text-foreground">
          {collections.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </div>
      <div className="space-y-3 rounded-md border bg-card p-3">
        <Bar value={overall} label={t("work.progressOverall")} />
        <div className="space-y-2">
          {rows.map((row) => (
            <Bar
              key={row.name}
              value={row.percent}
              label={row.name}
              detail={row.total > 0 ? `${row.done}/${row.total}` : undefined}
            />
          ))}
        </div>
      </div>
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
