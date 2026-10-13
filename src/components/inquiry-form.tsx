"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/locale-provider";

const field =
  "h-9 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function InquiryForm({
  onSuccess,
  className,
}: {
  onSuccess?: () => void;
  className?: string;
}) {
  const t = useT();
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const [visibility, setVisibility] = useState<"public" | "secret">("public");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const name = String(data.name ?? "").trim();
    const phone = String(data.phone ?? "").trim();
    const messageText = String(data.message ?? "").trim();
    const password = String(data.password ?? "");
    const passwordConfirm = String(data.passwordConfirm ?? "");
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
    if (messageText.length < 5 || messageText.length > 2000) {
      setStatus("error");
      setMessage(t("form.errMessage"));
      return;
    }
    if (visibility === "secret") {
      if (password.length < 4 || password.length > 32) {
        setStatus("error");
        setMessage(t("inquiry.errPassword"));
        return;
      }
      if (password !== passwordConfirm) {
        setStatus("error");
        setMessage(t("inquiry.errPasswordConfirm"));
        return;
      }
    }
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          message: messageText,
          visibility,
          password: visibility === "secret" ? password : undefined,
          passwordConfirm: visibility === "secret" ? passwordConfirm : undefined,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setStatus("error");
        setMessage(json.error || t("form.errSave"));
        return;
      }
      setStatus("ok");
      setMessage(t("inquiry.ok"));
      form.reset();
      setVisibility("public");
      onSuccess?.();
    } catch {
      setStatus("error");
      setMessage(t("form.errNetwork"));
    }
  }

  return (
    <form noValidate onSubmit={onSubmit} className={className ?? "space-y-4"}>
      <div className="space-y-2">
        <label htmlFor="inquiry-name" className="text-sm font-medium">
          {t("form.name")}
        </label>
        <input id="inquiry-name" name="name" required maxLength={40} autoComplete="name" className={field} />
      </div>
      <div className="space-y-2">
        <label htmlFor="inquiry-phone" className="text-sm font-medium">
          {t("form.phone")}
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
        <span className="text-sm font-medium">{t("inquiry.visibility")}</span>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="visibility"
              value="public"
              checked={visibility === "public"}
              onChange={() => setVisibility("public")}
            />
            {t("inquiry.visibilityPublic")}
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="visibility"
              value="secret"
              checked={visibility === "secret"}
              onChange={() => setVisibility("secret")}
            />
            {t("inquiry.visibilitySecret")}
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          {visibility === "secret" ? t("inquiry.visibilitySecretHint") : t("inquiry.visibilityPublicHint")}
        </p>
      </div>
      {visibility === "secret" ? (
        <>
          <div className="space-y-2">
            <label htmlFor="inquiry-password" className="text-sm font-medium">
              {t("inquiry.password")}
            </label>
            <input
              id="inquiry-password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={4}
              maxLength={32}
              className={field}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="inquiry-password-confirm" className="text-sm font-medium">
              {t("inquiry.passwordConfirm")}
            </label>
            <input
              id="inquiry-password-confirm"
              name="passwordConfirm"
              type="password"
              autoComplete="new-password"
              minLength={4}
              maxLength={32}
              className={field}
            />
          </div>
        </>
      ) : null}
      <div className="space-y-2">
        <label htmlFor="inquiry-message" className="text-sm font-medium">
          {t("form.message")}
        </label>
        <textarea id="inquiry-message" name="message" required maxLength={2000} rows={6} className={`${field} h-auto py-2`} />
      </div>
      <p className="text-xs text-muted-foreground">
        {t("form.privacy")}{" "}
        <a className="underline-offset-4 hover:underline" href="/privacy">
          {t("footer.privacy")}
        </a>
        . {t("form.callHint", { phone: SITE.phone })}
      </p>
      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? t("form.sending") : t("cta.inquiry")}
      </Button>
      {message ? (
        <p className={status === "ok" ? "text-sm text-primary" : "text-sm text-destructive"} role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
