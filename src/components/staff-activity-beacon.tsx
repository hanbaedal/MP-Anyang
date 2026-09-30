"use client";

import { useEffect } from "react";
import { msUntilStaffWorkEnd } from "@/lib/work-hours";

const INTERVAL_MS = 60_000;

export function StaffActivityBeacon() {
  useEffect(() => {
    let cancelled = false;
    const logout = () => {
      if (cancelled) return;
      cancelled = true;
      void fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).finally(() => {
        window.location.assign("/");
      });
    };
    const ms = msUntilStaffWorkEnd();
    const shiftTimer = ms > 0 ? window.setTimeout(logout, ms) : 0;
    const ping = () => {
      if (cancelled) return;
      void fetch("/api/analytics/heartbeat", { method: "POST", credentials: "same-origin" })
        .then((res) => {
          if (res.status === 401) logout();
        })
        .catch(() => undefined);
    };
    ping();
    const id = window.setInterval(ping, INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      if (shiftTimer) window.clearTimeout(shiftTimer);
    };
  }, []);
  return null;
}
