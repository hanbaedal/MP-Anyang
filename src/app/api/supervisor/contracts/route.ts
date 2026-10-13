import { NextResponse } from "next/server";
import { bookToStored, type ContractBook } from "@/lib/contract-book";
import { requireWorkApi } from "@/lib/manage-guard";
import { deleteSupervisorContract, readContractFile, upsertSupervisorContract } from "@/lib/work-store";

export const dynamic = "force-dynamic";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const gate = await requireWorkApi("supervisor");
  if (gate.error) return gate.error;
  const body = (await request.json().catch(() => null)) as
    | { action?: string; previous?: { tombNo?: string; contractNo?: string } | null; book?: ContractBook }
    | null;
  const action = body?.action;
  const previous = body?.previous?.tombNo
    ? { tombNo: text(body.previous.tombNo), contractNo: text(body.previous.contractNo) }
    : null;
  if (action === "delete") {
    if (!previous?.tombNo) {
      return NextResponse.json({ ok: false, error: "삭제할 계약을 여세요." }, { status: 400 });
    }
    await deleteSupervisorContract(previous);
    return NextResponse.json({ ok: true });
  }
  if (action !== "save" || !body?.book) {
    return NextResponse.json({ ok: false, error: "저장할 내용이 없습니다." }, { status: 400 });
  }
  const book = body.book;
  const tombNo = text(book.tombNo);
  const contractNo = text(book.contractNo);
  if (!tombNo || !contractNo) {
    return NextResponse.json({ ok: false, error: "묘지번호와 계약번호를 입력하세요." }, { status: 400 });
  }
  const current = previous ? await readContractFile(previous.tombNo, previous.contractNo) : null;
  const stored = bookToStored({ ...book, tombNo, contractNo }, current);
  if (!previous || previous.tombNo !== tombNo || previous.contractNo !== contractNo) {
    const clash = await readContractFile(tombNo, contractNo);
    if (clash) {
      return NextResponse.json({ ok: false, error: "같은 묘지번호와 계약번호가 있습니다." }, { status: 409 });
    }
  }
  await upsertSupervisorContract(previous, stored.contract, stored.file);
  return NextResponse.json({ ok: true, tombNo, contractNo });
}
