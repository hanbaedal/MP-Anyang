"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal, flushSync } from "react-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TransactionStatementPreview } from "@/components/transaction-statement-preview";
import { TransactionStatementPage, TransactionStatementPrintRoot } from "@/components/transaction-statement-sheet";
import type { ContractCopy } from "@/lib/cemetery-parse";
import { koreanWonAmount } from "@/lib/korean-won";
import type { DateParts, StatementLine, StatementPayload } from "@/lib/receipt-statement";

const LINE_COUNT = 6;

function emptyLine(): StatementLine {
  return { item: "", spec: "", qty: "", unitPrice: "", amount: "" };
}

function kstToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function isoParts(iso: string): DateParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return { year: "", month: "", day: "" };
  return { year: match[1], month: match[2], day: match[3] };
}

function compactYmd(iso: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.replaceAll("-", "") : "";
}

function periodText(from: string, to: string) {
  const start = compactYmd(from);
  const end = compactYmd(to);
  if (start && end) return `${start} ~ ${end}`;
  return start || end;
}

function moneyText(raw: string) {
  const n = Number(raw.replaceAll(",", "").trim());
  if (!raw.trim() || !Number.isFinite(n)) return "";
  return Math.round(n).toLocaleString("ko-KR");
}

function nameKey(value: string) {
  return value.replace(/\s/g, "");
}

