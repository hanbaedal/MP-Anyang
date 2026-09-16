"use client";

import { Button } from "@/components/ui/button";
import { useT } from "@/components/locale-provider";
import { SITE } from "@/lib/site";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useT();
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-serif text-3xl">{t("errorTitle")}</h1>
      <p className="mt-3 text-muted-foreground">{t("errorLead")}</p>
      <p className="mt-2">
        <a className="text-primary underline-offset-4 hover:underline" href={SITE.phoneTel}>
          {SITE.phone}
        </a>
      </p>
      <Button className="mt-6" type="button" onClick={() => reset()}>
        {t("retry")}
      </Button>
    </div>
  );
}
