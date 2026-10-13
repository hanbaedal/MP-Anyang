"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** SSR에서 첫 화면은 집계됨. 클라이언트 이동만 API로 보조 집계. */
export function PageViewTracker() {
  const pathname = usePathname();
  const skipFirst = useRef(true);

  useEffect(() => {
    if (!pathname?.startsWith("/")) return;
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    const bucket = Math.floor(Date.now() / 30_000);
    const key = `pv:${pathname}:${bucket}`;
    void fetch("/api/analytics/view", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pathname }),
    })
      .then((res) => {
        if (res.ok) {
          try {
            sessionStorage.setItem(key, "1");
          } catch {
            /* private mode */
          }
        }
      })
      .catch(() => undefined);
  }, [pathname]);

  return null;
}
