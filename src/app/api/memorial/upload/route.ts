import { NextResponse } from "next/server";
import { errorStatus, readSession } from "../../../../lib/auth";
import { memberHasMemorialPass } from "../../../../lib/memorial-billing";
import {
  createEntry,
  findHallByCode,
  memberCanEditHall,
  syncHall,
} from "../../../../lib/memorial-store";
import { storeMemorialMedia } from "../../../../lib/memorial-media";

export async function POST(request: Request) {
  try {
    const user = await readSession();
    if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const form = await request.formData();
    const hallCode = String(form.get("hallCode") || "").trim();
    const title = String(form.get("title") || "").trim();
    const body = String(form.get("body") || "").trim();
    const file = form.get("file");

    if (!hallCode || !title) {
      return NextResponse.json({ error: "추모관과 제목을 입력해 주세요." }, { status: 400 });
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

    let mediaUrl = "";
    let mediaType: "image" | "video" | undefined;
    let entryType: "photo" | "video" | "text" = "text";

    if (file instanceof File && file.size > 0) {
      const stored = await storeMemorialMedia(file);
      mediaUrl = stored.url;
      mediaType = stored.mediaType;
      entryType = stored.mediaType === "video" ? "video" : "photo";
    }

    const id = await createEntry({
      hallCode,
      type: entryType,
      title,
      body,
      mediaUrl: mediaUrl || undefined,
      mediaType,
      eventKind: "family",
      authorId: user.id,
      authorName: user.name,
      status: "published",
    });

    await syncHall(hall);

    return NextResponse.json({ ok: true, id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "업로드 실패";
    return NextResponse.json({ error: message }, { status: errorStatus(error) || 500 });
  }
}
