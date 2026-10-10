import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t, type Locale } from "@/lib/i18n";
import type { FeePayFilter, FeeQuerySummary } from "@/lib/work-status";

const selectClass =
  "h-9 w-full min-w-[8rem] rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function WorkYearFilter({
  locale,
  years,
  year,
}: {
  locale: Locale;
  years: number[];
  year: number;
}) {
  return (
    <form key={year} method="get" className="flex flex-wrap items-end gap-3 rounded-lg border bg-card px-3 py-3">
      <div className="grid gap-1.5">
        <label htmlFor="work-year" className="text-sm font-medium">
          {t(locale, "work.yearLabel")}
        </label>
        <select id="work-year" name="year" defaultValue={String(year)} className={selectClass}>
          {years.map((item) => (
            <option key={item} value={item}>
              {item}년
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" size="sm">
        {t(locale, "work.lookup")}
      </Button>
    </form>
  );
}

export function WorkContractFilter({
  locale,
  years,
  year,
  tomb,
  burialFrom,
  burialTo,
}: {
  locale: Locale;
  years: number[];
  year: number;
  tomb: string;
  burialFrom: string;
  burialTo: string;
}) {
  return (
    <form
      key={`${year}-${tomb}-${burialFrom}-${burialTo}`}
      method="get"
      className="flex flex-wrap items-end gap-3 rounded-lg border bg-card px-3 py-3"
    >
      <div className="grid gap-1.5">
        <label htmlFor="work-contract-year" className="text-sm font-medium">
          {t(locale, "work.yearLabel")}
        </label>
        <select id="work-contract-year" name="year" defaultValue={String(year)} className={selectClass}>
          {years.map((item) => (
            <option key={item} value={item}>
              {item}년
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="work-contract-tomb" className="text-sm font-medium">
          묘지번호
        </label>
        <Input id="work-contract-tomb" name="tomb" defaultValue={tomb} placeholder="일부 입력 가능" className="w-36" />
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="work-burial-from" className="text-sm font-medium">
          매장일(부터)
        </label>
        <Input id="work-burial-from" name="burialFrom" type="date" defaultValue={burialFrom} className="w-auto" />
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="work-burial-to" className="text-sm font-medium">
          매장일(까지)
        </label>
        <Input id="work-burial-to" name="burialTo" type="date" defaultValue={burialTo} className="w-auto" />
      </div>
      <Button type="submit" size="sm">
        {t(locale, "work.lookup")}
      </Button>
    </form>
  );
}

function FeeStatusSelect({ locale, status, id }: { locale: Locale; status: FeePayFilter; id: string }) {
  return (
    <select id={id} name="status" defaultValue={status} className={selectClass}>
      <option value="all">{t(locale, "work.feeStateAll")}</option>
      <option value="paid">{t(locale, "work.feeStatePaid")}</option>
      <option value="unpaid">{t(locale, "work.feeStateUnpaid")}</option>
      <option value="hold">{t(locale, "work.feeStateHold")}</option>
    </select>
  );
}

export function WorkFeeFilter({
  locale,
  from,
  to,
  status,
  summary,
}: {
  locale: Locale;
  from: string;
  to: string;
  status: FeePayFilter;
  summary?: FeeQuerySummary;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <form
        key={`${from}-${to}-${status}`}
        method="get"
        className="flex flex-wrap items-end gap-3 rounded-lg border bg-card px-3 py-3"
      >
        <div className="grid gap-1.5">
          <label htmlFor="work-fee-from" className="text-sm font-medium">
            {t(locale, "work.feeFrom")}
          </label>
          <Input id="work-fee-from" name="from" type="date" defaultValue={from} className="w-auto" />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="work-fee-to" className="text-sm font-medium">
            {t(locale, "work.feeTo")}
          </label>
          <Input id="work-fee-to" name="to" type="date" defaultValue={to} className="w-auto" />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="work-fee-status" className="text-sm font-medium">
            {t(locale, "work.feePayState")}
          </label>
          <FeeStatusSelect locale={locale} status={status} id="work-fee-status" />
        </div>
        <Button type="submit" size="sm">
          {t(locale, "work.lookup")}
        </Button>
      </form>
      {summary ? (
        <div className="min-w-[10rem] rounded-lg border bg-card px-4 py-3 text-sm">
          <p className="text-xs text-muted-foreground">{t(locale, "work.feeQuerySummary")}</p>
          <p className="mt-1 font-medium tabular-nums">
            {summary.rowCount.toLocaleString("ko-KR")}건 · 묘지 {summary.uniqueCount.toLocaleString("ko-KR")} ·{" "}
            {summary.amount.toLocaleString("ko-KR")}원
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function WorkReceiptFilter({
  locale,
  from,
  to,
  status,
  tomb,
}: {
  locale: Locale;
  from: string;
  to: string;
  status: FeePayFilter;
  tomb: string;
}) {
  return (
    <form
      key={`${from}-${to}-${status}-${tomb}`}
      method="get"
      className="flex flex-wrap items-end gap-3 rounded-lg border bg-card px-3 py-3"
    >
      <div className="grid gap-1.5">
        <label htmlFor="work-receipt-from" className="text-sm font-medium">
          {t(locale, "work.feeFrom")}
        </label>
        <Input id="work-receipt-from" name="from" type="date" defaultValue={from} className="w-auto" />
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="work-receipt-to" className="text-sm font-medium">
          {t(locale, "work.feeTo")}
        </label>
        <Input id="work-receipt-to" name="to" type="date" defaultValue={to} className="w-auto" />
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="work-receipt-status" className="text-sm font-medium">
          {t(locale, "work.feePayState")}
        </label>
        <FeeStatusSelect locale={locale} status={status} id="work-receipt-status" />
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="work-receipt-tomb" className="text-sm font-medium">
          묘지번호
        </label>
        <Input id="work-receipt-tomb" name="tomb" defaultValue={tomb} placeholder="선택" className="w-32" />
      </div>
      <Button type="submit" size="sm">
        {t(locale, "work.lookup")}
      </Button>
    </form>
  );
}
