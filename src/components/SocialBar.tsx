import { SOCIAL_LINKS } from "../lib/social";
import { FacebookIcon, InstagramIcon, NaverCafeIcon, YoutubeIcon } from "./icons";

type Props = {
  light?: boolean;
};

export function SocialBar({ light = false }: Props) {
  return (
    <div className={`sns-bar ${light ? "light" : ""}`}>
      <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" aria-label="페이스북">
        <FacebookIcon />
      </a>
      <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="인스타그램">
        <InstagramIcon />
      </a>
      <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" aria-label="유튜브">
        <YoutubeIcon />
      </a>
      <a href={SOCIAL_LINKS.naverCafe} target="_blank" rel="noopener noreferrer" aria-label="네이버카페">
        <NaverCafeIcon />
      </a>
    </div>
  );
}
