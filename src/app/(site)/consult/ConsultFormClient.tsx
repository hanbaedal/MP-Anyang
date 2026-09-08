"use client";

import { useEffect, useMemo, useState } from "react";
import { GRAVE_LOT_TYPES } from "../../../lib/fee-rates";
import { lotTypeKey } from "../../../lib/i18n-messages";
import { GRAVE_TYPE_SPECS, type GraveTypeKey } from "../../../lib/plot-specs";
import { SITE } from "../../../lib/site";
import { useI18n } from "../../../components/I18nProvider";

type Props = {
  lotDefault: string;
  sourceValue: string;
};

const NON_GRAVE_TYPES = ["상조", "리모델링", "추모 대행"] as const;

export function ConsultFormClient({ lotDefault, sourceValue }: Props) {
  const { t } = useI18n();
  const [lotType, setLotType] = useState(lotDefault);
  const [capacity, setCapacity] = useState("");

  const isGraveType = GRAVE_LOT_TYPES.includes(lotType as (typeof GRAVE_LOT_TYPES)[number]);
  const salePrice = isGraveType ? SITE.prices.saleAmount : null;
  const annualFee = isGraveType ? SITE.prices.annualAmount : null;

  const variants = useMemo(() => {
    if (!isGraveType) return [];
    return GRAVE_TYPE_SPECS[lotType as GraveTypeKey]?.variants ?? [];
  }, [lotType, isGraveType]);

  const onLotTypeChange = (value: string) => {
    setLotType(value);
    const grave = GRAVE_LOT_TYPES.includes(value as (typeof GRAVE_LOT_TYPES)[number]);
    if (!grave) {
      setCapacity("");
      return;
    }
    setCapacity(GRAVE_TYPE_SPECS[value as GraveTypeKey]?.variants[0] ?? "");
  };

  useEffect(() => {
    if (GRAVE_LOT_TYPES.includes(lotDefault as (typeof GRAVE_LOT_TYPES)[number])) {
      setCapacity(GRAVE_TYPE_SPECS[lotDefault as GraveTypeKey]?.variants[0] ?? "");
    }
  }, [lotDefault]);

  return (
    <form action="/api/consult" method="POST" className="panel form-grid consult-form">
      <input type="hidden" name="source" value={sourceValue} />
      <input type="hidden" name="estimatedAnnualFee" value={annualFee ?? ""} />
      <input type="hidden" name="estimatedSalePrice" value={salePrice ?? ""} />
      <input type="hidden" name="lotCapacity" value={capacity} />

      <label>
        {t("consult.name")}
        <input name="name" required />
      </label>
      <label>
        {t("consult.phone")}
        <input name="phone" required placeholder="01012345678" />
      </label>
      <label>
        {t("consult.type")}
        <select name="lotType" value={lotType} onChange={(e) => onLotTypeChange(e.target.value)}>
          {GRAVE_LOT_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(lotTypeKey(type))}
            </option>
          ))}
          {NON_GRAVE_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(lotTypeKey(type))}
            </option>
          ))}
        </select>
      </label>

      {isGraveType && (
        <label>
          {t("consult.capacity")}
          <select name="lotCapacityDisplay" value={capacity} onChange={(e) => setCapacity(e.target.value)} required>
            {variants.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
      )}

      {isGraveType && salePrice !== null && annualFee !== null && (
        <div className="consult-fee-estimate panel">
          <p className="consult-fee-estimate-title">{t("consult.estimateTitle")}</p>
          <ul className="consult-fee-estimate-list">
            <li>
              <span>{t("consult.sale")}</span>
              <strong>{salePrice.toLocaleString()}원</strong>
            </li>
            <li>
              <span>{t("consult.annual")}</span>
              <strong>{annualFee.toLocaleString()}원</strong>
            </li>
          </ul>
          <p className="meta">{t("consult.estimateNote")}</p>
        </div>
      )}

      <label className="consult-message-field">
        {t("consult.message")}
        <textarea name="message" required rows={5} />
      </label>
      <button className="btn btn-primary" type="submit">
        {t("consult.submit")}
      </button>
    </form>
  );
}
