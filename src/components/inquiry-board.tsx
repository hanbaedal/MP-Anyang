"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { InquiryForm } from "@/components/inquiry-form";
import { useT } from "@/components/locale-provider";
import type { PublicInquiry } from "@/lib/inquiries";

function formatWhen(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(locale === "zh" ? "zh-CN" : locale === "en" ? "en-US" : "ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function InquiryBoard({
  initial,
  locale,
}: {
  initial: PublicInquiry[];
  locale: string;
}) {
  const t = useT();
  const [items, setItems] = useState(initial);
  const [writeOpen, setWriteOpen] = useState(false);
  const [unlockId, setUnlockId] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [unlockError, setUnlockError] = useState("");
  const [unlockBusy, setUnlockBusy] = useState(false);

  async function refresh() {
    const res = await fetch("/api/inquiries");
    const json = (await res.json()) as { items?: PublicInquiry[] };
    if (json.items) {
      setItems((prev) => {
        const unlocked = new Set(prev.filter((item) => !item.locked && item.visibility === "secret").map((item) => item.id));
        return json.items!.map((item) => {
          if (item.visibility === "secret" && unlocked.has(item.id) && item.locked) {
            const old = prev.find((p) => p.id === item.id);
            return old && !old.locked ? old : item;
          }
          return item;
        });
      });
    }
  }

  async function onUnlock() {
    if (!unlockId) return;
    setUnlockBusy(true);
    setUnlockError("");
    try {
      const res = await fetch("/api/inquiries/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: unlockId, password }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string; item?: PublicInquiry };
      if (!res.ok || !json.ok || !json.item) {
        setUnlockError(json.error || t("inquiry.unlockFail"));
        return;
      }
      setItems((prev) => prev.map((item) => (item.id === json.item!.id ? json.item! : item)));
      setUnlockId(null);
      setPassword("");
    } catch {
      setUnlockError(t("form.errNetwork"));
    } finally {
      setUnlockBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-medium">{t("inquiry.listTitle")}</h2>
        <Button type="button" onClick={() => setWriteOpen(true)}>
          {t("inquiry.write")}
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("inquiry.empty")}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-xl border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 space-y-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                    <span>
                      {item.nameMasked}
                      {item.visibility === "public" ? ` · ${item.phoneMasked}` : ""}
                    </span>
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-normal text-muted-foreground">
                      {item.visibility === "secret" ? t("inquiry.badgeSecret") : t("inquiry.badgePublic")}
                    </span>
                    <span
                      className={
                        item.status === "answered"
                          ? "rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-normal text-primary"
                          : "rounded-md bg-amber-50 px-1.5 py-0.5 text-xs font-normal text-amber-800"
                      }
                    >
                      {item.status === "answered" ? t("inquiry.statusAnswered") : t("inquiry.statusPending")}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">{formatWhen(item.createdAt, locale)}</p>
                </div>
                {item.locked ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setUnlockId(item.id);
                      setPassword("");
                      setUnlockError("");
                    }}
                  >
                    {t("inquiry.unlock")}
                  </Button>
                ) : null}
              </div>

              {item.locked ? (
                <p className="mt-3 text-sm text-muted-foreground">{t("inquiry.secretLocked")}</p>
              ) : (
                <div className="mt-3 space-y-2">
                  <p className="text-sm whitespace-pre-wrap">{item.message}</p>
                  {item.status === "answered" && item.answer ? (
                    <div className="rounded-lg bg-muted/60 px-3 py-2 text-sm">
                      <p className="font-medium text-foreground">{t("inquiry.answerLabel")}</p>
                      <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{item.answer}</p>
                    </div>
                  ) : null}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <Dialog open={writeOpen} onOpenChange={setWriteOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogTitle>{t("inquiry.write")}</DialogTitle>
          <InquiryForm
            onSuccess={() => {
              void refresh().then(() => setWriteOpen(false));
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(unlockId)}
        onOpenChange={(next) => {
          if (!next && !unlockBusy) {
            setUnlockId(null);
            setPassword("");
            setUnlockError("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogTitle>{t("inquiry.unlockTitle")}</DialogTitle>
          <p className="text-sm text-muted-foreground">{t("inquiry.unlockHint")}</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder={t("inquiry.password")}
            autoComplete="current-password"
            disabled={unlockBusy}
          />
          {unlockError ? <p className="text-sm text-destructive">{unlockError}</p> : null}
          <Button type="button" onClick={() => void onUnlock()} disabled={unlockBusy || !password}>
            {unlockBusy ? t("form.sending") : t("inquiry.unlock")}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
