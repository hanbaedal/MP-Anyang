"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ViewToggle({
  mode,
  onChange,
  inputLabel = "입력",
  listLabel = "리스트",
}: {
  mode: "input" | "list";
  onChange: (mode: "input" | "list") => void;
  inputLabel?: string;
  listLabel?: string;
}) {
  return (
    <div className="flex gap-2">
      <Button type="button" size="sm" variant={mode === "input" ? "default" : "outline"} onClick={() => onChange("input")}>
        {inputLabel}
      </Button>
      <Button type="button" size="sm" variant={mode === "list" ? "default" : "outline"} onClick={() => onChange("list")}>
        {listLabel}
      </Button>
    </div>
  );
}

export function DateSpan({
  from,
  to,
  onFrom,
  onTo,
}: {
  from: string;
  to: string;
  onFrom: (value: string) => void;
  onTo: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="space-y-1 text-xs text-muted-foreground">
        시작
        <Input className="h-8 w-36 text-xs" type="date" value={from} onChange={(event) => onFrom(event.target.value)} />
      </label>
      <label className="space-y-1 text-xs text-muted-foreground">
        끝
        <Input className="h-8 w-36 text-xs" type="date" value={to} onChange={(event) => onTo(event.target.value)} />
      </label>
    </div>
  );
}

export function inDateRange(iso: string, from: string, to: string) {
  if (from && iso < from) return false;
  if (to && iso > to) return false;
  return true;
}
