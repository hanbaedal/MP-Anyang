import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t, type Locale } from "@/lib/i18n";
import type { FeePayFilter } from "@/lib/work-status";

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

export function WorkFeeFilter({
  locale,
  from,
  to,
  status,
}: {
  locale: Locale;
  from: string;
  to: string;
  status: FeePayFilter;
}) {
  return (
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
        <select id="work-fee-status" name="status" defaultValue={status} className={selectClass}>
          <option value="all">{t(locale, "work.feeStateAll")}</option>
          <option value="paid">{t(locale, "work.feeStatePaid")}</option>
          <option value="unpaid">{t(locale, "work.feeStateUnpaid")}</option>
        </select>
      </div>
      <Button type="submit" size="sm">
        {t(locale, "work.lookup")}
      </Button>
    </form>
  );
}
