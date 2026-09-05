import { NextResponse } from "next/server";
import { errorStatus, readSession } from "../../../../lib/auth";
import { createMemorialJob, findHallByCode, memberCanEditHall } from "../../../../lib/memorial-store";

export async function POST(request: Request) {
  try {
    const user = await readSession();
    if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const body = await request.json();
    const hallCode = String(body.hallCode || "").trim();
    const note = String(body.note || "").trim();

    if (!hallCode) return NextResponse.json({ error: "추모관을 선택해 주세요." }, { status: 400 });

    const hall = await findHallByCode(hallCode);
    if (!hall) return NextResponse.json({ error: "추모관을 찾을 수 없습니다." }, { status: 404 });
    if (!(await memberCanEditHall(user.id, user.role, hall))) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const id = await createMemorialJob({
      hallCode,
      deceasedName: hall.deceasedName,
      plotNo: hall.plotNo,
      requestedBy: user.id,
      requesterName: user.name,
      note: note || "생전·가족 추억 영상 편집을 요청합니다.",
    });

    return NextResponse.json({ ok: true, id });
  } catch (error) {
    return NextResponse.json({ error: "요청 실패" }, { status: errorStatus(error) || 500 });
  }
}
