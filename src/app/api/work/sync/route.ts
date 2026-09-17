import { NextResponse } from "next/server";
import { requireWorkApi } from "@/lib/manage-guard";
import { syncWorkFromSource } from "@/lib/work-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 800;

export async function POST() {
  const guard = await requireWorkApi("supervisor");
  if (guard.error) return guard.error;
  const result = await syncWorkFromSource();
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error, message: result.message }, { status: 502 });
  }
  return NextResponse.json(result);
}
