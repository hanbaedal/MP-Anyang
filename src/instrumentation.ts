export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") return;
  const { startWorkSyncTimer } = await import("./lib/work-sync-timer");
  startWorkSyncTimer();
}
