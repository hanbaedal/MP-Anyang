import { MIN_MEMBER_AGE } from "./identity-config";

/** 생년월일(YYYY-MM-DD) 기준 만 나이 */
export function fullYearsSince(birthDate: string, today = new Date()) {
  const birth = parseBirthDate(birthDate);
  if (!birth) return -1;
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

export function parseBirthDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function isAtLeastMinAge(birthDate: string, minAge = MIN_MEMBER_AGE, today = new Date()) {
  const age = fullYearsSince(birthDate, today);
  return age >= minAge;
}
