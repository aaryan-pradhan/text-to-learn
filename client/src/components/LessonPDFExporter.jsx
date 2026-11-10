import { useRef, useState } from "react";

// A hidden, print-styled copy of the lesson is captured with html2canvas and paged into an A4 PDF
// with jsPDF. Inline hex colours keep the export identical whatever the UI theme
// (html2canvas can't parse Tailwind v4's oklch colours).
const S = {
  root: { width: 760, padding: 40, background: "#ffffff", color: "#1e293b", fontFamily: "Helvetica, Arial, sans-serif", fontSize: 14, lineHeight: 1.6 },
  h1: { fontSize: 26, margin: "0 0 4px", color: "#0f172a" },
  meta: { color: "#64748b", margin: "0 0 20px" },
  h2: { fontSize: 18, margin: "22px 0 8px", color: "#0f172a" },
  code: { background: "#0f172a", color: "#f1f5f9", padding: 12, borderRadius: 6, whiteSpace: "pre-wrap", fontFamily: "Menlo, monospace", fontSize: 12 },
  box: { border: "1px solid #cbd5e1", borderRadius: 8, padding: 12, margin: "10px 0" },
  answer: { color: "#047857", fontWeight: 600 },
};

const bold = (text) => text.split(/\*\*(.+?)\*\*/g).map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : p));

function PrintableLesson({ lesson, courseTitle, moduleTitle }) {
  return (
    <div style={S.root}>
      <h1 style={S.h1}>{lesson.title}</h1>
      <p style={S.meta}>
        {courseTitle} · {moduleTitle}
      </p>
      {lesson.objectives?.length > 0 && (
        <>
          <h2 style={S.h2}>Objectives</h2>
          <ul>{lesson.objectives.map((o) => <li key={o}>{o}</li>)}</ul>
        </>
      )}
      {lesson.content.map((b, i) => {
        if (b.type === "heading") return <h2 key={i} style={S.h2}>{b.text}</h2>;
        if (b.type === "paragraph") return <p key={i} style={{ whiteSpace: "pre-line" }}>{bold(b.text)}</p>;
        if (b.type === "code") return <pre key={i} style={S.code}>{b.text}</pre>;
        if (b.type === "video") return <p key={i}>Video: search YouTube for “{b.query}”</p>;
        if (b.type === "mcq")
          return (
            <div key={i} style={S.box}>
              <strong>{b.question}</strong>
              <ol type="A">{b.options.map((o, j) => <li key={j} style={j === b.answer ? S.answer : undefined}>{o}</li>)}</ol>
              {b.explanation && <em>{b.explanation}</em>}
            </div>
          );
        return null;
      })}
      {lesson.readings?.length > 0 && (
        <>
          <h2 style={S.h2}>Suggested readings</h2>
          <ul>{lesson.readings.map((r) => <li key={r.url}>{r.title}: {r.url}</li>)}</ul>
        </>
      )}
    </div>
  );
}

export default function LessonPDFExporter(props) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
      const canvas = await html2canvas(ref.current, { scale: 2, backgroundColor: "#ffffff" });
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pageW) / canvas.width;
      const img = canvas.toDataURL("image/jpeg", 0.92);
      for (let y = 0; y < imgH; y += pageH) {
        if (y > 0) pdf.addPage();
        pdf.addImage(img, "JPEG", 0, -y, pageW, imgH);
      }
      pdf.save(`${props.lesson.title.replace(/[^\w\- ]+/g, "").trim() || "lesson"}.pdf`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button onClick={download} disabled={busy} className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-50">
        {busy ? "Preparing PDF…" : "⬇ Download PDF"}
      </button>
      <div aria-hidden="true" style={{ position: "fixed", left: -10000, top: 0 }}>
        <div ref={ref}>
          <PrintableLesson {...props} />
        </div>
      </div>
    </>
  );
}
