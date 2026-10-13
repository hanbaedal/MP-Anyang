import { NextResponse } from "next/server";
import { decodeSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { clientIp } from "@/lib/ip-place";
import { recordStaffHeartbeat } from "@/lib/site-analytics";
import { isStaffWorkHour, isWorkHourLimitedRole } from "@/lib/work-hours";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = decodeSession(token);
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  if (isWorkHourLimitedRole(session.role) && !isStaffWorkHour()) {
    const res = NextResponse.json({ ok: false }, { status: 401 });
    res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
    return res;
  }
  const ip = clientIp(request.headers);
  await recordStaffHeartbeat(session, ip);
  return NextResponse.json({ ok: true });
}
