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
