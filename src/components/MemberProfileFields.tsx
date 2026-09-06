"use client";

import { useCallback, useEffect, useState } from "react";
import type { MemberProfileInitial } from "../lib/member-profile";

function resizeRows(values: string[], count: number) {
  const next = [...values];
  while (next.length < count) next.push("");
  return next.slice(0, count);
}

type Props = {
  initial: MemberProfileInitial;
  /** 수정 모드: 요금은 조회만 */
  feesReadOnly?: boolean;
  /** 본인인증 완료 시 이름·전화 수정 불가 */
  identityLocked?: boolean;
};

export function MemberProfileFields({ initial, feesReadOnly = false, identityLocked = false }: Props) {
  const [plotNo, setPlotNo] = useState(initial.plotNo);
  const [annualFee, setAnnualFee] = useState(initial.annualFee);
  const [salePrice, setSalePrice] = useState(initial.salePrice);
  const [feeAuto, setFeeAuto] = useState(feesReadOnly && initial.annualFee > 0);
  const [rowCount, setRowCount] = useState(Math.max(initial.relations.length, 1));
  const [plotHint, setPlotHint] = useState("");
  const [plotStatus, setPlotStatus] = useState<"idle" | "loading" | "ok" | "miss">("idle");
  const [deceasedNames, setDeceasedNames] = useState<string[]>(() =>
    resizeRows(
      initial.relations.map((r) => r.deceasedName),
      Math.max(initial.relations.length, 1),
    ),
  );
  const [relations, setRelations] = useState<string[]>(() =>
    resizeRows(
      initial.relations.map((r) => r.relation),
      Math.max(initial.relations.length, 1),
    ),
  );
  const [relPlotNos, setRelPlotNos] = useState<string[]>(() =>
    resizeRows(
      initial.relations.map((r) => r.plotNo),
      Math.max(initial.relations.length, 1),
    ),
  );

  const applyPlotLookup = useCallback(
    async (value: string, preserveExisting: boolean) => {
      const key = value.trim();
      if (!key) {
        setPlotHint("");
        setPlotStatus("idle");
        if (!feesReadOnly) setFeeAuto(false);
        return;
      }

      setPlotStatus("loading");
      try {
        const res = await fetch(`/api/plot-lookup?plotNo=${encodeURIComponent(key)}`);
        const data = await res.json();
        if (!data.found) {
          setPlotStatus("miss");
          setPlotHint("등록된 묘역번호가 없습니다. 상담 후 정확한 번호를 입력해 주세요.");
          const count = preserveExisting ? Math.max(rowCount, 4) : 4;
          setRowCount(count);
          if (!preserveExisting) {
            setDeceasedNames((prev) => resizeRows(prev, count));
            setRelations((prev) => resizeRows(prev, count));
            setRelPlotNos((prev) => resizeRows(prev, count).map((_, i) => (i === 0 ? key : prev[i] || "")));
          }
          return;
        }

        const slots = Number(data.slots) || 2;
        setPlotStatus("ok");
        setPlotHint(`${data.type}${data.capacity ? ` · ${data.capacity}` : ""} — 망자 ${slots}명 (${data.hint || ""})`);
        if (data.annualFee) {
          setAnnualFee(Number(data.annualFee));
          setSalePrice(Number(data.salePrice) || 0);
          setFeeAuto(true);
        }
        setRowCount(slots);
        if (!preserveExisting) {
          setDeceasedNames((prev) => resizeRows(prev, slots));
          setRelations((prev) => resizeRows(prev, slots));
          setRelPlotNos(Array(slots).fill(key));
        } else {
          setDeceasedNames((prev) => resizeRows(prev, slots));
          setRelations((prev) => resizeRows(prev, slots));
          setRelPlotNos((prev) => {
            const next = resizeRows(prev, slots);
            return next.map((v, i) => v || key);
          });
        }
      } catch {
        setPlotStatus("miss");
        setPlotHint("묘역 정보를 불러오지 못했습니다.");
      }
    },
    [feesReadOnly, rowCount],
  );

  useEffect(() => {
    if (initial.plotNo.trim()) {
      void applyPlotLookup(initial.plotNo, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 초기 묘역 1회만
  }, []);

  const feesLocked = feesReadOnly || feeAuto;

  return (
    <>
      <h2 className="signup-section-title">기본 정보</h2>
      <div className="signup-grid-basic">
        <label>
          회원 이름
          <input name="name" defaultValue={initial.name} required readOnly={identityLocked} />
        </label>
        <label>
          전화번호
          <input
            name="phone"
            defaultValue={initial.phone}
            required
            placeholder="01012345678"
            readOnly={identityLocked}
          />
        </label>
        <label>
          이메일
          <input name="email" type="email" defaultValue={initial.email} />
        </label>
        <label>
          주소
          <input name="address" defaultValue={initial.address} placeholder="우편물 수신" />
        </label>
        <label>
          비상 연락처
          <input name="emergencyPhone" defaultValue={initial.emergencyPhone} placeholder="010..." />
        </label>
        <label>
          차량번호
          <input name="carNumber" defaultValue={initial.carNumber} />
        </label>
        <label>
          계약번호
          <input name="contractNo" defaultValue={initial.contractNo} />
        </label>
        <label className="signup-plot-field">
          대표 묘역번호
          <input
            name="plotNo"
            required
            placeholder="예: A-101"
            value={plotNo}
            onChange={(e) => {
              setPlotNo(e.target.value);
              if (!feesReadOnly) setFeeAuto(false);
            }}
            onBlur={() => void applyPlotLookup(plotNo, deceasedNames.some((v) => v.trim().length > 0))}
          />
        </label>
        <label>
          등록시기
          <input name="registeredAt" type="date" defaultValue={initial.registeredAt} />
        </label>
        <label>
          분양가(원)
          <input
            name="salePrice"
            type="number"
            min="0"
            value={salePrice}
            readOnly={feesLocked}
            onChange={(e) => setSalePrice(Number(e.target.value))}
          />
        </label>
        <label>
          연간 관리비(원)
          <input
            name="annualFee"
            type="number"
            min="0"
            value={annualFee}
            readOnly={feesLocked}
            onChange={(e) => setAnnualFee(Number(e.target.value))}
          />
        </label>
        {feeAuto && (annualFee > 0 || salePrice > 0) ? (
          <p className="meta signup-fee-hint ok">
            요금표 기준 — 분양 {salePrice.toLocaleString()}원 · 연관리 {annualFee.toLocaleString()}원
          </p>
        ) : null}
      </div>

      <h2 className="signup-section-title">관계 / 망자</h2>
      {plotHint ? (
        <p className={`meta signup-plot-hint ${plotStatus === "ok" ? "ok" : plotStatus === "miss" ? "alert-inline" : ""}`}>
          {plotStatus === "loading" ? "묘역 정보 확인 중…" : plotHint}
        </p>
      ) : null}

      <div className="signup-relations table-wrap">
        <table className="data-table signup-relation-table">
          <thead>
            <tr>
              <th>망자</th>
              <th>관계</th>
              <th>묘역번호</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }).map((_, i) => (
              <tr key={i}>
                <td>
                  <input
                    name="deceasedName"
                    placeholder="성함"
                    value={deceasedNames[i] || ""}
                    onChange={(e) =>
                      setDeceasedNames((prev) => {
                        const next = [...prev];
                        next[i] = e.target.value;
                        return next;
                      })
                    }
                  />
                </td>
                <td>
                  <input
                    name="relation"
                    placeholder="부·모·배우자"
                    value={relations[i] || ""}
                    onChange={(e) =>
                      setRelations((prev) => {
                        const next = [...prev];
                        next[i] = e.target.value;
                        return next;
                      })
                    }
                  />
                </td>
                <td>
                  <input
                    name="relPlotNo"
                    placeholder="A-101"
                    value={relPlotNos[i] || ""}
                    onChange={(e) =>
                      setRelPlotNos((prev) => {
                        const next = [...prev];
                        next[i] = e.target.value;
                        return next;
                      })
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="signup-section-title">SMS 수신</h2>
      <div className="consent-box consent-box-compact">
        <label className="consent-label">
          <input name="smsConsent" type="checkbox" defaultChecked={initial.smsConsent} />
          <span>[선택] SMS 서비스 알림 (관리비·기일·공지)</span>
        </label>
        <label className="consent-label">
          <input name="marketingSmsConsent" type="checkbox" defaultChecked={initial.marketingSmsConsent} />
          <span>[선택] 마케팅·홍보 SMS</span>
        </label>
      </div>
    </>
  );
}
