const DIGITS = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];
const UNITS = ["", "십", "백", "천"];

function underTenThousand(n: number): string {
  if (n === 0) return "";
  let out = "";
  const s = String(n).padStart(4, "0");
  for (let i = 0; i < 4; i++) {
    const d = Number(s[i]);
    if (d === 0) continue;
    out += (d === 1 && i > 0 ? "" : DIGITS[d]) + UNITS[3 - i];
  }
  return out;
}

/** 금액(원)을 거래명세서 「일금 … 원정」용 한글 표기로 (근사) */
export function koreanWonAmount(amount: number): string {
  const n = Math.max(0, Math.round(amount));
  if (n === 0) return "영";
  const parts: string[] = [];
  let rest = n;
  const big = [
    { unit: "조", div: 1_0000_0000_0000 },
    { unit: "억", div: 1_0000_0000 },
    { unit: "만", div: 1_0000 },
  ];
  for (const { unit, div } of big) {
    if (rest >= div) {
      const chunk = Math.floor(rest / div);
      rest %= div;
      const text = underTenThousand(chunk);
      if (text) parts.push(`${text}${unit}`);
    }
  }
  if (rest > 0) parts.push(underTenThousand(rest));
  return parts.join("") || "영";
}
