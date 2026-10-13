import { NextResponse } from "next/server";
import { saveManageUpload } from "@/lib/manage-image-upload";
import { requireStaffApi } from "@/lib/manage-guard";

export async function POST(request: Request) {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "사진 파일을 선택해 주세요." }, { status: 400 });
  }
  const result = await saveManageUpload(file);
  if (!result.ok) return NextResponse.json(result, { status: 400 });
  return NextResponse.json({ ok: true, src: result.src });
}
