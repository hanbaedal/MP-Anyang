import { NextResponse } from "next/server";
import { listActiveAnnouncements } from "@/lib/announcements";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await listActiveAnnouncements(new Date());
  return NextResponse.json(
    { ok: true, items, serverNow: new Date().toISOString() },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
