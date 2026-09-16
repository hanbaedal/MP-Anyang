"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-serif text-3xl">잠시 페이지를 열지 못했습니다</h1>
      <p className="mt-3 text-muted-foreground">새로고침하거나 전화 031-482-2949로 문의해 주세요.</p>
      <Button className="mt-6" type="button" onClick={() => reset()}>
        다시 시도
      </Button>
    </div>
  );
}
