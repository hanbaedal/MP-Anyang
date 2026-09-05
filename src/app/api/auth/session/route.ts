import { NextResponse } from "next/server";
import { readSession } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await readSession();
  return NextResponse.json(
    { user },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    },
  );
}
