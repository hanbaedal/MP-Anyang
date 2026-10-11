import { NextResponse } from "next/server";
import { deleteAnnouncement, listAnnouncements, saveAnnouncement } from "@/lib/announcements";
import type { SiteAnnouncement } from "@/lib/announcement-types";
import { requireStaffApi } from "@/lib/manage-guard";

export async function GET() {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;
  const items = await listAnnouncements();
  return NextResponse.json({ ok: true, items });
}

export async function PUT(request: Request) {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;
  let body: Partial<SiteAnnouncement>;
  try {
    body = (await request.json()) as Partial<SiteAnnouncement>;
  } catch {
    return NextResponse.json({ ok: false, error: "잘못된 요청입니다." }, { status: 400 });
  }
  try {
    const item = await saveAnnouncement(body);
    const items = await listAnnouncements();
    return NextResponse.json({ ok: true, item, items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "저장에 실패했습니다.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!id) return NextResponse.json({ ok: false, error: "id가 필요합니다." }, { status: 400 });
  await deleteAnnouncement(id);
  const items = await listAnnouncements();
  return NextResponse.json({ ok: true, items });
}
