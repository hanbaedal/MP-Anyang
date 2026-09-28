import { NextResponse } from "next/server";
import { listActiveAnnouncements } from "@/lib/announcements";

export async function GET() {
  const items = await listActiveAnnouncements();
  return NextResponse.json({ ok: true, items });
}
