import { NextResponse } from "next/server";
import { requireWorkApi } from "@/lib/manage-guard";

export const dynamic = "force-dynamic";

export async function POST() {
  const guard = await requireWorkApi("supervisor");
  if (guard.error) return guard.error;
  return NextResponse.json({ ok: true, message: "원본 연결 전" });
}
