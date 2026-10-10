export function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/\n+/)
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part, index) => (
          <p key={`${index}-${part.slice(0, 24)}`}>{part}</p>
        ))}
    </>
  );
}
