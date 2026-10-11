/** Public commercial facts. Invented 원·계좌는 넣지 않음. 출처에 없으면 확인 필요. */

export const UNCONFIRMED = "확인 필요";

export const BANK = {
  bank: UNCONFIRMED,
  account: UNCONFIRMED,
  holder: "(재)안양공원묘원",
  note: "안양공원.com은 ‘청약서 금액을 계좌·카드로 납부’만 있고 번호가 없습니다. PPT에도 계좌가 없습니다.",
} as const;

export const PRICES = [
  { nameKey: "price.burial1", won: UNCONFIRMED },
  { nameKey: "price.burial2", won: UNCONFIRMED },
  { nameKey: "price.burial3", won: UNCONFIRMED },
  { nameKey: "price.lawn", won: UNCONFIRMED },
  { nameKey: "price.col", won: UNCONFIRMED },
  { nameKey: "price.fee", won: UNCONFIRMED },
] as const;

export const REMAINING = [
  { nameKey: "remain.burial", seats: UNCONFIRMED },
  { nameKey: "remain.lawn", seats: UNCONFIRMED },
  { nameKey: "remain.col", seats: UNCONFIRMED },
] as const;

export const KAKAO_CHANNEL = {
  url: "",
  label: UNCONFIRMED,
  note: "안양공원.com·PPT·옛 저장소에 카카오채널 주소가 없습니다.",
} as const;

export const DEPOSIT_RATE = "10% 이상";
