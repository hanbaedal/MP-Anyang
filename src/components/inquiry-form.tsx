"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/locale-provider";

const field =
  "h-9 min-w-0 flex-1 rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
const row = "flex items-center gap-3";
const labelClass = "w-24 shrink-0 text-sm font-medium sm:w-28";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

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
      setShowPassword(false);
      setShowPasswordConfirm(false);
      onSuccess?.();
    } catch {
      setStatus("error");
      setMessage(t("form.errNetwork"));
    }
  }

  return (
    <form noValidate onSubmit={onSubmit} className={className ?? "space-y-3"}>
      <div className={row}>
        <label htmlFor="inquiry-name" className={labelClass}>
          {t("form.name")}
        </label>
        <input id="inquiry-name" name="name" required maxLength={40} autoComplete="name" className={field} />
      </div>

      <div className={row}>
        <label htmlFor="inquiry-phone" className={labelClass}>
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

      <div className={row}>
        <span className={labelClass}>{t("inquiry.visibility")}</span>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4 text-sm">
          <label className="inline-flex items-center gap-1.5">
            <input
              type="radio"
              name="visibility"
              value="public"
              checked={visibility === "public"}
              onChange={() => setVisibility("public")}
            />
            {t("inquiry.visibilityPublic")}
          </label>
          <label className="inline-flex items-center gap-1.5">
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
      </div>
      <p className="pl-[calc(6rem+0.75rem)] text-xs text-muted-foreground sm:pl-[calc(7rem+0.75rem)]">
        {visibility === "secret" ? t("inquiry.visibilitySecretHint") : t("inquiry.visibilityPublicHint")}
      </p>

      {visibility === "secret" ? (
        <>
          <div className={row}>
            <label htmlFor="inquiry-password" className={labelClass}>
              {t("inquiry.password")}
            </label>
            <div className="relative min-w-0 flex-1">
              <input
                id="inquiry-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                minLength={4}
                maxLength={32}
                className={`${field} w-full pr-10`}
              />
              <button
                type="button"
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <div className={row}>
            <label htmlFor="inquiry-password-confirm" className={labelClass}>
              {t("inquiry.passwordConfirm")}
            </label>
            <div className="relative min-w-0 flex-1">
              <input
                id="inquiry-password-confirm"
                name="passwordConfirm"
                type={showPasswordConfirm ? "text" : "password"}
                autoComplete="new-password"
                minLength={4}
                maxLength={32}
                className={`${field} w-full pr-10`}
              />
              <button
                type="button"
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPasswordConfirm((v) => !v)}
                aria-label={showPasswordConfirm ? "비밀번호 확인 숨기기" : "비밀번호 확인 보기"}
              >
                {showPasswordConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
        </>
      ) : null}

      <div className="flex items-start gap-3">
        <label htmlFor="inquiry-message" className={`${labelClass} pt-2`}>
          {t("form.message")}
        </label>
        <textarea
          id="inquiry-message"
          name="message"
          required
          maxLength={2000}
          rows={5}
          className={`${field} h-auto py-2`}
        />
      </div>

      <div className="space-y-1 text-xs text-muted-foreground">
        <p>{t("form.privacy")}</p>
        <p>
          <a className="underline-offset-4 hover:underline" href="/privacy">
            {t("footer.privacy")}
          </a>
          . {t("form.callHint", { phone: SITE.phone })}
        </p>
      </div>

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
