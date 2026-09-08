"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "./I18nProvider";
import { MemorialMyLink } from "./MemorialMyLink";
import { ChatIcon, MemorialIcon, SearchIcon } from "./icons";

type Props = {
  loggedIn: boolean;
};

export function SideCta({ loggedIn }: Props) {
  const { t } = useI18n();
  const [memorialOpen, setMemorialOpen] = useState(false);
  const [diffOpen, setDiffOpen] = useState(false);
  const memorialRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!memorialOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (memorialRef.current && !memorialRef.current.contains(e.target as Node)) {
        setMemorialOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [memorialOpen]);

  useEffect(() => {
    if (!diffOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDiffOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [diffOpen]);

  return (
    <>
      <div className="side-cta">
        <Link href="/consult?source=side-cta" className="side-cta-btn primary">
          <ChatIcon />
          <span>{t("cta.consult")}</span>
        </Link>

        {loggedIn && (
          <>
            <Link href="/grave-search" className="side-cta-btn">
              <SearchIcon />
              <span>{t("cta.search")}</span>
            </Link>

            <div className="side-cta-memorial" ref={memorialRef}>
              <button
                type="button"
                className={`side-cta-btn memorial${memorialOpen ? " open" : ""}`}
                aria-expanded={memorialOpen}
                aria-haspopup="true"
                onClick={() => setMemorialOpen((v) => !v)}
              >
                <MemorialIcon />
                <span>{t("cta.memorial")}</span>
              </button>

              {memorialOpen && (
                <div className="side-cta-submenu" role="menu">
                  <MemorialMyLink
                    loggedIn={loggedIn}
                    className="side-cta-submenu-item"
                    onNavigate={() => setMemorialOpen(false)}
                  >
                    {t("cta.myHall")}
                  </MemorialMyLink>
                  <Link href="/memorial/guide" className="side-cta-submenu-item" role="menuitem" onClick={() => setMemorialOpen(false)}>
                    {t("cta.memorialGuide")}
                  </Link>
                  <Link href="/memorial/plans" className="side-cta-submenu-item" role="menuitem" onClick={() => setMemorialOpen(false)}>
                    {t("cta.memorialPlans")}
                  </Link>
                  <button
                    type="button"
                    className="side-cta-submenu-item"
                    role="menuitem"
                    onClick={() => {
                      setMemorialOpen(false);
                      setDiffOpen(true);
                    }}
                  >
                    {t("cta.diff")}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {diffOpen && (
        <div className="modal-backdrop" onClick={() => setDiffOpen(false)}>
          <div className="modal side-cta-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{t("cta.diff")}</h2>
            <dl className="memorial-diff-dl">
              <div>
                <dt>{t("diff.agency")}</dt>
                <dd>{t("diff.agencyText")}</dd>
              </div>
              <div>
                <dt>{t("diff.hall")}</dt>
                <dd>{t("diff.hallText")}</dd>
              </div>
              <div>
                <dt>{t("diff.link")}</dt>
                <dd>{t("diff.linkText")}</dd>
              </div>
            </dl>
            <div className="memorial-modal-actions">
              <Link href="/services/memorial" className="btn btn-sm">
                {t("cta.agencyGuide")}
              </Link>
              <Link href="/memorial/plans" className="btn btn-sm">
                {t("cta.memorialPlans")}
              </Link>
              <button type="button" className="btn btn-sm" onClick={() => setDiffOpen(false)}>
                {t("cta.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
