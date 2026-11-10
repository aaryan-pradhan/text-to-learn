export default function CodeBlock({ language, text }) {
  return (
    <figure className="my-4 overflow-hidden rounded-lg bg-slate-900">
      <figcaption className="border-b border-slate-700 px-4 py-1.5 text-xs text-slate-400">{language}</figcaption>
      <pre className="overflow-x-auto p-4 text-sm leading-6 text-slate-100">
        <code>{text}</code>
      </pre>
    </figure>
  );
}
