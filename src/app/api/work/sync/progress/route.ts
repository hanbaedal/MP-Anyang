import { NextResponse } from "next/server";
import { requireWorkApi } from "@/lib/manage-guard";
import { readWorkSyncProgress } from "@/lib/work-sync-progress";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireWorkApi("supervisor");
  if (guard.error) return guard.error;
  return NextResponse.json({ ok: true, ...readWorkSyncProgress() });
}