function burialToIso(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length >= 8) return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  if (digits.length >= 6) return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-01`;
  return "";
}

function feeLine(item: string, from: string, to: string, amountRaw: string): StatementLine {
  const amount = moneyText(amountRaw);
  const spec = periodText(from, to);
  if (!item && !spec && !amount) return emptyLine();
  return {
    item: amount || spec ? item : "",
    spec,
    qty: amount ? "1" : "",
    unitPrice: amount,
    amount,
  };
}

function buildSide(input: {
  serial: string;
  sideLabel: "(회사용)" | "(고객용)";
  deceased: string;
  familyName: string;
  burial: string;
  tombNo: string;
  pyeong: string;
  transaction: string;
  amount: string;
  mgmtPeriod: string;
  mgmtAmount: string;
  sanPeriod: string;
  sanAmount: string;
  lines: StatementLine[];
}): StatementPayload {
  const amount = Number(input.amount.replaceAll(",", "").trim());
  const hasAmount = input.amount.trim() !== "" && Number.isFinite(amount);
  return {
    serial: input.serial,
    sideLabel: input.sideLabel,
    deceased: input.deceased.trim(),
    familyName: input.familyName.trim(),
    burial: isoParts(input.burial),
    tombNo: input.tombNo.trim(),
    pyeong: input.pyeong.trim(),
    transaction: isoParts(input.transaction),
    amountKr: hasAmount ? koreanWonAmount(amount) : "",
    amountNum: hasAmount ? Math.round(amount).toLocaleString("ko-KR") : "",
    mgmtPeriod: input.mgmtPeriod,
    mgmtAmount: moneyText(input.mgmtAmount),
    sanPeriod: input.sanPeriod,
    sanAmount: moneyText(input.sanAmount),
    lines: input.lines,
  };
}

function BodyPrintPortal({ children }: { children: ReactNode }) {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  useEffect(() => setRoot(document.body), []);
  if (!root) return null;
  return createPortal(children, root);
}

async function fetchSerial() {
  const res = await fetch("/api/work/statement-serial", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ count: 1 }),
  });
  const json = (await res.json()) as { ok?: boolean; serial?: string; error?: string };
  if (!res.ok || !json.ok || !json.serial) throw new Error(json.error || "일련번호를 발급하지 못했습니다.");
  return json.serial;
}

export function WorkStatementForm({ contracts }: { contracts: ContractCopy[] }) {
  const [deceased, setDeceased] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [burial, setBurial] = useState("");
  const [tombNo, setTombNo] = useState("");
  const [pyeong, setPyeong] = useState("");
  const [transaction, setTransaction] = useState(kstToday);
  const [amount, setAmount] = useState("");
  const [mgmtFrom, setMgmtFrom] = useState("");
  const [mgmtTo, setMgmtTo] = useState("");
  const [mgmtAmount, setMgmtAmount] = useState("");
  const [sanFrom, setSanFrom] = useState("");
  const [sanTo, setSanTo] = useState("");
  const [sanAmount, setSanAmount] = useState("");
  const [lines, setLines] = useState<StatementLine[]>(() => Array.from({ length: LINE_COUNT }, emptyLine));
  const [lockMgmt, setLockMgmt] = useState(false);
  const [lockSan, setLockSan] = useState(false);
  const [serial, setSerial] = useState("");
  const [printPair, setPrintPair] = useState<{ company: StatementPayload; customer: StatementPayload } | null>(null);
  const [lookupOpen, setLookupOpen] = useState(false);
  const [matches, setMatches] = useState<ContractCopy[]>([]);
  const [dismissedFor, setDismissedFor] = useState("");

  useEffect(() => {
    if (lockMgmt) return;
    setLines((prev) => {
      const next = [...prev];
      next[0] = feeLine("관리비", mgmtFrom, mgmtTo, mgmtAmount);
      return next;
    });
  }, [lockMgmt, mgmtAmount, mgmtFrom, mgmtTo]);

  useEffect(() => {
    if (lockSan) return;
    setLines((prev) => {
      const next = [...prev];
      next[1] = feeLine("산역비", sanFrom, sanTo, sanAmount);
      return next;
    });
  }, [lockSan, sanAmount, sanFrom, sanTo]);

  useEffect(() => {
    const query = nameKey(deceased.trim());
    if (query.length < 2) {
      setMatches([]);
      setLookupOpen(false);
      return;
    }
    const timer = window.setTimeout(() => {
      const found = contracts.filter((row) => nameKey(row.userName).includes(query));
      setMatches(found);
      setLookupOpen(found.length > 0 && dismissedFor !== query);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [contracts, deceased, dismissedFor]);

  const draft = useMemo(() => {
    const shared = {
      serial,
      deceased,
      familyName,
      burial,
      tombNo,
      pyeong,
      transaction,
      amount,
      mgmtPeriod: periodText(mgmtFrom, mgmtTo),
      mgmtAmount,
      sanPeriod: periodText(sanFrom, sanTo),
      sanAmount,
      lines,
    };
    return {
      company: buildSide({ ...shared, sideLabel: "(회사용)" }),
      customer: buildSide({ ...shared, sideLabel: "(고객용)" }),
    };
  }, [
    amount,
    burial,
    deceased,
    familyName,
    lines,
    mgmtAmount,
    mgmtFrom,
    mgmtTo,
    pyeong,
    sanAmount,
    sanFrom,
    sanTo,
    serial,
    tombNo,
    transaction,
  ]);

  useEffect(() => {
    const clear = () => setPrintPair(null);
    window.addEventListener("afterprint", clear);
    return () => window.removeEventListener("afterprint", clear);
  }, []);

  function updateLine(index: number, key: keyof StatementLine, value: string) {
    if (index === 0) setLockMgmt(true);
    if (index === 1) setLockSan(true);
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, [key]: value } : line)));
  }

  function applyContract(row: ContractCopy) {
    const fullName = row.userName.trim();
    setFamilyName(row.familyName.trim());
    setBurial(burialToIso(row.burialDate));
    setTombNo(row.tombNo.trim());
    setPyeong(row.pyeong.replace(/평/g, "").trim());
    if (fullName) setDeceased(fullName);
    setDismissedFor(nameKey(fullName || deceased));
    setLookupOpen(false);
  }

  async function printStatement() {
    try {
      const nextSerial = serial || (await fetchSerial());
      const shared = { ...draft.company, serial: nextSerial };
      const pair = {
        company: { ...shared, sideLabel: "(회사용)" as const },
        customer: { ...shared, sideLabel: "(고객용)" as const },
      };
      flushSync(() => {
        setSerial(nextSerial);
        setPrintPair(pair);
      });
      requestAnimationFrame(() => window.print());
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "출력 준비에 실패했습니다.");
    }
  }

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[22rem_minmax(0,1fr)]">
      <form
        className="space-y-3 rounded-xl border bg-card p-3"
        onSubmit={(event) => {
          event.preventDefault();
          void printStatement();
        }}
      >
        <Field label="고인성명">
          <Input value={deceased} onChange={(event) => setDeceased(event.target.value)} autoComplete="off" />
          <p className="text-[11px] text-muted-foreground">두 글자 이상이면 계약에서 같은 이름을 찾습니다.</p>
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="연고자성명">
            <Input value={familyName} onChange={(event) => setFamilyName(event.target.value)} />
          </Field>
          <Field label="매장년월일">
            <Input type="date" value={burial} onChange={(event) => setBurial(event.target.value)} />
          </Field>
          <Field label="묘지번호">
            <Input value={tombNo} onChange={(event) => setTombNo(event.target.value)} />
          </Field>
          <Field label="평수">
            <Input value={pyeong} onChange={(event) => setPyeong(event.target.value)} inputMode="decimal" />
          </Field>
          <Field label="거래년월일">
            <Input type="date" value={transaction} onChange={(event) => setTransaction(event.target.value)} />
          </Field>
          <Field label="거래금액">
            <Input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="numeric" placeholder="숫자" />
          </Field>
        </div>
        <fieldset className="space-y-2 rounded-md border p-2">
          <legend className="px-1 text-xs text-muted-foreground">관리비</legend>
          <div className="grid grid-cols-2 gap-2">
            <Field label="시작">
              <Input type="date" value={mgmtFrom} onChange={(event) => setMgmtFrom(event.target.value)} />
            </Field>
            <Field label="종료">
              <Input type="date" value={mgmtTo} onChange={(event) => setMgmtTo(event.target.value)} />
            </Field>
          </div>
          <Field label="금액">
            <Input value={mgmtAmount} onChange={(event) => setMgmtAmount(event.target.value)} inputMode="numeric" />
          </Field>
        </fieldset>
        <fieldset className="space-y-2 rounded-md border p-2">
          <legend className="px-1 text-xs text-muted-foreground">산역비</legend>
          <div className="grid grid-cols-2 gap-2">
            <Field label="시작">
              <Input type="date" value={sanFrom} onChange={(event) => setSanFrom(event.target.value)} />
            </Field>
            <Field label="종료">
              <Input type="date" value={sanTo} onChange={(event) => setSanTo(event.target.value)} />
            </Field>
          </div>
          <Field label="금액">
            <Input value={sanAmount} onChange={(event) => setSanAmount(event.target.value)} inputMode="numeric" />
          </Field>
        </fieldset>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[20rem] text-left text-xs">
            <thead className="text-muted-foreground">
              <tr>
                <th className="px-1 py-1 font-medium">품목</th>
                <th className="px-1 py-1 font-medium">규격</th>
                <th className="px-1 py-1 font-medium">수량</th>
                <th className="px-1 py-1 font-medium">단가</th>
                <th className="px-1 py-1 font-medium">금액</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, index) => (
                <tr key={index}>
                  {(["item", "spec", "qty", "unitPrice", "amount"] as const).map((key) => (
                    <td key={key} className="p-0.5">
                      <Input
                        className="h-8 px-2 text-xs"
                        value={line[key]}
                        onChange={(event) => updateLine(index, key, event.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">{serial ? `일련번호 ${serial}` : "출력할 때 일련번호가 붙습니다."}</p>
          <Button type="submit" size="sm">
            출력
          </Button>
        </div>
      </form>

      <div className="h-[min(78vh,820px)] min-h-[420px] overflow-hidden rounded-md border bg-muted/30">
        <TransactionStatementPreview company={draft.company} customer={draft.customer} />
      </div>

      <Dialog
        open={lookupOpen}
        onOpenChange={(open) => {
          setLookupOpen(open);
          if (!open) setDismissedFor(nameKey(deceased.trim()));
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>같은 고인성명</DialogTitle>
            <DialogDescription>줄을 누르면 연고자, 매장일, 묘지번호, 평수가 채워집니다. 금액은 바뀌지 않습니다.</DialogDescription>
          </DialogHeader>
          <div className="max-h-72 overflow-y-auto rounded-md border text-xs">
            <div className="sticky top-0 grid grid-cols-5 bg-muted text-muted-foreground">
              <span className="px-2 py-1.5">묘지번호</span>
              <span className="px-2 py-1.5">고인성명</span>
              <span className="px-2 py-1.5">연고자성명</span>
              <span className="px-2 py-1.5">매장년월일</span>
              <span className="px-2 py-1.5">평수</span>
            </div>
            {matches.map((row, index) => (
              <button
                key={`${row.contractNo}-${row.tombNo}-${index}`}
                type="button"
                className="grid w-full grid-cols-5 border-t text-left hover:bg-accent"
                onClick={() => applyContract(row)}
              >
                <span className="truncate px-2 py-1.5">{row.tombNo || "—"}</span>
                <span className="truncate px-2 py-1.5">{row.userName || "—"}</span>
                <span className="truncate px-2 py-1.5">{row.familyName || "—"}</span>
                <span className="truncate px-2 py-1.5">{row.burialDate || "—"}</span>
                <span className="truncate px-2 py-1.5">{row.pyeong || "—"}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <BodyPrintPortal>
        <TransactionStatementPrintRoot>
          {printPair ? (
            <div className="receipt-print-page">
              <TransactionStatementPage company={printPair.company} customer={printPair.customer} />
            </div>
          ) : null}
        </TransactionStatementPrintRoot>
      </BodyPrintPortal>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}
