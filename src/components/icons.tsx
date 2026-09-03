export function LogoMark() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="logo-mark">
      <circle cx="32" cy="32" r="30" fill="#f4efe6" stroke="#5f7059" strokeWidth="2" />
      <path d="M18 38c5-8 10-12 14-12s9 4 14 12" fill="none" stroke="#5f7059" strokeWidth="2.5" />
      <path d="M26 23c2-4 4-6 6-6s4 2 6 6" fill="none" stroke="#a48b62" strokeWidth="2" />
      <circle cx="32" cy="21" r="2.5" fill="#a48b62" />
    </svg>
  );
}

export function Chevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className={`chevron ${open ? "open" : ""}`} aria-hidden="true">
      <path d="M5 3.5 10 8l-5 4.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M4 5.5h16v10H8l-4 3v-13Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="m15.5 15.5 4.8 4.8" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

export function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/>
    </svg>
  );
}

export function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M22.54 6.42A2.78 2.78 0 0 0 20.6 4.5C18.88 4 12 4 12 4s-6.88 0-8.6.5A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.5C5.12 20 12 20 12 20s6.88 0 8.6-.5a2.78 2.78 0 0 0 1.94-1.92A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <polygon points="9.75,8.27 15.5,12 9.75,15.73" fill="currentColor"/>
    </svg>
  );
}

export function NaverCafeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <text x="12" y="16.5" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor" fontFamily="sans-serif">N</text>
    </svg>
  );
}

export function VolumeIcon({ muted }: { muted: boolean }) {
  return muted ? (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M4 10h4l5-4v12l-5-4H4z" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="m16 9 5 6m0-6-5 6" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M4 10h4l5-4v12l-5-4H4z" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M16 9a4 4 0 0 1 0 6m2.5-8.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M3 3l18 18" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-4.4M9.9 5.1A10.6 10.6 0 0 1 12 6c6.5 0 10 6 10 6a18.8 18.8 0 0 1-4.1 4.7" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M6.7 6.7C4.1 8.4 2 12 2 12s3.5 6 10 6a10.2 10.2 0 0 0 4.9-1.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
