import Link from "next/link";
import { FacebookIcon, InstagramIcon, NaverCafeIcon, YoutubeIcon } from "./icons";

export function CompactFooter({ light = false }: { light?: boolean }) {
  return (
    <footer className={`compact-footer ${light ? "light" : ""}`}>
      <div className={`sns-bar ${light ? "light" : ""}`}>
        <a href="#" aria-label="페이스북"><FacebookIcon /></a>
        <a href="#" aria-label="인스타그램"><InstagramIcon /></a>
        <a href="#" aria-label="유튜브"><YoutubeIcon /></a>
        <a href="#" aria-label="네이버카페"><NaverCafeIcon /></a>
      </div>
      <p className="compact-footer-info">
        경기도 의왕시 청계동 산 8-5 일원 · 관리사무실 031-421-9165
      </p>
      <p className="compact-footer-home">
        <Link href="/">홈으로</Link>
      </p>
    </footer>
  );
}
