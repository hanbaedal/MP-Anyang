import { NextResponse } from "next/server";
import { requireWorkApi } from "@/lib/manage-guard";
import {
  buildManualDocx,
  buildManualPdf,
  downloadFileName,
  findManual,
  type ManualFormat,
} from "@/lib/manuals";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ id: string; format: string }> };

export async function GET(_request: Request, { params }: Params) {
  const gate = await requireWorkApi("supervisor");
  if (gate.error) return gate.error;

  const { id, format: raw } = await params;
  const format = raw.toLowerCase() as ManualFormat;
  if (format !== "docx" && format !== "pdf") {
    return NextResponse.json({ ok: false, error: "docx 또는 pdf만 받을 수 있습니다." }, { status: 400 });
  }
  const item = findManual(id);
  if (!item) {
    return NextResponse.json({ ok: false, error: "매뉴얼을 찾을 수 없습니다." }, { status: 404 });
  }

  try {
    const body = format === "docx" ? await buildManualDocx(item) : await buildManualPdf(item);
    const fileName = downloadFileName(item, format);
    const type =
      format === "docx"
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : "application/pdf";
    return new NextResponse(new Uint8Array(body), {
      status: 200,
      headers: {
        "Content-Type": type,
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const code = err instanceof Error ? err.message : "";
    if (code === "manual-missing" || code === "font-missing") {
      return NextResponse.json({ ok: false, error: "매뉴얼 파일을 준비하지 못했습니다." }, { status: 500 });
    }
    console.error("[manuals] build failed", err);
    return NextResponse.json({ ok: false, error: "파일을 만들지 못했습니다." }, { status: 500 });
  }
}
