import Link from "next/link";
import { SocialBar } from "./SocialBar";

export function CompactFooter({ light = false }: { light?: boolean }) {
  return (
    <footer className={`compact-footer ${light ? "light" : ""}`}>
      <SocialBar light={light} />
      <p className="compact-footer-info">
        경기도 의왕시 청계동 산 8-5 일원 · 관리사무실 031-421-9165
      </p>
      <p className="compact-footer-home">
        <Link href="/">홈으로</Link>
      </p>
    </footer>
  );
}
