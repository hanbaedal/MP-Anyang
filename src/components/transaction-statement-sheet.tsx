import Image from "next/image";
import type { StatementPayload } from "@/lib/receipt-statement";
import { STATEMENT_FACILITY } from "@/lib/receipt-statement";

const RED = "#c41e3a";
const cell = "border border-black px-1 py-[2px] text-[8.5px] leading-tight align-middle";
const th = `${cell} bg-[#f5f5f5] text-center font-normal whitespace-nowrap`;

function dateLine(parts: { year: string; month: string; day: string }, twoDigitYear = false) {
  const y = twoDigitYear ? parts.year.slice(-2) : parts.year;
  return `${y}년 ${parts.month}월 ${parts.day}일`;
}

function CopyBlock({ data }: { data: StatementPayload }) {
  return (
    <div className="statement-copy flex h-full min-w-0 flex-1 flex-col border-2 border-black bg-white p-[3px] text-black">
      <div className="relative mb-0.5 min-h-[14px] text-[7.5px] leading-none">
        <span className="absolute left-0 top-0 font-bold tracking-wide" style={{ color: RED }}>
          {data.serial}
        </span>
        <p className="px-8 text-center" style={{ color: RED }}>
          (법인묘지, 사설화장시설, 사설봉안시설, 사설자연장지용)
        </p>
        <span className="absolute right-0 top-0">{data.sideLabel}</span>
      </div>
      <h2 className="my-0.5 text-center text-[12px] font-bold tracking-[0.35em]">거 래 명 세 서 (영수증겸용)</h2>

      <table className="w-full flex-1 border-collapse table-fixed">
        <tbody>
          <tr>
            <td className={th} rowSpan={3} style={{ width: "9%" }}>
              공
              <br />
              급
              <br />자
            </td>
            <td className={th} style={{ width: "14%" }}>
              시설명
            </td>
            <td className={cell} colSpan={2}>
              {STATEMENT_FACILITY.name}
            </td>
            <td className={th} style={{ width: "16%" }}>
              사업자등록번호
            </td>
            <td className={cell}>{STATEMENT_FACILITY.bizNo}</td>
          </tr>
          <tr>
            <td className={th}>소재지</td>
            <td className={cell} colSpan={4}>
              {STATEMENT_FACILITY.address}
            </td>
          </tr>
          <tr>
            <td className={th}>대표자성명</td>
            <td className={`${cell} relative min-h-[28px]`}>
              <span className="relative z-[1]">{STATEMENT_FACILITY.representative}</span>
              <Image
                src="/images/representative-seal.png"
                alt=""
                width={56}
                height={56}
                className="pointer-events-none absolute left-[32%] top-1/2 z-[2] -translate-y-1/2 mix-blend-multiply opacity-90"
                unoptimized
              />
            </td>
            <td className={th}>사업장 전화번호</td>
            <td className={cell} colSpan={2}>
              {STATEMENT_FACILITY.phone}
            </td>
          </tr>
          <tr>
            <td className={th}>고인 성명</td>
            <td className={cell}>{data.deceased}</td>
            <td className={th}>연고자성명</td>
            <td className={cell}>{data.familyName}</td>
            <td className={th}>매장년월일</td>
            <td className={cell}>{dateLine(data.burial)}</td>
          </tr>
          <tr>
            <td className={th}>묘지 번호</td>
            <td className={cell}>{data.tombNo}</td>
            <td className={th}>평수</td>
            <td className={cell} colSpan={3}>
              {data.pyeong ? `${data.pyeong} 평` : ""}
            </td>
          </tr>
          <tr>
            <td className={th}>거래년월일</td>
            <td className={cell} colSpan={2}>
              {dateLine(data.transaction, true)}
            </td>
            <td className={th}>거래금액</td>
            <td className={cell} colSpan={2}>
              일금 {data.amountKr} 원정
            </td>
          </tr>
          <tr>
            <td className={th} colSpan={3}>
              관리기간
            </td>
            <td className={th} colSpan={3}>
              금액
            </td>
          </tr>
          <tr>
            <td className={cell} colSpan={3}>
              관리비 {data.mgmtPeriod}
            </td>
            <td className={cell} colSpan={3}>
              {data.mgmtAmount}
            </td>
          </tr>
          <tr>
            <td className={cell} colSpan={3}>
              산역비 {data.sanPeriod}
            </td>
            <td className={cell} colSpan={3}>
              {data.sanAmount}
            </td>
          </tr>
          <tr>
            <td className={th} rowSpan={7} style={{ writingMode: "vertical-rl", width: "6%" }}>
              시설물
            </td>
            <td className={th}>품목</td>
            <td className={th}>규격</td>
            <td className={th}>수량</td>
            <td className={th}>단가</td>
            <td className={th}>금액</td>
          </tr>
          {data.lines.map((line, i) => (
            <tr key={i}>
              <td className={cell}>{line.item}</td>
              <td className={cell}>{line.spec}</td>
              <td className={cell}>{line.qty}</td>
              <td className={cell}>{line.unitPrice}</td>
              <td className={cell}>{line.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p
        className="mt-0.5 border px-1 py-0.5 text-[7px] leading-tight"
        style={{ borderColor: RED, color: RED }}
      >
        {STATEMENT_FACILITY.footnote}
      </p>
    </div>
  );
}

export function TransactionStatementPage({ company, customer }: { company: StatementPayload; customer: StatementPayload }) {
  return (
    <div className="statement-sheet flex h-[190mm] w-[277mm] gap-[2mm] bg-white text-black print:print-color-exact">
      <CopyBlock data={company} />
      <CopyBlock data={customer} />
    </div>
  );
}

export function TransactionStatementPrintRoot({ children }: { children: React.ReactNode }) {
  return (
    <div id="receipt-print-root" className="receipt-print-root hidden print:block print:print-color-exact">
      {children}
    </div>
  );
}
