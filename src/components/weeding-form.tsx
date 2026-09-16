"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/locale-provider";

export function WeedingForm() {
  const t = useT();
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const name = String(data.name ?? "").trim();
    const phone = String(data.phone ?? "").trim();
    const plot = String(data.plot ?? "").trim();
    const when = String(data.when ?? "").trim();
    const note = String(data.note ?? "").trim();
    const digits = phone.replace(/[^\d]/g, "");
    if (name.length < 2 || name.length > 40) {
      setStatus("error");
      setMessage(t("form.errName"));
      return;
    }
    if (digits.length < 9 || digits.length > 11) {
      setStatus("error");
      setMessage(t("form.errPhone"));
      return;
    }
    if (plot.length < 2 || when.length < 2) {
      setStatus("error");
      setMessage(t("form.errMessage"));
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/weeding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, plot, when, note }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setStatus("error");
        setMessage(json.error || t("form.errSave"));
        return;
      }
      setStatus("ok");
      setMessage(t("weeding.ok"));
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
        <label htmlFor="weeding-name" className="text-sm font-medium">
          {t("form.name")}
        </label>
        <input id="weeding-name" name="name" required maxLength={40} autoComplete="name" className={field} />
      </div>
      <div className="space-y-2">
        <label htmlFor="weeding-phone" className="text-sm font-medium">
          {t("form.phone")}
        </label>
        <input id="weeding-phone" name="phone" required type="tel" autoComplete="tel" className={field} />
      </div>
      <div className="space-y-2">
        <label htmlFor="weeding-plot" className="text-sm font-medium">
          {t("weeding.plot")}
        </label>
        <input id="weeding-plot" name="plot" required maxLength={200} className={field} />
      </div>
      <div className="space-y-2">
        <label htmlFor="weeding-when" className="text-sm font-medium">
          {t("weeding.when")}
        </label>
        <input id="weeding-when" name="when" required maxLength={120} className={field} />
      </div>
      <div className="space-y-2">
        <label htmlFor="weeding-note" className="text-sm font-medium">
          {t("weeding.note")}
        </label>
        <textarea id="weeding-note" name="note" maxLength={2000} rows={4} className={`${field} h-auto py-2`} />
      </div>
      <p className="text-xs text-muted-foreground">
        {t("form.privacy")} {t("form.callHint", { phone: SITE.phone })}
      </p>
      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? t("form.sending") : t("weeding.submit")}
      </Button>
      {message ? (
        <p className={status === "ok" ? "text-sm text-primary" : "text-sm text-destructive"} role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
