import Image from "next/image";
import type { StatementPayload } from "@/lib/receipt-statement";
import { STATEMENT_FACILITY } from "@/lib/receipt-statement";

const RED = "#c41e3a";
const cell = "border border-black text-center align-middle whitespace-nowrap";
const th = `${cell} bg-[#f5f5f5] font-normal`;

function dateLine(parts: { year: string; month: string; day: string }, twoDigitYear = false) {
  const y = twoDigitYear ? parts.year.slice(-2) : parts.year;
  return `${y}년 ${parts.month}월 ${parts.day}일`;
}

function CopyBlock({ data }: { data: StatementPayload }) {
  return (
    <div className="statement-copy flex h-full min-w-0 flex-1 flex-col bg-white text-black">
      <div className="statement-serial shrink-0" style={{ color: RED }}>
        {data.serial}
      </div>
      <div className="statement-frame flex min-h-0 flex-1 flex-col border-2 border-black p-[1.5px]">
      <div className="statement-banner relative shrink-0">
        <p className="px-8 text-center" style={{ color: RED }}>
          (법인묘지, 사설화장시설, 사설봉안시설, 사설자연장지용)
        </p>
        <span className="absolute right-0 top-0">{data.sideLabel}</span>
      </div>
      <h2 className="statement-title shrink-0 text-center">거 래 명 세 서 (영수증겸용)</h2>

      <div className="statement-tables">
      <table className="statement-table statement-table-main">
        <colgroup>
          <col style={{ width: "14.2%" }} />
          <col style={{ width: "16.5%" }} />
          <col style={{ width: "14.8%" }} />
          <col style={{ width: "14.9%" }} />
          <col style={{ width: "14.5%" }} />
          <col style={{ width: "25.1%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td className={th} style={{ letterSpacing: "0.28em" }}>
              시설명
            </td>
            <td className={cell} colSpan={2}>
              {STATEMENT_FACILITY.name}
            </td>
            <td className={th} colSpan={2}>
              사업자등록번호
            </td>
            <td className={cell}>{STATEMENT_FACILITY.bizNo}</td>
          </tr>
          <tr>
            <td className={th} style={{ letterSpacing: "0.28em" }}>
              소재지
            </td>
            <td className={`${cell} whitespace-normal`} colSpan={5}>
              {STATEMENT_FACILITY.address}
            </td>
          </tr>
          <tr className="stmt-row-seal">
            <td className={th}>대표자성명</td>
            <td className={`${cell} statement-rep-cell`} colSpan={2}>
              <span className="statement-rep">
                <span className="statement-rep-name">{STATEMENT_FACILITY.representative}</span>
                <span className="statement-rep-mark">
                  (인)
                  <Image
                    src="/images/representative-seal.png"
                    alt=""
                    width={64}
                    height={64}
                    className="statement-seal pointer-events-none mix-blend-multiply"
                    unoptimized
                  />
                </span>
              </span>
            </td>
            <td className={th} colSpan={2}>
              사업장 전화번호
            </td>
            <td className={cell}>{STATEMENT_FACILITY.phone}</td>
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
            <td className={th} style={{ letterSpacing: "0.2em" }}>
              묘지 번호
            </td>
            <td className={cell} colSpan={2}>
              {data.tombNo}
            </td>
            <td className={th} style={{ letterSpacing: "0.28em" }}>
              평수
            </td>
            <td className={cell} colSpan={2}>
              <span className="flex items-center justify-between px-[0.4em]">
                <span>{data.pyeong}</span>
                <span>평</span>
              </span>
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
            <td className={th} colSpan={5} style={{ letterSpacing: "0.55em" }}>
              관리기간
            </td>
            <td className={th} style={{ letterSpacing: "0.35em" }}>
              금액
            </td>
          </tr>
          <tr>
            <td className={th} style={{ letterSpacing: "0.28em" }}>
              관리비
            </td>
            <td className={cell} colSpan={4}>
              {data.mgmtPeriod}
            </td>
            <td className={cell}>{data.mgmtAmount}</td>
          </tr>
          <tr>
            <td className={th} style={{ letterSpacing: "0.28em" }}>
              산역비
            </td>
            <td className={cell} colSpan={4}>
              {data.sanPeriod}
            </td>
            <td className={cell}>{data.sanAmount}</td>
          </tr>
        </tbody>
      </table>
      <table className="statement-table statement-table-items">
        <colgroup>
          <col style={{ width: "5%" }} />
          <col style={{ width: "39%" }} />
          <col style={{ width: "13%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "16%" }} />
          <col style={{ width: "18%" }} />
        </colgroup>
        <tbody>
          <tr>
            <td className={th} rowSpan={7} style={{ writingMode: "vertical-rl" }}>
              시설물
            </td>
            <td className={th} style={{ letterSpacing: "0.6em" }}>
              품목
            </td>
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
      </div>
      <p className="statement-note shrink-0 border" style={{ borderColor: RED, color: RED }}>
        {STATEMENT_FACILITY.footnote}
      </p>
      </div>
    </div>
  );
}

export function TransactionStatementPage({ company, customer }: { company: StatementPayload; customer: StatementPayload }) {
  return (
    <div className="statement-sheet flex h-[190mm] w-[277mm] bg-white text-black print:print-color-exact">
      <CopyBlock data={company} />
      <div className="statement-perforation" aria-hidden="true">
        <span>절취선</span>
      </div>
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
