"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/locale-provider";

export function FaqForm() {
  const t = useT();
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const name = String(data.name ?? "").trim();
    const question = String(data.question ?? "").trim();
    if (name.length < 2 || name.length > 40) {
      setStatus("error");
      setMessage(t("form.errName"));
      return;
    }
    if (question.length < 5 || question.length > 2000) {
      setStatus("error");
      setMessage(t("form.errMessage"));
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, question }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setStatus("error");
        setMessage(json.error || t("form.errSave"));
        return;
      }
      setStatus("ok");
      setMessage(t("faq.ok"));
      form.reset();
    } catch {
      setStatus("error");
      setMessage(t("form.errNetwork"));
    }
  }

  const field =
    "h-9 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
      <div className="space-y-2">
        <label htmlFor="faq-name" className="text-sm font-medium">
          {t("form.name")}
        </label>
        <input id="faq-name" name="name" required maxLength={40} autoComplete="name" className={field} />
      </div>
      <div className="space-y-2">
        <label htmlFor="faq-question" className="text-sm font-medium">
          {t("faq.question")}
        </label>
        <textarea id="faq-question" name="question" required maxLength={2000} rows={6} className={`${field} h-auto py-2`} />
      </div>
      <p className="text-xs text-muted-foreground">
        {t("form.privacy")} {t("form.callHint", { phone: SITE.phone })}
      </p>
      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? t("form.sending") : t("faq.submit")}
      </Button>
      {message ? (
        <p className={status === "ok" ? "text-sm text-primary" : "text-sm text-destructive"} role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
