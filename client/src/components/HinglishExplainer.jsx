import { useEffect, useState } from "react";
import { api } from "../utils/api";
import ErrorMessage from "./ErrorMessage";

// Speaks text with the browser's built-in speech engine (Web Speech API): free, no key.
// Sentences are queued separately because Chrome stops very long utterances.
function speak(text, onEnd) {
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  const voice = voices.find((v) => v.lang.startsWith("hi")) || voices.find((v) => v.lang === "en-IN");
  const parts = text.match(/[^.!?।]+[.!?।]?/g) ?? [text];
  synth.cancel();
  parts.forEach((part, i) => {
    const u = new SpeechSynthesisUtterance(part.trim());
    u.lang = voice?.lang || "hi-IN";
    if (voice) u.voice = voice;
    u.rate = 0.95;
    if (i === parts.length - 1) u.onend = onEnd;
    synth.speak(u);
  });
}

export default function HinglishExplainer({ lessonId }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => () => canSpeak && window.speechSynthesis.cancel(), [canSpeak]);

  const play = (t) => {
    if (!canSpeak) return;
    setPlaying(true);
    speak(t, () => setPlaying(false));
  };

  const load = async () => {
    setBusy(true);
    setError("");
    try {
      const { hinglish } = await api(`/api/lessons/${lessonId}/hinglish`, { method: "POST" });
      setText(hinglish);
      play(hinglish);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setPlaying(false);
  };

  return (
    <section className="mt-6 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-semibold text-amber-900">Hinglish explanation</h2>
        {!text ? (
          <button onClick={load} disabled={busy} className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50">
            {busy ? "Translating…" : "🔊 Explain in Hinglish"}
          </button>
        ) : playing ? (
          <button onClick={stop} className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white">
            ■ Stop
          </button>
        ) : (
          canSpeak && (
            <button onClick={() => play(text)} className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white">
              ▶ Play audio
            </button>
          )
        )}
      </div>
      {text && <p className="mt-3 whitespace-pre-line text-sm leading-6 text-amber-950">{text}</p>}
      {error && <ErrorMessage message={error} />}
    </section>
  );
}
