"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ManageI18nMigrate() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function run(force: boolean) {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch(`/api/manage/i18n-migrate${force ? "?force=1" : ""}`, { method: "POST" });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        cms?: number;
        notices?: number;
        faq?: number;
        announcements?: number;
      };
      if (!res.ok || !data.ok) {
        setMessage(data.error || "번역 채우기에 실패했습니다.");
        return;
      }
      setMessage(
        `채움 · 페이지 ${data.cms ?? 0} · 공지 ${data.notices ?? 0} · FAQ ${data.faq ?? 0} · 팝업 ${data.announcements ?? 0}`,
      );
    } catch {
      setMessage("네트워크 오류로 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="font-medium">손님용 영어·중국어</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        한글 CMS·공지·FAQ·메인 팝업을 영어·중국어로 채웁니다. 저장할 때도 자동으로 다시 번역합니다.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" disabled={busy} onClick={() => run(false)}>
          {busy ? "번역 중…" : "비어 있는 것만 채우기"}
        </Button>
        <Button type="button" variant="outline" disabled={busy} onClick={() => run(true)}>
          전부 다시 번역
        </Button>
      </div>
      {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
