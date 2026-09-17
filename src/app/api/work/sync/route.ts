import { NextResponse } from "next/server";
import { requireWorkApi } from "@/lib/manage-guard";
import { SOURCE_LOGIN_MISSING, sourceEnvReady } from "@/lib/cemetery-source";
import { runWorkSyncFromEnv } from "@/lib/work-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 800;

export async function GET() {
  const guard = await requireWorkApi("supervisor");
  if (guard.error) return guard.error;
  return NextResponse.json({ ok: true, envReady: sourceEnvReady() });
}

export async function POST() {
  const guard = await requireWorkApi("supervisor");
  if (guard.error) return guard.error;

  const result = await runWorkSyncFromEnv("button");
  if (result.skipped) {
    const status = result.message === SOURCE_LOGIN_MISSING ? 400 : 409;
    return NextResponse.json({ ok: false, error: result.message, message: result.message }, { status });
  }
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error, message: result.message }, { status: 502 });
  }
  return NextResponse.json(result);
}
