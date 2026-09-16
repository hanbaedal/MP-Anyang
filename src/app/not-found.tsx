import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-serif text-3xl">페이지를 찾을 수 없습니다</h1>
      <p className="mt-3 text-muted-foreground">메뉴의 공원소개, 분양, 이용안내, 둘러보기, 고객센터에서 다시 찾아 주세요.</p>
      <Button asChild className="mt-6">
        <Link href="/">홈으로</Link>
      </Button>
    </div>
  );
}
