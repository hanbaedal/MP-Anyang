export function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

export function formatPhone(value: string) {
  const digits = normalizePhone(value);
  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return value;
}
