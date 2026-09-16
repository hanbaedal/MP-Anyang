"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/locale-provider";

export function AuthForm({
  mode,
  defaults,
  oauthError,
}: {
  mode: "login" | "register" | "complete";
  defaults?: { username?: string; name?: string; phone?: string; email?: string; title?: string };
  oauthError?: boolean;
}) {
  const t = useT();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const username = String(data.username ?? "").trim();
    const name = String(data.name ?? "").trim();
    const phone = String(data.phone ?? "").trim();
    const email = String(data.email ?? "").trim();
    const title = String(data.title ?? "").trim();
    const password = String(data.password ?? "");
    const password2 = String(data.password2 ?? "");
    if (mode !== "login") {
      if (username.length < 4) {
        setStatus("error");
        setMessage(t("account.errUsername"));
        return;
      }
      if (name.length < 2) {
        setStatus("error");
        setMessage(t("form.errName"));
        return;
      }
      if (!email.includes("@")) {
        setStatus("error");
        setMessage(t("account.errEmail"));
        return;
      }
    }
    if (mode === "register") {
      if (password !== password2) {
        setStatus("error");
        setMessage(t("account.errMatch"));
        return;
      }
      if (password.length < 6) {
        setStatus("error");
        setMessage(t("account.errShort"));
        return;
      }
    }
    setStatus("loading");
    setMessage("");
    const url = mode === "login" ? "/api/auth/login" : mode === "register" ? "/api/auth/register" : "/api/auth/profile";
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, name, phone, email, title, password, password2 }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string; redirect?: string };
      if (!res.ok || !json.ok) {
        setStatus("error");
        setMessage(json.error || t("form.errSave"));
        return;
      }
      window.location.href = json.redirect || "/sitemap";
    } catch {
      setStatus("error");
      setMessage(t("form.errNetwork"));
    }
  }

  const field =
    "h-9 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <form noValidate onSubmit={onSubmit} className="max-w-md space-y-4 rounded-xl border bg-card p-5 shadow-sm">
      <div className="space-y-2">
        <label htmlFor="auth-username" className="text-sm font-medium">
          {t("account.username")}
        </label>
        <input
          id="auth-username"
          name="username"
          required
          autoComplete="username"
          className={field}
          defaultValue={defaults?.username}
          readOnly={mode === "complete" && Boolean(defaults?.username)}
        />
      </div>
      {mode !== "login" ? (
        <>
          <div className="space-y-2">
            <label htmlFor="auth-name" className="text-sm font-medium">
              {t("form.name")}
            </label>
            <input id="auth-name" name="name" required maxLength={40} autoComplete="name" className={field} defaultValue={defaults?.name} />
          </div>
          <div className="space-y-2">
            <label htmlFor="auth-phone" className="text-sm font-medium">
              {t("form.phone")}
            </label>
            <input id="auth-phone" name="phone" required type="tel" autoComplete="tel" className={field} defaultValue={defaults?.phone} />
          </div>
          <div className="space-y-2">
            <label htmlFor="auth-email" className="text-sm font-medium">
              {t("account.email")}
            </label>
            <input id="auth-email" name="email" required type="email" autoComplete="email" className={field} defaultValue={defaults?.email} />
          </div>
          <div className="space-y-2">
            <label htmlFor="auth-title" className="text-sm font-medium">
              {t("account.titleField")}
            </label>
            <input id="auth-title" name="title" maxLength={40} className={field} defaultValue={defaults?.title} />
          </div>
        </>
      ) : null}
      {mode !== "complete" ? (
        <div className="space-y-2">
          <label htmlFor="auth-password" className="text-sm font-medium">
            {t("account.password")}
          </label>
          <input
            id="auth-password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className={field}
          />
        </div>
      ) : null}
      {mode === "register" ? (
        <div className="space-y-2">
          <label htmlFor="auth-password2" className="text-sm font-medium">
            {t("account.password2")}
          </label>
          <input id="auth-password2" name="password2" type="password" required minLength={6} autoComplete="new-password" className={field} />
        </div>
      ) : null}
      <Button type="submit" disabled={status === "loading"}>
        {status === "loading"
          ? t("form.sending")
          : mode === "login"
            ? t("account.submitLogin")
            : mode === "register"
              ? t("account.submitRegister")
              : t("account.submitComplete")}
      </Button>
      {mode !== "complete" ? (
        <>
          <div className="grid gap-2">
            <Button asChild>
              <a href="/api/auth/oauth/kakao">{t("account.kakao")}</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/api/auth/oauth/google">{t("account.google")}</a>
            </Button>
          </div>
          <p className="text-sm">
            {mode === "login" ? (
              <Link href="/account/register" className="text-primary underline-offset-4 hover:underline">
                {t("account.toRegister")}
              </Link>
            ) : (
              <Link href="/account/login" className="text-primary underline-offset-4 hover:underline">
                {t("account.toLogin")}
              </Link>
            )}
          </p>
        </>
      ) : null}
      {oauthError ? (
        <p className="text-sm text-destructive" role="status">
          {t("account.oauthError")}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-destructive" role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
