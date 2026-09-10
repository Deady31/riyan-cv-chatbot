// Rend les liens markdown [texte](url) et les URLs brutes cliquables.
// Le modèle répond parfois en markdown alors que l'UI n'affiche que du texte brut.
const MARKDOWN_LINK = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
const BARE_URL = /(https?:\/\/[^\s]+)/g;

function linkify(text: string): (string | { url: string; label: string })[] {
  const parts: (string | { url: string; label: string })[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(MARKDOWN_LINK)) {
    const [full, label, url] = match;
    const index = match.index ?? 0;
    if (index > lastIndex) parts.push(text.slice(lastIndex, index));
    parts.push({ url, label });
    lastIndex = index + full.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));

  return parts.flatMap((part) => {
    if (typeof part !== "string") return [part];
    const sub: (string | { url: string; label: string })[] = [];
    let idx = 0;
    for (const match of part.matchAll(BARE_URL)) {
      const url = match[0];
      const index = match.index ?? 0;
      if (index > idx) sub.push(part.slice(idx, index));
      sub.push({ url, label: url });
      idx = index + url.length;
    }
    if (idx < part.length) sub.push(part.slice(idx));
    return sub;
  });
}

export default function MessageContent({ text }: { text: string }) {
  return (
    <>
      {linkify(text).map((part, i) =>
        typeof part === "string" ? (
          <span key={i}>{part}</span>
        ) : (
          <a
            key={i}
            href={part.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline decoration-accent/40 underline-offset-2 hover:text-white"
          >
            {part.label}
          </a>
        )
      )}
    </>
  );
}
