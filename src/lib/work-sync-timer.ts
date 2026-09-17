import { msUntilNextSeoulHour, seoulParts } from "./kst";
import { runWorkSyncFromEnv } from "./work-sync";

declare global {
  var _anyangWorkSyncTimer: ReturnType<typeof setTimeout> | undefined;
}

function skipTimer() {
  if (process.env.WORK_SYNC_TIMER === "0") return true;
  const phase = process.env.NEXT_PHASE ?? "";
  if (phase.includes("build")) return true;
  return false;
}

function scheduleNext() {
  const delay = msUntilNextSeoulHour(1);
  const when = new Date(Date.now() + delay);
  const seoul = seoulParts(when);
  console.log(
    `[work-sync] next timer ${when.toISOString()} (Asia/Seoul ${seoul.year}-${String(seoul.month).padStart(2, "0")}-${String(seoul.day).padStart(2, "0")} ${String(seoul.hour).padStart(2, "0")}:${String(seoul.minute).padStart(2, "0")})`,
  );
  globalThis._anyangWorkSyncTimer = setTimeout(() => {
    void runWorkSyncFromEnv("timer").finally(() => {
      scheduleNext();
    });
  }, delay);
  globalThis._anyangWorkSyncTimer.unref?.();
}

export function startWorkSyncTimer() {
  if (skipTimer()) return;
  if (globalThis._anyangWorkSyncTimer) return;
  scheduleNext();
}
