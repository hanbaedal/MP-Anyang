"use client";

import { Button } from "@/components/ui/button";
import { useT } from "@/components/locale-provider";

export function LogoutButton() {
  const t = useT();
  return (
    <Button
      type="button"
      variant="outline"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/account/login";
      }}
    >
      {t("account.logout")}
    </Button>
  );
}
