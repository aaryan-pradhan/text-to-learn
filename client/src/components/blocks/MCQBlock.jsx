import { useState } from "react";

export default function MCQBlock({ question, options, answer, explanation }) {
  const [picked, setPicked] = useState(null);
  const done = picked !== null;

  const style = (i) => {
    if (!done) return "ring-slate-200 hover:bg-slate-50";
    if (i === answer) return "bg-emerald-50 ring-emerald-400";
    return i === picked ? "bg-red-50 ring-red-300" : "ring-slate-200 opacity-60";
  };

  return (
    <fieldset className="my-4 rounded-xl bg-white p-4 ring-1 ring-slate-200">
      <legend className="sr-only">Quiz question</legend>
      <p className="font-medium text-slate-900">{question}</p>
      <div className="mt-3 space-y-2">
        {options.map((o, i) => (
          <button
            key={i}
            disabled={done}
            onClick={() => setPicked(i)}
            className={`block w-full rounded-lg px-4 py-2 text-left text-sm ring-1 ${style(i)}`}
          >
            {o}
          </button>
        ))}
      </div>
      {done && (
        <p className="mt-3 text-sm" role="status">
          <strong className={picked === answer ? "text-emerald-700" : "text-red-700"}>
            {picked === answer ? "Correct!" : "Not quite."}
          </strong>{" "}
          {explanation}
        </p>
      )}
    </fieldset>
  );
}
