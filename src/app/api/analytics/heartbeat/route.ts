import { NextResponse } from "next/server";
import { decodeSession, SESSION_COOKIE } from "@/lib/auth";
import { recordStaffHeartbeat } from "@/lib/site-analytics";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = decodeSession(token);
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "";
  await recordStaffHeartbeat(session, ip);
  return NextResponse.json({ ok: true });
}
