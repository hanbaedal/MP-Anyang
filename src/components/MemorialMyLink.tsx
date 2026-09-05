"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MEMORIAL_MY_HALL } from "../lib/memorial-demo";
import { LoginModal } from "./LoginModal";

type Props = {
  loggedIn: boolean;
  className?: string;
  children: React.ReactNode;
  onNavigate?: () => void;
};

export function MemorialMyLink({ loggedIn, className, children, onNavigate }: Props) {
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(false);
  const target = `/memorial/${MEMORIAL_MY_HALL}`;

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate?.();
    if (loggedIn) {
      router.push(target);
      return;
    }
    setLoginOpen(true);
  };

  return (
    <>
      <a href={target} className={className} onClick={onClick}>
        {children}
      </a>
      {loginOpen && <LoginModal next={target} onClose={() => setLoginOpen(false)} />}
    </>
  );
}
