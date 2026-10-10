import { NextResponse } from "next/server";

/** Render health check — Mongo·세션 없이 즉시 200. */
export const dynamic = "force-static";
export const revalidate = 0;

export function GET() {
  return NextResponse.json(
    { ok: true, service: "mp-anyang" },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
