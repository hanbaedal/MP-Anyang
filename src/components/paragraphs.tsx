import { cn } from "@/lib/utils";

/** CMS·관리 화면에서 Enter로 넣은 줄바꿈을 공개 페이지 `<p>`로 그대로 보여 줍니다. */
export function Paragraphs({
  text,
  className,
}: {
  text: string;
  /** 각 문단 `<p>`에 적용 */
  className?: string;
}) {
  return (
    <>
      {text
        .split(/\n+/)
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part, index) => (
          <p key={`${index}-${part.slice(0, 24)}`} className={cn(className)}>
            {part}
          </p>
        ))}
    </>
  );
}
