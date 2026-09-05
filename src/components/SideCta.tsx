"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MEMORIAL_VS_AGENCY } from "../lib/memorial-info";
import { ChatIcon, MemorialIcon, SearchIcon } from "./icons";

type Props = {
  loggedIn: boolean;
};

export function SideCta({ loggedIn }: Props) {
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
        <Link href="/consult" className="side-cta-btn primary">
          <ChatIcon />
          <span>상담신청</span>
        </Link>

        {loggedIn && (
          <>
            <Link href="/grave-search" className="side-cta-btn">
              <SearchIcon />
              <span>묘역찾기</span>
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
                <span>사이버 추모관</span>
              </button>

              {memorialOpen && (
                <div className="side-cta-submenu" role="menu">
                  <Link href="/memorial/my" className="side-cta-submenu-item" role="menuitem" onClick={() => setMemorialOpen(false)}>
                    내 추모관 보기
                  </Link>
                  <Link href="/memorial/guide" className="side-cta-submenu-item" role="menuitem" onClick={() => setMemorialOpen(false)}>
                    추모관 이용 방법
                  </Link>
                  <Link href="/memorial/plans" className="side-cta-submenu-item" role="menuitem" onClick={() => setMemorialOpen(false)}>
                    요금·플랜
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
                    추모 대행과의 차이
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
            <h2>추모 대행과의 차이</h2>
            <dl className="memorial-diff-dl">
              {MEMORIAL_VS_AGENCY.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.text}</dd>
                </div>
              ))}
            </dl>
            <div className="memorial-modal-actions">
              <Link href="/services/memorial" className="btn btn-sm">
                추모 대행 안내
              </Link>
              <Link href="/memorial/plans" className="btn btn-sm">
                요금·플랜
              </Link>
              <button type="button" className="btn btn-sm" onClick={() => setDiffOpen(false)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
