"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/locale-provider";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const t = useT();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const name = String(data.name ?? "").trim();
    const phone = String(data.phone ?? "").trim();
    const password = String(data.password ?? "");
    const password2 = String(data.password2 ?? "");
    if (mode === "register") {
      if (name.length < 2) {
        setStatus("error");
        setMessage(t("form.errName"));
        return;
      }
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
    try {
      const res = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, password, password2 }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setStatus("error");
        setMessage(json.error || t("form.errSave"));
        return;
      }
      window.location.href = "/account";
    } catch {
      setStatus("error");
      setMessage(t("form.errNetwork"));
    }
  }

  const field =
    "h-9 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <form noValidate onSubmit={onSubmit} className="max-w-md space-y-4 rounded-xl border bg-card p-5 shadow-sm">
      {mode === "register" ? (
        <div className="space-y-2">
          <label htmlFor="auth-name" className="text-sm font-medium">
            {t("form.name")}
          </label>
          <input id="auth-name" name="name" required maxLength={40} autoComplete="name" className={field} />
        </div>
      ) : null}
      <div className="space-y-2">
        <label htmlFor="auth-phone" className="text-sm font-medium">
          {t("form.phone")}
        </label>
        <input id="auth-phone" name="phone" required type="tel" autoComplete="tel" className={field} />
      </div>
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
      {mode === "register" ? (
        <div className="space-y-2">
          <label htmlFor="auth-password2" className="text-sm font-medium">
            {t("account.password2")}
          </label>
          <input id="auth-password2" name="password2" type="password" required minLength={6} autoComplete="new-password" className={field} />
        </div>
      ) : null}
      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? t("form.sending") : mode === "login" ? t("account.submitLogin") : t("account.submitRegister")}
      </Button>
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
      {message ? (
        <p className="text-sm text-destructive" role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
