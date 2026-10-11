import { NextResponse } from "next/server";
import { listActiveAnnouncementsLocalized } from "@/lib/announcements";
import { readLocale } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const locale = await readLocale();
  const items = await listActiveAnnouncementsLocalized(locale, new Date());
  return NextResponse.json(
    { ok: true, items, serverNow: new Date().toISOString() },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
