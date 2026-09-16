"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";

export function InquiryForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const name = String(data.name ?? "").trim();
    const phone = String(data.phone ?? "").trim();
    const messageText = String(data.message ?? "").trim();
    const digits = phone.replace(/[^\d]/g, "");
    if (name.length < 2 || name.length > 40) {
      setStatus("error");
      setMessage("이름을 2자 이상 적어 주세요.");
      return;
    }
    if (digits.length < 9 || digits.length > 11) {
      setStatus("error");
      setMessage("연락처를 숫자로 정확히 적어 주세요.");
      return;
    }
    if (messageText.length < 5 || messageText.length > 2000) {
      setStatus("error");
      setMessage("문의 내용을 조금 더 적어 주세요.");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, message: messageText }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setStatus("error");
        setMessage(json.error || "접수에 실패했습니다. 전화로 문의해 주세요.");
        return;
      }
      setStatus("ok");
      setMessage("접수했습니다. 평일 사무실에서 확인하고 연락드리겠습니다.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("네트워크 오류입니다. 잠시 후 다시 시도하거나 전화 주세요.");
    }
  }

  const field =
    "h-9 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <form noValidate onSubmit={onSubmit} className="max-w-lg space-y-4 rounded-xl border bg-card p-5 shadow-sm">
      <div className="space-y-2">
        <label htmlFor="inquiry-name" className="text-sm font-medium">
          이름
        </label>
        <input id="inquiry-name" name="name" required maxLength={40} autoComplete="name" className={field} />
      </div>
      <div className="space-y-2">
        <label htmlFor="inquiry-phone" className="text-sm font-medium">
          연락처
        </label>
        <input
          id="inquiry-phone"
          name="phone"
          required
          type="tel"
          autoComplete="tel"
          placeholder="010-0000-0000"
          className={field}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="inquiry-message" className="text-sm font-medium">
          문의 내용
        </label>
        <textarea id="inquiry-message" name="message" required maxLength={2000} rows={6} className={`${field} h-auto py-2`} />
      </div>
      <p className="text-xs text-muted-foreground">
        제출하시면{" "}
        <a className="underline-offset-4 hover:underline" href="/privacy">
          개인정보처리방침
        </a>
        에 따라 상담 목적으로만 이용합니다. 급하시면{" "}
        <a className="text-primary underline-offset-4 hover:underline" href={SITE.phoneTel}>
          {SITE.phone}
        </a>
        로 전화해 주세요.
      </p>
      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "보내는 중…" : "문의 보내기"}
      </Button>
      {message ? (
        <p className={status === "ok" ? "text-sm text-primary" : "text-sm text-destructive"} role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
