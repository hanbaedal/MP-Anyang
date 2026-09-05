"use client";

import { useEffect, useMemo, useState } from "react";
import { GRAVE_LOT_TYPES } from "../../../lib/fee-rates";
import { GRAVE_TYPE_SPECS, type GraveTypeKey } from "../../../lib/plot-specs";

type Props = {
  lotDefault: string;
  sourceValue: string;
};

const NON_GRAVE_TYPES = ["상조", "리모델링", "추모 대행"] as const;

export function ConsultFormClient({ lotDefault, sourceValue }: Props) {
  const [lotType, setLotType] = useState(lotDefault);
  const [capacity, setCapacity] = useState("");
  const [annualFee, setAnnualFee] = useState<number | null>(null);
  const [salePrice, setSalePrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const isGraveType = GRAVE_LOT_TYPES.includes(lotType as (typeof GRAVE_LOT_TYPES)[number]);

  const variants = useMemo(() => {
    if (!isGraveType) return [];
    return GRAVE_TYPE_SPECS[lotType as GraveTypeKey]?.variants ?? [];
  }, [lotType, isGraveType]);

  const loadEstimate = async (type: string, cap: string) => {
    if (!GRAVE_LOT_TYPES.includes(type as (typeof GRAVE_LOT_TYPES)[number]) || !cap) {
      setAnnualFee(null);
      setSalePrice(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/fee-estimate?type=${encodeURIComponent(type)}&capacity=${encodeURIComponent(cap)}`,
      );
      const data = await res.json();
      if (data.graveType) {
        setAnnualFee(Number(data.annualFee) || 0);
        setSalePrice(Number(data.salePrice) || 0);
      }
    } catch {
      setAnnualFee(null);
      setSalePrice(null);
    } finally {
      setLoading(false);
    }
  };

  const onLotTypeChange = (value: string) => {
    setLotType(value);
    const grave = GRAVE_LOT_TYPES.includes(value as (typeof GRAVE_LOT_TYPES)[number]);
    if (!grave) {
      setCapacity("");
      setAnnualFee(null);
      setSalePrice(null);
      return;
    }
    const first = GRAVE_TYPE_SPECS[value as GraveTypeKey]?.variants[0] ?? "";
    setCapacity(first);
    if (first) void loadEstimate(value, first);
  };

  const onCapacityChange = (value: string) => {
    setCapacity(value);
    void loadEstimate(lotType, value);
  };

  useEffect(() => {
    if (GRAVE_LOT_TYPES.includes(lotDefault as (typeof GRAVE_LOT_TYPES)[number])) {
      const first = GRAVE_TYPE_SPECS[lotDefault as GraveTypeKey]?.variants[0] ?? "";
      setCapacity(first);
      if (first) void loadEstimate(lotDefault, first);
    }
  }, [lotDefault]);

  return (
    <form action="/api/consult" method="POST" className="panel form-grid consult-form">
      <input type="hidden" name="source" value={sourceValue} />
      <input type="hidden" name="estimatedAnnualFee" value={annualFee ?? ""} />
      <input type="hidden" name="estimatedSalePrice" value={salePrice ?? ""} />
      <input type="hidden" name="lotCapacity" value={capacity} />

      <label>
        신청자 이름
        <input name="name" required />
      </label>
      <label>
        연락처
        <input name="phone" required placeholder="01012345678" />
      </label>
      <label>
        상담 유형
        <select name="lotType" value={lotType} onChange={(e) => onLotTypeChange(e.target.value)}>
          {GRAVE_LOT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
          {NON_GRAVE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      {isGraveType && (
        <label>
          기수·규모
          <select name="lotCapacityDisplay" value={capacity} onChange={(e) => onCapacityChange(e.target.value)} required>
            {variants.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
      )}

      {isGraveType && (annualFee !== null || loading) && (
        <div className="consult-fee-estimate panel">
          <p className="consult-fee-estimate-title">참고 요금 (임시)</p>
          {loading ? (
            <p className="meta">요금표 조회 중…</p>
          ) : (
            <ul className="consult-fee-estimate-list">
              <li>
                <span>분양가</span>
                <strong>{(salePrice ?? 0).toLocaleString()}원</strong>
              </li>
              <li>
                <span>연간 관리비</span>
                <strong>{(annualFee ?? 0).toLocaleString()}원</strong>
              </li>
            </ul>
          )}
          <p className="meta">정확한 금액은 상담 후 확정됩니다. 접수 시 참고용으로 함께 저장됩니다.</p>
        </div>
      )}

      <label className="consult-message-field">
        문의 내용
        <textarea name="message" required rows={5} />
      </label>
      <button className="btn btn-primary" type="submit">
        상담 접수
      </button>
    </form>
  );
}
