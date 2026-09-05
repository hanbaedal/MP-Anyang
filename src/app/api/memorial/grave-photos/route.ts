import { NextResponse } from "next/server";
import { errorStatus, readSession } from "../../../../lib/auth";
import { memberHasMemorialPass } from "../../../../lib/memorial-billing";
import { storeMemorialMedia } from "../../../../lib/memorial-media";
import { findHallByCode, memberCanEditHall, syncHall } from "../../../../lib/memorial-store";
import { findGraveByPlotNo, updateGrave, toId } from "../../../../lib/store";

export async function POST(request: Request) {
  try {
    const user = await readSession();
    if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const form = await request.formData();
    const hallCode = String(form.get("hallCode") || "").trim();
    const file = form.get("file");

    if (!hallCode || !(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "추모관과 사진·동영상을 선택해 주세요." }, { status: 400 });
    }

    const hall = await findHallByCode(hallCode);
    if (!hall) return NextResponse.json({ error: "추모관을 찾을 수 없습니다." }, { status: 404 });
    if (!(await memberCanEditHall(user.id, user.role, hall))) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    if (!(await memberHasMemorialPass(user.id, user.role, hallCode))) {
      return NextResponse.json(
        { error: "연간권이 필요합니다. 요금·플랜에서 구매해 주세요." },
        { status: 402 },
      );
    }

    const grave = await findGraveByPlotNo(hall.plotNo);
    if (!grave) {
      return NextResponse.json({ error: "연결된 묘역 정보가 없습니다." }, { status: 404 });
    }

    const stored = await storeMemorialMedia(file);
    const photos = ((grave.photos as string[] | undefined) || []).filter(Boolean);
    if (photos.length >= 10) {
      return NextResponse.json({ error: "추억 회상하기는 최대 10장까지 등록할 수 있습니다." }, { status: 400 });
    }

    const nextPhotos = [...photos, stored.url].slice(0, 10);
    await updateGrave(toId(grave._id), { photos: nextPhotos });
    await syncHall(hall);

    return NextResponse.json({ ok: true, url: stored.url, count: nextPhotos.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "업로드 실패";
    return NextResponse.json({ error: message }, { status: errorStatus(error) || 500 });
  }
}
