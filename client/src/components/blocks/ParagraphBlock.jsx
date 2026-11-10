// Supports **bold** and line breaks from the AI text.
export default function ParagraphBlock({ text }) {
  return (
    <p className="my-3 whitespace-pre-line leading-7 text-slate-700">
      {text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part))}
    </p>
  );
}
