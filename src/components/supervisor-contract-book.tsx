"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { emptyContractBook, contractListHref, type ContractBook, type ContractHit, type ContractListFilters } from "@/lib/contract-book";

const TABS = ["묘지계약서", "사용자관리", "연고자관리", "관리비청구", "묘지위치", "상담관리", "석물관리"] as const;
const TOMB_TYPES = ["묘태석", "상석", "비석", "화병", "향로", "판석", "기타"];

const box = "h-6 w-full border border-[#b7c6d6] bg-white px-1 text-xs text-slate-900";

function Box({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <input value={value} onChange={(event) => onChange(event.target.value)} className={box} />;
}

function bind(book: ContractBook, patch: (partial: Partial<ContractBook>) => void, key: keyof ContractBook) {
  return {
    value: typeof book[key] === "string" ? book[key] : "",
    onChange: (value: string) => patch({ [key]: value }),
  };
}

function Label({ children }: { children: string }) {
  return <div className="flex items-center bg-[#e8f2fb] px-1 text-[11px] text-slate-700">{children}</div>;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border border-[#9db7d0]">
      <h2 className="border-b border-[#9db7d0] bg-[#d7ebfb] px-2 py-1 text-xs font-semibold text-slate-800">{title}</h2>
      <div className="p-2">{children}</div>
    </section>
  );
}

function SheetTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto border border-[#9db7d0]">
      <table className="w-full min-w-[48rem] border-collapse text-xs">
        <thead className="bg-[#e8f2fb]">
          <tr>
            {headers.map((header) => (
              <th key={header} className="border border-[#c5d4e4] px-1 py-1 text-left font-medium text-slate-700">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr key={index} className="odd:bg-white even:bg-slate-50">
                {headers.map((header, cell) => (
                  <td key={header} className="border border-[#d5e0ea] px-1 py-0.5">
                    {row[cell] ?? ""}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="border border-[#d5e0ea] px-1 py-4 text-center text-slate-400">
                목록 없음
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ContractForm({ book, patch }: { book: ContractBook; patch: (partial: Partial<ContractBook>) => void }) {
  const field = (key: keyof ContractBook) => bind(book, patch, key);
  return (
    <Section title="계약정보">
      <div className="grid grid-cols-[5.5rem_minmax(0,1.4fr)_5.5rem_minmax(0,1fr)] gap-1">
        <Label>계약번호</Label>
        <div className="col-span-3">
          <Box {...field("contractNo")} />
        </div>
        <Label>위치</Label>
        <div className="col-span-3">
          <Box {...field("location")} />
        </div>
        <Label>묘지형태</Label>
        <div className="col-span-3 flex flex-wrap items-center gap-x-3 gap-y-1 bg-white px-1 text-xs">
          {TOMB_TYPES.map((item) => (
            <label key={item} className="inline-flex items-center gap-1">
              <input
                type="checkbox"
                checked={book.tombTypes.includes(item)}
                onChange={(event) =>
                  patch({
                    tombTypes: event.target.checked
                      ? [...book.tombTypes, item]
                      : book.tombTypes.filter((type) => type !== item),
                  })
                }
              />
              {item}
            </label>
          ))}
        </div>
        <Label>묘지번호</Label>
        <Box {...field("tombNo")} />
        <Label>평수</Label>
        <div className="flex items-center gap-1">
          <Box {...field("pyeong")} />
          <span className="shrink-0 text-[11px] text-slate-500">㎡</span>
          <Box {...field("areaM2")} />
        </div>
        <Label>비고</Label>
        <div className="col-span-3">
          <Box {...field("areaNote")} />
        </div>
        <Label>합계</Label>
        <Box {...field("total")} />
        <Label>계약금</Label>
        <Box {...field("deposit")} />
        <Label>계약일자</Label>
        <Box {...field("contractDate")} />
        <Label>잔금</Label>
        <Box {...field("balancePay")} />
        <Label>잔금일자</Label>
        <Box {...field("balanceDate")} />
        <Label>묘지사용료</Label>
        <div className="col-span-3">
          <Box {...field("useFee")} />
        </div>
        <Label>매장방법</Label>
        <Box {...field("burialMethod")} />
        <Label>매장종류</Label>
        <Box {...field("burialKind")} />
        <Label>설묘구분</Label>
        <Box {...field("graveSetup")} />
        <Label>추가매장</Label>
        <Box {...field("extraBurial")} />
        <Label>이장구분</Label>
        <Box {...field("moveKind")} />
        <Label>이장일자</Label>
        <Box {...field("moveDate")} />
        <Label>청구단위</Label>
        <Box {...field("billUnit")} />
        <Label>관리구분</Label>
        <Box {...field("manageKind")} />
        <Label>계약자명</Label>
        <Box {...field("contractorName")} />
        <Label>주민번호</Label>
        <Box {...field("contractorIdNo")} />
        <Label>연락처</Label>
        <div className="col-span-3">
          <Box {...field("phone")} />
        </div>
        <Label>주소</Label>
        <div className="col-span-3 flex gap-1">
          <input value={book.zip} onChange={(event) => patch({ zip: event.target.value })} className={`${box} w-20 shrink-0`} />
          <Box {...field("address")} />
        </div>
        <Label>상세주소</Label>
        <div className="col-span-3">
          <Box {...field("addressDetail")} />
        </div>
        <Label>비고</Label>
        <div className="col-span-3">
          <textarea value={book.note} onChange={(event) => patch({ note: event.target.value })} rows={3} className="w-full border border-[#b7c6d6] px-1 py-0.5 text-xs" />
        </div>
      </div>
    </Section>
  );
}

function UserForm({ book, patch }: { book: ContractBook; patch: (partial: Partial<ContractBook>) => void }) {
  const field = (key: keyof ContractBook) => bind(book, patch, key);
  return (
    <Section title="사용자 정보">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_8rem]">
        <div className="grid grid-cols-[5.5rem_minmax(0,1fr)_5.5rem_minmax(0,1fr)] gap-1">
          <Label>사용자명</Label>
          <Box {...field("userName")} />
          <Label>주민번호</Label>
          <Box {...field("userIdNo")} />
          <Label>성별</Label>
          <Box {...field("gender")} />
          <Label>사망일자</Label>
          <Box {...field("deathDate")} />
          <Label>사망장소</Label>
          <Box {...field("deathPlace")} />
          <Label>사인</Label>
          <Box {...field("deathCause")} />
          <Label>매장일자</Label>
          <div className="col-span-3">
            <Box {...field("burialDate")} />
          </div>
        </div>
        <div className="flex h-28 items-center justify-center border border-dashed border-[#b7c6d6] bg-white text-[11px] text-slate-400">
          사용자사진
        </div>
      </div>
    </Section>
  );
}

function FamilyForm({ book, patch }: { book: ContractBook; patch: (partial: Partial<ContractBook>) => void }) {
  const field = (key: keyof ContractBook) => bind(book, patch, key);
  return (
    <Section title="연고자 정보">
      <div className="grid grid-cols-[5.5rem_minmax(0,1fr)_5.5rem_minmax(0,1fr)_4rem_6rem] gap-1">
        <Label>연고자명</Label>
        <Box {...field("familyName")} />
        <Label>주민번호</Label>
        <Box {...field("familyIdNo")} />
        <Label>성별</Label>
        <Box {...field("familyGender")} />
        <Label>주소</Label>
        <div className="col-span-5 flex gap-1">
          <input value={book.familyZip} onChange={(event) => patch({ familyZip: event.target.value })} className={`${box} w-20 shrink-0`} />
          <Box {...field("familyAddress")} />
        </div>
        <Label>상세주소</Label>
        <div className="col-span-5">
          <Box {...field("familyAddressDetail")} />
        </div>
        <Label>관계</Label>
        <Box {...field("relation")} />
        <Label>핸드폰</Label>
        <Box {...field("familyMobile")} />
        <Label>자택</Label>
        <Box {...field("familyPhone")} />
      </div>
    </Section>
  );
}

export function SupervisorContractBook({
  filters,
  page,
  pageSize,
  total,
  matched,
  hits,
  book,
}: {
  filters: ContractListFilters;
  page: number;
  pageSize: number;
  total: number;
  matched: number;
  hits: ContractHit[];
  book: ContractBook | null;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]>("묘지계약서");
  const [kept, setKept] = useState("");
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<ContractBook | null>(book);
  useEffect(() => {
    setCreating(false);
    setDraft(book);
  }, [book]);
  const current = creating ? draft : draft ?? book;
  const patch = (partial: Partial<ContractBook>) => {
    setDraft((prev) => ({ ...(prev ?? emptyContractBook()), ...partial }));
  };

  async function save() {
    if (!current) {
      setKept("저장할 계약을 여세요.");
      return;
    }
    setBusy(true);
    setKept("");
    const response = await fetch("/api/supervisor/contracts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "save",
        previous: creating || !book ? null : { tombNo: book.tombNo, contractNo: book.contractNo },
        book: current,
      }),
    });
    const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string; tombNo?: string; contractNo?: string } | null;
    setBusy(false);
    if (!data?.ok || !data.tombNo) {
      setKept(data?.error || "저장하지 못했습니다.");
      return;
    }
    setKept("저장했습니다.");
    setCreating(false);
    const id = `${data.tombNo}::${data.contractNo ?? ""}`;
    router.push(contractListHref({ tomb: data.tombNo, user: "", family: "", phone: "", kind: "all", id }));
    router.refresh();
  }

  async function remove() {
    if (creating || !book?.tombNo) {
      setKept("삭제할 계약을 여세요.");
      return;
    }
    if (!window.confirm(`${book.tombNo} ${book.contractNo} 계약을 삭제할까요?`)) return;
    setBusy(true);
    const response = await fetch("/api/supervisor/contracts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "delete", previous: { tombNo: book.tombNo, contractNo: book.contractNo } }),
    });
    const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    setBusy(false);
    if (!data?.ok) {
      setKept(data?.error || "삭제하지 못했습니다.");
      return;
    }
    setKept("삭제했습니다.");
    router.push("/supervisor/contracts");
    router.refresh();
  }

  const pages = Math.max(1, Math.ceil(matched / pageSize));
  const from = matched === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(matched, page * pageSize);
  const prevHref = contractListHref({ ...filters, page: page - 1, id: book?.key });
  const nextHref = contractListHref({ ...filters, page: page + 1, id: book?.key });

  return (
    <div className="space-y-3 text-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-[#9db7d0] bg-[#f4f8fc] px-2 py-2">
        <form action="/supervisor/contracts" className="flex flex-wrap items-end gap-2">
          <label className="text-[11px] text-slate-600">
            묘지번호
            <input name="tomb" defaultValue={filters.tomb} className="mt-0.5 block h-7 w-28 border border-[#b7c6d6] bg-white px-2 text-xs" />
          </label>
          <label className="text-[11px] text-slate-600">
            사용자
            <input name="user" defaultValue={filters.user} className="mt-0.5 block h-7 w-28 border border-[#b7c6d6] bg-white px-2 text-xs" />
          </label>
          <label className="text-[11px] text-slate-600">
            연고자
            <input name="family" defaultValue={filters.family} className="mt-0.5 block h-7 w-28 border border-[#b7c6d6] bg-white px-2 text-xs" />
          </label>
          <label className="text-[11px] text-slate-600">
            전화번호
            <input name="phone" defaultValue={filters.phone} className="mt-0.5 block h-7 w-32 border border-[#b7c6d6] bg-white px-2 text-xs" />
          </label>
          <fieldset className="flex h-7 items-center gap-2 border border-[#b7c6d6] bg-white px-2 text-[11px]">
            <legend className="sr-only">조회조건</legend>
            {(
              [
                ["contract", "계약"],
                ["move", "이장"],
                ["all", "전체"],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className="inline-flex items-center gap-1">
                <input type="radio" name="kind" value={value} defaultChecked={filters.kind === value} />
                {label}
              </label>
            ))}
          </fieldset>
          <button type="submit" className="h-7 bg-[#6b7280] px-3 text-xs text-white">
            검색
          </button>
          <a href="/supervisor/contracts" className="inline-flex h-7 items-center bg-[#6b7280] px-3 text-xs text-white">
            새조건
          </a>
          <span className="px-1 text-[11px] text-slate-500">
            {matched.toLocaleString("ko-KR")} / {total.toLocaleString("ko-KR")}
          </span>
        </form>
        <div className="flex gap-1">
          <button type="button" disabled={busy} onClick={() => { setCreating(true); setDraft(emptyContractBook()); setKept(""); setTab("묘지계약서"); }} className="h-7 bg-[#f97316] px-3 text-xs text-white disabled:opacity-50">
            신규
          </button>
          <button type="button" disabled={busy} onClick={() => void save()} className="h-7 bg-[#f97316] px-3 text-xs text-white disabled:opacity-50">
            수정
          </button>
          <button type="button" disabled={busy} onClick={() => void remove()} className="h-7 bg-[#f97316] px-3 text-xs text-white disabled:opacity-50">
            삭제
          </button>
          <button type="button" onClick={() => window.print()} className="h-7 bg-[#f97316] px-3 text-xs text-white">
            출력
          </button>
        </div>
      </div>

      {kept ? <p className="text-xs text-slate-600">{kept}</p> : null}
      <div className="max-h-56 overflow-auto border border-[#9db7d0]">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 bg-[#d7ebfb]">
            <tr>
              {["묘지번호", "매장일자", "사용자", "연고자", "평수"].map((header) => (
                <th key={header} className="border border-[#c5d4e4] px-1 py-1 text-left font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hits.length ? (
              hits.map((hit) => {
                const open = current?.key === hit.key;
                const href = contractListHref({ ...filters, page, id: hit.key });
                return (
                  <tr key={hit.key} className={open ? "bg-[#fff4e5]" : "odd:bg-white"}>
                    <td className="border border-[#e2e8f0] px-1 py-0.5">
                      <a href={href} className="text-[#1d4f91] underline-offset-2 hover:underline">
                        {hit.tombNo}
                      </a>
                    </td>
                    <td className="border border-[#e2e8f0] px-1 py-0.5">{hit.burialDate}</td>
                    <td className="border border-[#e2e8f0] px-1 py-0.5">{hit.userName}</td>
                    <td className="border border-[#e2e8f0] px-1 py-0.5">{hit.familyName}</td>
                    <td className="border border-[#e2e8f0] px-1 py-0.5">{hit.pyeong}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="border border-[#e2e8f0] px-1 py-4 text-center text-slate-400">
                  조건에 맞는 계약이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-slate-600">
        {page > 1 ? (
          <a href={prevHref} className="border border-[#b7c6d6] bg-white px-2 py-1">
            이전
          </a>
        ) : (
          <span className="border border-[#e2e8f0] px-2 py-1 text-slate-300">이전</span>
        )}
        <span>
          {from.toLocaleString("ko-KR")}-{to.toLocaleString("ko-KR")} / {matched.toLocaleString("ko-KR")} · {page} / {pages}
        </span>
        {page < pages ? (
          <a href={nextHref} className="border border-[#b7c6d6] bg-white px-2 py-1">
            다음
          </a>
        ) : (
          <span className="border border-[#e2e8f0] px-2 py-1 text-slate-300">다음</span>
        )}
      </div>

      <div className="flex flex-wrap border-b border-[#7aa2c4] bg-[#f7fbfe]">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={
              tab === item
                ? "border border-b-white border-[#7aa2c4] bg-white px-3 py-1.5 text-xs font-semibold text-[#1d4f91]"
                : "px-3 py-1.5 text-xs text-slate-600"
            }
          >
            {item}
          </button>
        ))}
      </div>

      {current ? (
        <div id="contract-sheet" className="space-y-3">
          {tab === "묘지계약서" ? (
            <>
              <ContractForm book={current} patch={patch} />
              <UserForm book={current} patch={patch} />
              <FamilyForm book={current} patch={patch} />
            </>
          ) : null}
          {tab === "사용자관리" ? (
            <>
              <UserForm book={current} patch={patch} />
              <SheetTable
                headers={["사용자명", "주민번호", "성별", "매장일자", "사망일자", "사망장소", "사인"]}
                rows={
                  current.users.length
                    ? current.users
                    : current.userName
                      ? [[current.userName, current.userIdNo, current.gender, current.burialDate, current.deathDate, current.deathPlace, current.deathCause]]
                      : []
                }
              />
            </>
          ) : null}
          {tab === "연고자관리" ? (
            <>
              <FamilyForm book={current} patch={patch} />
              <SheetTable
                headers={["연고자명", "주민번호", "성별", "관계", "주소", "핸드폰"]}
                rows={
                  current.families.length
                    ? current.families
                    : current.familyName
                      ? [[current.familyName, current.familyIdNo, current.familyGender, current.relation, current.familyAddress, current.familyMobile || current.phone]]
                      : []
                }
              />
            </>
          ) : null}
          {tab === "관리비청구" ? (
            <Section title="관리비 내역">
              <div className="mb-2 grid grid-cols-[5.5rem_minmax(0,1fr)_5.5rem_minmax(0,1fr)] gap-1">
                <Label>묘지번호</Label>
                <Box {...bind(current, patch, "tombNo")} />
                <Label>사용자명</Label>
                <Box {...bind(current, patch, "userName")} />
                <Label>연고자명</Label>
                <Box {...bind(current, patch, "familyName")} />
                <Label>매장일자</Label>
                <Box {...bind(current, patch, "burialDate")} />
              </div>
              <SheetTable
                headers={["회차", "이름", "청구일자", "계약기간", "청구금액", "납부금액", "잔액", "구분"]}
                rows={current.bills}
              />
              <h3 className="mb-1 mt-3 text-xs font-semibold">납부 내역</h3>
              <SheetTable headers={["회차", "납부일자", "이름", "납부금액", "입금방법", "담당자"]} rows={current.payments} />
            </Section>
          ) : null}
          {tab === "묘지위치" ? (
            <Section title="묘지 정보">
              <div className="grid grid-cols-[5.5rem_minmax(0,1fr)_5.5rem_minmax(0,1fr)] gap-1">
                <Label>묘지번호</Label>
                <Box {...bind(current, patch, "tombNo")} />
                <Label>위치</Label>
                <Box {...bind(current, patch, "location")} />
                <Label>위도</Label>
                <Box {...bind(current, patch, "latitude")} />
                <Label>경도</Label>
                <Box {...bind(current, patch, "longitude")} />
              </div>
            </Section>
          ) : null}
          {tab === "상담관리" ? (
            <Section title="상담관리">
              <div className="mb-2 grid grid-cols-[5.5rem_minmax(0,1fr)_5.5rem_minmax(0,1fr)] gap-1">
                <Label>묘지번호</Label>
                <Box {...bind(current, patch, "tombNo")} />
                <Label>사용자명</Label>
                <Box {...bind(current, patch, "userName")} />
              </div>
              <SheetTable headers={["상담일자", "상담자", "담당자", "구분", "내용"]} rows={current.consults} />
            </Section>
          ) : null}
          {tab === "석물관리" ? (
            <Section title="석물 정보">
              <SheetTable headers={["석물코드", "석물명", "규격", "단위", "단가", "수량"]} rows={current.stones} />
            </Section>
          ) : null}
        </div>
      ) : (
        <p className="border border-[#9db7d0] bg-white px-3 py-8 text-center text-sm text-slate-500">
          목록에서 묘지번호를 누르면 계약서가 열립니다.
        </p>
      )}
    </div>
  );
}
