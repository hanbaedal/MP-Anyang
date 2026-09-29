"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const GROUP_PARK = {
  name: "운경공원",
  href: "https://xn--289a5dt73fjd.com/main#",
};

const GROUP_FUNERALS = [
  { name: "인천근로복지공단장례식장", href: "https://www.comwel.or.kr/incheon/index.jsp" },
  { name: "인천적십자병원장례식장", href: "http://www.rchfuneral.co.kr/" },
  { name: "힘찬병원장례식장", href: "https://xn--9n2bn7fz6frpep4aca122fluy.com/" },
] as const;

const linkClass = "underline-offset-4 hover:underline";

export function FooterGroupLinks() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <a className={linkClass} href={GROUP_PARK.href} target="_blank" rel="noopener noreferrer">
        {GROUP_PARK.name}
      </a>
      <button type="button" className={linkClass} onClick={() => setOpen(true)}>
        장례식장
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>장례식장</DialogTitle>
            <DialogDescription>같은 그룹에서 운영하는 장례식장입니다. 선택하면 새 페이지로 이동합니다.</DialogDescription>
          </DialogHeader>
          <ul className="flex flex-col gap-2">
            {GROUP_FUNERALS.map((hall) => (
              <li key={hall.name}>
                <a
                  className="block rounded-md border px-3 py-2 text-sm text-foreground hover:bg-muted"
                  href={hall.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {hall.name}
                </a>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  );
}
