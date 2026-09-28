import type { StatementPayload } from "@/lib/receipt-statement";
import { STATEMENT_FACILITY } from "@/lib/receipt-statement";

const cell = "border border-black px-0.5 py-0 text-[9px] leading-tight";
const th = `${cell} bg-neutral-100 text-center font-normal`;

function CopyBlock({ data }: { data: StatementPayload }) {
  return (
    <div className="h-full min-w-0 flex-1 border border-black p-1">
      <div className="flex items-start justify-between text-[8px]">
        <span className="font-semibold text-red-700">{data.serial}</span>
        <span className="text-[7px] text-neutral-600">(법인묘지, 사설화장시설, 사설봉안시설, 사설자연장지용)</span>
        <span>{data.sideLabel}</span>
      </div>
      <h2 className="my-1 text-center text-[11px] font-bold tracking-[0.2em]">거 래 명 세 서 (영수증겸용)</h2>
      <table className="w-full border-collapse">
        <tbody>
          <tr>
            <td className={th} rowSpan={4} style={{ width: "12%" }}>
              공급자
            </td>
            <td className={th} style={{ width: "18%" }}>
              시설명
            </td>
            <td className={cell} colSpan={3}>
              {STATEMENT_FACILITY.name}
            </td>
          </tr>
          <tr>
            <td className={th}>사업자등록번호</td>
            <td className={cell} colSpan={3}>
              {STATEMENT_FACILITY.bizNo}
            </td>
          </tr>
          <tr>
            <td className={th}>소재지</td>
            <td className={cell} colSpan={3}>
              {STATEMENT_FACILITY.address}
            </td>
          </tr>
          <tr>
            <td className={th}>대표자성명</td>
            <td className={cell}>{STATEMENT_FACILITY.representative}</td>
            <td className={th}>사업장 전화번호</td>
            <td className={cell}>{STATEMENT_FACILITY.phone}</td>
          </tr>
          <tr>
            <td className={th}>고인 성명</td>
            <td className={cell}>{data.deceased}</td>
            <td className={th}>연고자성명</td>
            <td className={cell} colSpan={2}>
              {data.familyName}
            </td>
          </tr>
          <tr>
            <td className={th}>매장년월일</td>
            <td className={cell}>
              {data.burial.year}년 {data.burial.month}월 {data.burial.day}일
            </td>
            <td className={th}>묘지 번호</td>
            <td className={cell}>{data.tombNo}</td>
            <td className={cell} style={{ width: "14%" }}>
              {data.pyeong ? `${data.pyeong} 평` : ""}
            </td>
          </tr>
          <tr>
            <td className={th}>거래년월일</td>
            <td className={cell} colSpan={2}>
              {data.transaction.year}년 {data.transaction.month}월 {data.transaction.day}일
            </td>
            <td className={th}>거래금액</td>
            <td className={cell}>
              일금 {data.amountKr} 원정 (₩{data.amountNum})
            </td>
          </tr>
          <tr>
            <td className={th} colSpan={2}>
              관리기간
            </td>
            <td className={th} colSpan={3}>
              금액
            </td>
          </tr>
          <tr>
            <td className={cell} colSpan={2}>
              관리비 {data.mgmtPeriod}
            </td>
            <td className={cell} colSpan={3}>
              {data.mgmtAmount}
            </td>
          </tr>
          <tr>
            <td className={cell} colSpan={2}>
              산역비 {data.sanPeriod}
            </td>
            <td className={cell} colSpan={3}>
              {data.sanAmount}
            </td>
          </tr>
          <tr>
            <td className={th} rowSpan={7} style={{ writingMode: "vertical-rl" }}>
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
      <p className="mt-1 border border-red-600 px-1 py-0.5 text-[7px] leading-tight text-red-700">
        {STATEMENT_FACILITY.footnote}
      </p>
    </div>
  );
}

export function TransactionStatementPage({ company, customer }: { company: StatementPayload; customer: StatementPayload }) {
  return (
    <div className="flex h-[190mm] w-[277mm] gap-1 bg-white text-black">
      <CopyBlock data={company} />
      <CopyBlock data={customer} />
    </div>
  );
}

export function TransactionStatementPrintRoot({ children }: { children: React.ReactNode }) {
  return (
    <div id="receipt-print-root" className="receipt-print-root hidden print:block">
      {children}
    </div>
  );
}
