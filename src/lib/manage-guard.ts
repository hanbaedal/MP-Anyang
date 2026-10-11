import { NextResponse } from "next/server";
import { isCmsStaff, readSession } from "@/lib/auth";
import { ensureAuthSeed } from "@/lib/staff";
import type { SessionUser } from "@/lib/auth-types";

export async function requireStaffApi(supervisor = false): Promise<
  { session: SessionUser; error?: undefined } | { session?: undefined; error: NextResponse }
> {
  await ensureAuthSeed();
  const session = await readSession();
  if (!session || !isCmsStaff(session.role)) {
    return { error: NextResponse.json({ ok: false, error: "권한이 없습니다." }, { status: 401 }) };
  }
  if (supervisor && session.role !== "supervisor") {
    return { error: NextResponse.json({ ok: false, error: "감독만 할 수 있습니다." }, { status: 403 }) };
  }
  return { session };
}

export async function requireWorkApi(kind: "staff" | "ceo" | "supervisor" = "staff"): Promise<
  { session: SessionUser; error?: undefined } | { session?: undefined; error: NextResponse }
> {
  await ensureAuthSeed();
  const session = await readSession();
  if (!session) {
    return { error: NextResponse.json({ ok: false, error: "권한이 없습니다." }, { status: 401 }) };
  }
  if (kind === "supervisor" && session.role !== "supervisor") {
    return { error: NextResponse.json({ ok: false, error: "감독만 할 수 있습니다." }, { status: 403 }) };
  }
  if (kind === "ceo" && session.role !== "ceo") {
    return { error: NextResponse.json({ ok: false, error: "CEO만 볼 수 있습니다." }, { status: 403 }) };
  }
  if (kind === "staff" && session.role !== "supervisor" && session.role !== "admin" && session.role !== "ceo") {
    return { error: NextResponse.json({ ok: false, error: "권한이 없습니다." }, { status: 401 }) };
  }
  return { session };
}
