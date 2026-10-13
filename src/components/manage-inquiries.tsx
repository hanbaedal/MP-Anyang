"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type Inquiry = {
  id: string;
  name: string;
  phone: string;
  message: string;
  createdAt: string;
  status: "new" | "answered";
  answer: string;
  answeredAt?: string;
  answeredBy?: string;
  visibility?: "public" | "secret";
  smsStatus?: "sent" | "failed" | "skipped";
  smsError?: string;
  smsSentAt?: string;
  smsTo?: string;
};

const area =
  "min-h-28 w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

function smsLabel(item: Inquiry) {
  if (item.smsStatus === "sent") {
    return `문자 발송됨${item.smsTo ? ` → ${item.smsTo}` : ""}`;
  }
  if (item.smsStatus === "failed") {
    return `문자 실패${item.smsError ? `: ${item.smsError}` : ""}`;
  }
  if (item.smsStatus === "skipped") {
    return "문자 미발송 (홈페이지 답변만)";
  }
  return null;
}

type SolapiStatus = {
  configured?: boolean;
  authOk?: boolean;
  from?: string | null;
  error?: string;
  balance?: { balance?: number; point?: number };
};

export function ManageInquiries({ initial }: { initial: Inquiry[] }) {
  const [items, setItems] = useState(initial);
  const [solapi, setSolapi] = useState<SolapiStatus | null>(null);
  const [open, setOpen] = useState<Inquiry | null>(null);
  const [answer, setAnswer] = useState("");
  const [sendSms, setSendSms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function refresh() {
    const res = await fetch("/api/manage/inquiries");
    const json = (await res.json()) as { items?: Inquiry[]; solapi?: SolapiStatus };
    if (json.items) setItems(json.items);
    if (json.solapi) setSolapi(json.solapi);
  }

  async function onSave() {
    if (!open) return;
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/manage/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: open.id, answer, sendSms }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        sms?: { ok?: boolean; skipped?: boolean; error?: string; to?: string };
      };
      if (!res.ok || !json.ok) {
        setMessage(json.error || "저장에 실패했습니다.");
        return;
      }
      setOpen(null);
      setAnswer("");
      setSendSms(false);
      if (json.sms?.ok) {
        setMessage(`홈페이지에 답변을 올렸고 ${json.sms.to ?? open.phone}으로 문자도 보냈습니다.`);
      } else if (sendSms && json.sms?.error) {
        setMessage(`홈페이지 답변은 저장했지만 문자 발송에 실패했습니다. ${json.sms.error}`);
      } else {
        setMessage("홈페이지 문의 목록에 답변을 저장했습니다. 문자는 보내지 않았습니다.");
      }
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const cash = (solapi?.balance?.balance || 0) + (solapi?.balance?.point || 0);
  const balanceTooLow = Boolean(solapi?.authOk) && cash <= 0;
  const solapiBlocked = Boolean(solapi) && (!solapi?.authOk || balanceTooLow);

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-10">
      {solapi ? (
        <p
          className={
            solapi.authOk && (solapi.balance?.balance || 0) + (solapi.balance?.point || 0) > 0
              ? "text-sm text-primary"
              : "text-sm text-destructive"
          }
        >
          {!solapi.authOk
            ? `솔라피 미연결 · ${solapi.error || "문자 발송 설정을 확인해 주세요."}`
            : (solapi.balance?.balance || 0) + (solapi.balance?.point || 0) <= 0
              ? `솔라피 연결됨(발신 ${solapi.from ?? "01051492949"}) · 잔액 0원 — 콘솔에서 충전해야 문자가 갑니다.`
              : `솔라피 연결됨 · 발신 ${solapi.from ?? "01051492949"} · 잔액 ${solapi.balance?.balance ?? 0}원`}
        </p>
      ) : null}
      {items.length === 0 ? <p className="text-muted-foreground">접수된 문의가 없습니다.</p> : null}
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <ul className="space-y-3">
        {items.map((item) => {
          const sms = smsLabel(item);
          return (
            <li key={item.id} className="rounded-xl border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {item.name} · {item.phone}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {item.visibility === "secret" ? "비밀" : "일반"} ·{" "}
                      {item.status === "answered" ? "답변됨" : "미답변"}
                    </span>
                  </p>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{item.message}</p>
                  {item.answer ? <p className="mt-2 text-sm text-muted-foreground">답변: {item.answer}</p> : null}
                  {sms ? <p className="mt-1 text-xs text-muted-foreground">{sms}</p> : null}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setOpen(item);
                    setAnswer(item.answer || "");
                    setSendSms(false);
                  }}
                >
                  답변
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
      <Dialog open={Boolean(open)} onOpenChange={(next) => !next && !busy && setOpen(null)}>
        <DialogContent>
          <DialogTitle>문의 답변</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {open?.name} · {open?.phone}
            {open?.visibility === "secret" ? " · 비밀글" : " · 일반"}. 답변은 홈페이지 문의 목록에 항상
            표시됩니다. 문자는 아래에서 선택한 경우에만 보냅니다.
          </p>
          <p className="text-sm whitespace-pre-wrap">{open?.message}</p>
          <textarea
            className={area}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="민원인에게 보낼 답변"
            disabled={busy}
          />
          <fieldset className="space-y-2 rounded-md border p-3">
            <legend className="px-1 text-sm font-medium">문자 발송</legend>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="radio"
                name="sendSms"
                className="mt-1"
                checked={!sendSms}
                disabled={busy}
                onChange={() => setSendSms(false)}
              />
              <span>
                홈페이지에만 답변
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  문의·상담 목록에만 올리고 문자는 보내지 않습니다.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="radio"
                name="sendSms"
                className="mt-1"
                checked={sendSms}
                disabled={busy}
                onChange={() => setSendSms(true)}
              />
              <span>
                홈페이지 답변 + 문자(솔라피)
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  목록에 올린 뒤 {open?.phone}으로도 문자를 보냅니다.
                </span>
              </span>
            </label>
          </fieldset>
          {sendSms && solapiBlocked ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600" role="alert">
              {!solapi?.authOk
                ? `경고: 솔라피가 연결되지 않아 문자를 보낼 수 없습니다. ${solapi?.error || "문자 발송 설정을 확인해 주세요."}`
                : `경고: 솔라피 잔액이 부족하여 문자를 보낼 수 없습니다. (현재 ${solapi?.balance?.balance ?? 0}원) 콘솔에서 충전한 뒤 다시 시도해 주세요. 홈페이지 답변 저장은 가능합니다.`}
            </p>
          ) : null}
          <Button type="button" onClick={() => void onSave()} disabled={busy || !answer.trim()}>
            {busy ? "처리 중…" : sendSms ? "저장하고 문자 보내기" : "홈페이지에 답변 저장"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
