import { SolapiMessageService } from "solapi";
import { SITE } from "./site";

export type SmsSendResult =
  | { ok: true; to: string; groupId?: string }
  | { ok: false; error: string; skipped?: boolean };

function digitsOnly(value: string) {
  return value.replace(/[^\d]/g, "");
}

/** 솔라피 수신/발신 형식: 01012345678 (하이픈·공백 없음) */
export function normalizeKrPhone(value: string): string | null {
  let digits = digitsOnly(value);
  if (digits.startsWith("82") && digits.length >= 11) {
    digits = `0${digits.slice(2)}`;
  }
  if (digits.length < 9 || digits.length > 11) return null;
  return digits;
}

/** 솔라피 발신번호(사전등록). Render에서 SOLAPI_FROM으로 덮을 수 있습니다. */
export const SOLAPI_DEFAULT_FROM = "01051492949";

export function solapiFromNumber() {
  return normalizeKrPhone(process.env.SOLAPI_FROM?.trim() || SOLAPI_DEFAULT_FROM);
}

export function solapiConfigured() {
  return Boolean(process.env.SOLAPI_API_KEY?.trim() && process.env.SOLAPI_API_SECRET?.trim() && solapiFromNumber());
}

/** 키·시크릿이 실제로 먹히는지 잔액 조회로 확인 (비밀값은 반환하지 않음) */
export async function verifySolapiConnection(): Promise<{
  configured: boolean;
  from: string | null;
  authOk: boolean;
  error?: string;
  balance?: { balance?: number; point?: number };
}> {
  const from = solapiFromNumber();
  const apiKey = process.env.SOLAPI_API_KEY?.trim() ?? "";
  const apiSecret = process.env.SOLAPI_API_SECRET?.trim() ?? "";
  if (!apiKey || !apiSecret || !from) {
    return {
      configured: false,
      from,
      authOk: false,
      error: "SOLAPI_API_KEY 또는 SOLAPI_API_SECRET이 없습니다.",
    };
  }
  try {
    const service = new SolapiMessageService(apiKey, apiSecret);
    const balance = await service.getBalance();
    return {
      configured: true,
      from,
      authOk: true,
      balance: {
        balance: typeof balance?.balance === "number" ? balance.balance : undefined,
        point: typeof balance?.point === "number" ? balance.point : undefined,
      },
    };
  } catch (error) {
    const message =
      error && typeof error === "object" && "message" in error
        ? String((error as { message: unknown }).message)
        : error instanceof Error
          ? error.message
          : "솔라피 인증에 실패했습니다.";
    return { configured: true, from, authOk: false, error: message };
  }
}

export function buildInquiryAnswerSms(answer: string, name?: string) {
  const who = name?.trim() ? `${name.trim()}님, ` : "";
  const body = answer.trim();
  const text = `[${SITE.shortName}] ${who}문의 답변입니다.\n\n${body}\n\n문의 ${SITE.phone.replace(/\u2011/g, "-")}`;
  // LMS 본문 여유 (2000자 근처에서 자름)
  return text.length > 1900 ? `${text.slice(0, 1890)}…` : text;
}

export async function sendInquiryAnswerSms(input: {
  to: string;
  answer: string;
  name?: string;
}): Promise<SmsSendResult> {
  const apiKey = process.env.SOLAPI_API_KEY?.trim() ?? "";
  const apiSecret = process.env.SOLAPI_API_SECRET?.trim() ?? "";
  const from = solapiFromNumber();
  const to = normalizeKrPhone(input.to);

  if (!apiKey || !apiSecret || !from) {
    return {
      ok: false,
      skipped: true,
      error: "솔라피 설정이 없습니다. Render에 SOLAPI_API_KEY·SOLAPI_API_SECRET을 넣어 주세요. 발신번호 기본값은 01051492949입니다.",
    };
  }
  if (!to) {
    return { ok: false, error: "문의 연락처가 올바르지 않아 문자를 보내지 못했습니다." };
  }

  const text = buildInquiryAnswerSms(input.answer, input.name);
  const subject = `[${SITE.shortName}] 문의 답변`;

  try {
    const service = new SolapiMessageService(apiKey, apiSecret);
    const result = await service.send({
      to,
      from,
      text,
      subject,
    });
    const groupId =
      result && typeof result === "object" && "groupId" in result
        ? String((result as { groupId?: string }).groupId ?? "")
        : undefined;
    return { ok: true, to, groupId: groupId || undefined };
  } catch (error) {
    const message =
      error && typeof error === "object" && "message" in error
        ? String((error as { message: unknown }).message)
        : error instanceof Error
          ? error.message
          : "문자 발송에 실패했습니다.";
    console.error("[solapi] send failed", message);
    return { ok: false, error: message || "문자 발송에 실패했습니다." };
  }
}
