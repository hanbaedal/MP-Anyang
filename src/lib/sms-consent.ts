export type SmsConsentFields = {
  smsConsent: boolean;
  marketingSmsConsent: boolean;
  smsConsentAt: Date | null;
};

export function smsConsentFromForm(form: FormData): SmsConsentFields {
  const smsConsent = form.get("smsConsent") === "on";
  const marketingSmsConsent = form.get("marketingSmsConsent") === "on";
  return {
    smsConsent,
    marketingSmsConsent,
    smsConsentAt: smsConsent || marketingSmsConsent ? new Date() : null,
  };
}

export function formatSmsConsentAt(value: unknown) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("ko-KR");
}
