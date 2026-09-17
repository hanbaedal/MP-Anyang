import { NextResponse } from "next/server";
import { requireWorkApi } from "@/lib/manage-guard";
import { resolveSourceLogin, SOURCE_LOGIN_MISSING, sourceEnvReady } from "@/lib/cemetery-source";
import { syncWorkFromSource } from "@/lib/work-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 800;

export async function GET() {
  const guard = await requireWorkApi("supervisor");
  if (guard.error) return guard.error;
  return NextResponse.json({ ok: true, envReady: sourceEnvReady() });
}

export async function POST(request: Request) {
  const guard = await requireWorkApi("supervisor");
  if (guard.error) return guard.error;

  let id = "";
  let password = "";
  try {
    const body = (await request.json()) as { id?: unknown; password?: unknown };
    if (typeof body.id === "string") id = body.id;
    if (typeof body.password === "string") password = body.password;
  } catch {
    // Empty body: use Render/server env if present.
  }

  const creds = resolveSourceLogin({ id, password });
  if (!creds) {
    return NextResponse.json({ ok: false, error: SOURCE_LOGIN_MISSING, message: SOURCE_LOGIN_MISSING }, { status: 400 });
  }

  const result = await syncWorkFromSource(creds);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error, message: result.message }, { status: 502 });
  }
  return NextResponse.json(result);
}
