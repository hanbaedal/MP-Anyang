import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { deleteFuneralDoc, isFuneralDocId, listFuneralDocs, setFuneralDoc } from "@/lib/funeral-docs";
import { requireStaffApi } from "@/lib/manage-guard";

export async function GET() {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;
  return NextResponse.json({ ok: true, items: await listFuneralDocs() });
}

export async function POST(request: Request) {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;
  const form = await request.formData();
  const docIdRaw = String(form.get("docId") ?? "");
  const file = form.get("file");
  if (!isFuneralDocId(docIdRaw)) {
    return NextResponse.json({ ok: false, error: "서류 종류를 선택해 주세요." }, { status: 400 });
  }
  if (!(file instanceof File) || file.size < 1) {
    return NextResponse.json({ ok: false, error: "PDF 파일을 선택해 주세요." }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ ok: false, error: "PDF는 10MB 이하만 올릴 수 있습니다." }, { status: 400 });
  }
  const isPdf =
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    return NextResponse.json({ ok: false, error: "PDF만 올릴 수 있습니다." }, { status: 400 });
  }
  const safeBase = file.name.replace(/[^\w\u3131-\uD79D.\-()]+/gu, "_").slice(0, 80) || "document.pdf";
  const storedName = `${docIdRaw}-${Date.now()}-${randomBytes(4).toString("hex")}.pdf`;
  const dir = path.join(process.cwd(), "public", "uploads", "docs");
  await mkdir(dir, { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, storedName), buf);
  const doc = await setFuneralDoc({
    docId: docIdRaw,
    filePath: `/uploads/docs/${storedName}`,
    fileName: safeBase.endsWith(".pdf") ? safeBase : `${safeBase}.pdf`,
  });
  return NextResponse.json({ ok: true, doc });
}

export async function DELETE(request: Request) {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;
  const docIdRaw = new URL(request.url).searchParams.get("docId") ?? "";
  if (!isFuneralDocId(docIdRaw)) {
    return NextResponse.json({ ok: false, error: "서류 종류가 없습니다." }, { status: 400 });
  }
  const result = await deleteFuneralDoc(docIdRaw);
  if (!result.ok) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
