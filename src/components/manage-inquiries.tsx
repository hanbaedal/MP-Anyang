"use client";

import { useState } from "react";
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
};

const area =
  "min-h-28 w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ManageInquiries({ initial }: { initial: Inquiry[] }) {
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState<Inquiry | null>(null);
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");

  async function refresh() {
    const res = await fetch("/api/manage/inquiries");
    const json = (await res.json()) as { items?: Inquiry[] };
    if (json.items) setItems(json.items);
  }

  async function onSave() {
    if (!open) return;
    const res = await fetch("/api/manage/inquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: open.id, answer }),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !json.ok) {
      setMessage(json.error || "저장에 실패했습니다.");
      return;
    }
    setOpen(null);
    setAnswer("");
    setMessage("관리 메모로 저장했습니다. 민원인에게 메일을 보내지 않습니다.");
    await refresh();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-10">
      {items.length === 0 ? <p className="text-muted-foreground">접수된 문의가 없습니다.</p> : null}
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="rounded-xl border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {item.name} · {item.phone}
                  <span className="ml-2 text-xs text-muted-foreground">{item.status === "answered" ? "답변 메모 있음" : "미답변"}</span>
                </p>
                <p className="mt-1 text-sm whitespace-pre-wrap">{item.message}</p>
                {item.answer ? <p className="mt-2 text-sm text-muted-foreground">메모: {item.answer}</p> : null}
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setOpen(item);
                  setAnswer(item.answer || "");
                }}
              >
                답변 메모
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <Dialog open={Boolean(open)} onOpenChange={(next) => !next && setOpen(null)}>
        <DialogContent>
          <DialogTitle>문의 답변 메모</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {open?.name} · {open?.phone}. 이 내용은 관리용이며 이메일로 발송되지 않습니다.
          </p>
          <p className="text-sm whitespace-pre-wrap">{open?.message}</p>
          <textarea className={area} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="사무실 메모" />
          <Button type="button" onClick={onSave}>
            저장
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
