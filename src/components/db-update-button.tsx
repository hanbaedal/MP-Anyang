"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/locale-provider";

type CollectionProgress = {
  name: string;
  percent: number;
  done: number;
  total: number;
  active?: boolean;
};

type ProgressPayload = {
  running?: boolean;
  phase?: string;
  overallPercent?: number;
  activeCollection?: string | null;
  collections?: CollectionProgress[];
  message?: string;
};

function Percent({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return <span className="tabular-nums text-lg font-semibold leading-none text-foreground">{pct}%</span>;
}

function Bar({
  value,
  label,
  detail,
  active,
  activeLabel,
}: {
  value: number;
  label: string;
  detail?: string;
  active?: boolean;
  activeLabel?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={active ? "rounded-md bg-accent/60 px-2 py-1.5" : ""}>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="flex min-w-0 flex-wrap items-baseline gap-x-2">
          <span className="font-mono text-sm text-foreground">{label}</span>
          {active && activeLabel ? <span className="text-xs font-medium text-primary">{activeLabel}</span> : null}
          {detail ? <span className="text-[11px] tabular-nums text-muted-foreground">{detail}</span> : null}
        </span>
        <Percent value={pct} />
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={`${label} ${pct}%`}
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
  setActive: (name: string | null) => void,
) {
  if (typeof json.overallPercent === "number") setOverall(json.overallPercent);
  if (json.collections?.length) setRows(json.collections);
  else setRows(collections.map((name) => ({ name, percent: 0, done: 0, total: 0, active: false })));
  if (json.message) setMessage(json.message);
  setActive(json.activeCollection ?? json.collections?.find((row) => row.active)?.name ?? null);
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
  const [active, setActive] = useState<string | null>(null);
  const [rows, setRows] = useState<CollectionProgress[]>(
    collections.map((name) => ({ name, percent: 0, done: 0, total: 0, active: false })),
  );
  const selfRun = useRef(false);

  useEffect(() => {
    let stop = false;
    async function tick() {
      try {
        const res = await fetch("/api/work/sync/progress", { cache: "no-store" });
        const json = (await res.json()) as ProgressPayload;
        if (stop) return;
        applyProgress(json, collections, setOverall, setRows, setMessage, setActive);
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
    setActive(null);
    setRows(collections.map((name) => ({ name, percent: 0, done: 0, total: 0, active: false })));
    setMessage(t("work.syncing"));
    try {
      const res = await fetch("/api/work/sync", { method: "POST", cache: "no-store" });
      const json = (await res.json()) as { message?: string; error?: string; ok?: boolean };
      const progress = await fetch("/api/work/sync/progress", { cache: "no-store" })
        .then((r) => r.json() as Promise<ProgressPayload>)
        .catch(() => null);
      if (progress) applyProgress(progress, collections, setOverall, setRows, setMessage, setActive);
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
      <div className="space-y-3 rounded-md border bg-card p-3">
        <div>
          <h2 className="text-sm font-medium text-primary">{t("work.mongoCollections")}</h2>
          <p className="mt-1 font-mono text-sm text-foreground">
            {active ? t("work.progressNowName", { name: active }) : t("work.progressNowIdle")}
          </p>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-b pb-2">
          <span className="text-sm font-medium">{t("work.progressOverall")}</span>
          <Percent value={overall} />
        </div>
        <div
          className="h-2.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.max(0, Math.min(100, overall))}
          aria-label={t("work.progressOverall")}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${Math.max(0, Math.min(100, overall))}%` }}
          />
        </div>
        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={row.name}>
              <Bar
                value={row.percent}
                label={row.name}
                detail={row.total > 0 ? `${row.done}/${row.total}` : undefined}
                active={Boolean(row.active) || active === row.name}
                activeLabel={t("work.progressNow")}
              />
            </li>
          ))}
        </ul>
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
