import { useState } from "react";

export default function PromptForm({ onSubmit, busy }) {
  const [topic, setTopic] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (topic.trim().length >= 2) onSubmit(topic.trim());
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
      <label htmlFor="topic" className="sr-only">
        Course topic
      </label>
      <input
        id="topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        maxLength={200}
        placeholder='e.g. "Intro to React Hooks" or "Basics of Copyright Law"'
        className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
      <button
        disabled={busy || topic.trim().length < 2}
        className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {busy ? "Generating…" : "Generate course"}
      </button>
    </form>
  );
}
