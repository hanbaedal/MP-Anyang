"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { msUntilStaffWorkEnd } from "@/lib/work-hours";

const INTERVAL_MS = 60_000;
const WARN_MS = 5 * 60 * 1000;

export function StaffActivityBeacon({ limited }: { limited: boolean }) {
  const [warn, setWarn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const logout = () => {
      if (cancelled || !limited) return;
      cancelled = true;
      void fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).finally(() => {
        window.location.assign("/");
      });
    };
    const tick = () => {
      if (!limited) {
        setWarn(false);
        return;
      }
      const ms = msUntilStaffWorkEnd();
      setWarn(ms > 0 && ms <= WARN_MS);
    };
    tick();
    const clock = window.setInterval(tick, 1000);
    const ms = msUntilStaffWorkEnd();
    const shiftTimer = limited && ms > 0 ? window.setTimeout(logout, ms) : 0;
    const ping = () => {
      if (cancelled) return;
      void fetch("/api/analytics/heartbeat", { method: "POST", credentials: "same-origin" })
        .then((res) => {
          if (limited && res.status === 401) logout();
        })
        .catch(() => undefined);
    };
    ping();
    const id = window.setInterval(ping, INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.clearInterval(clock);
      if (shiftTimer) window.clearTimeout(shiftTimer);
    };
  }, [limited]);

  if (!warn || typeof document === "undefined") return null;
  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center p-6">
      <p className="bg-white/95 px-6 py-4 text-center text-2xl font-semibold text-red-600 shadow-lg">
        5분 전입니다. 일과 시간에만 사용할 수 있습니다.
      </p>
    </div>,
    document.body,
  );
}
