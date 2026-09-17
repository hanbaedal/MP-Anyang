"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** 클라이언트 이동·최초 진입 모두 집계 (비로그인 포함). 30초·경로당 1회. */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname?.startsWith("/")) return;
    const bucket = Math.floor(Date.now() / 30_000);
    const key = `pv:${pathname}:${bucket}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* private mode */
    }
    void fetch("/api/analytics/view", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pathname }),
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
