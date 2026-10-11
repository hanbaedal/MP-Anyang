import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { runWorkSyncFromEnv } from "@/lib/work-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 800;

function headerSecret(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return (request.headers.get("x-cron-secret") ?? "").trim();
}

function cronAuthorized(request: Request) {
  const expected = process.env.CRON_SECRET?.trim() ?? "";
  if (!expected) return false;
  const provided = headerSecret(request);
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

async function handle(request: Request) {
  if (!process.env.CRON_SECRET?.trim()) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET가 없습니다." }, { status: 401 });
  }
  if (!cronAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "권한이 없습니다." }, { status: 401 });
  }
  const result = await runWorkSyncFromEnv("cron");
  if (result.skipped) {
    return NextResponse.json({ ok: true, skipped: true, message: result.message });
  }
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error, message: result.message }, { status: 502 });
  }
  return NextResponse.json(result);
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
