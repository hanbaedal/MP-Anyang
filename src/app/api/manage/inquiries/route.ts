import { NextResponse } from "next/server";
import { answerInquiry, listInquiries, setInquirySmsResult } from "@/lib/inquiries";
import { requireStaffApi } from "@/lib/manage-guard";
import { sendInquiryAnswerSms, verifySolapiConnection } from "@/lib/solapi";

export async function GET() {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;
  const solapi = await verifySolapiConnection();
  return NextResponse.json({ ok: true, items: await listInquiries(), solapi });
}

export async function PATCH(request: Request) {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;
  const body = (await request.json()) as { id?: string; answer?: string; sendSms?: boolean };
  if (!body.id) return NextResponse.json({ ok: false, error: "문의가 없습니다." }, { status: 400 });

  const result = await answerInquiry(body.id, body.answer ?? "", guard.session.name || guard.session.username);
  if (!result.ok) return NextResponse.json(result, { status: 400 });

  // 문자는 명시적으로 선택한 경우에만 발송. 답변 자체는 항상 홈페이지 목록에 반영됨.
  const sendSms = body.sendSms === true;
  if (!sendSms) {
    await setInquirySmsResult(body.id, {
      smsStatus: "skipped",
      smsError: "홈페이지 답변만 저장 (문자 미발송)",
    });
    return NextResponse.json({
      ok: true,
      sms: { ok: false, skipped: true, error: "홈페이지 답변만 저장했습니다." },
    });
  }

  const sms = await sendInquiryAnswerSms({
    to: result.inquiry.phone,
    answer: result.inquiry.answer,
    name: result.inquiry.name,
  });

  if (sms.ok) {
    await setInquirySmsResult(body.id, { smsStatus: "sent", smsTo: sms.to });
  } else {
    await setInquirySmsResult(body.id, {
      smsStatus: sms.skipped ? "skipped" : "failed",
      smsError: sms.error,
      smsTo: normalizeStoredTo(result.inquiry.phone),
    });
  }

  return NextResponse.json({ ok: true, sms });
}

function normalizeStoredTo(phone: string) {
  return phone.replace(/[^\d]/g, "") || phone;
}
