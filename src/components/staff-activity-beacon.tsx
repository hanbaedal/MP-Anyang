"use client";

import { useEffect } from "react";

const INTERVAL_MS = 60_000;

export function StaffActivityBeacon() {
  useEffect(() => {
    let cancelled = false;
    const ping = () => {
      if (cancelled) return;
      void fetch("/api/analytics/heartbeat", { method: "POST", credentials: "same-origin" }).catch(() => undefined);
    };
    ping();
    const id = window.setInterval(ping, INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);
  return null;
}
