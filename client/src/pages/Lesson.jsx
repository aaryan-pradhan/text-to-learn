import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../utils/api";
import LessonRenderer from "../components/LessonRenderer";
import HinglishExplainer from "../components/HinglishExplainer";
import LessonPDFExporter from "../components/LessonPDFExporter";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

function List({ title, items }) {
  if (!items?.length) return null;
  return (
    <div className="rounded-xl bg-indigo-50/60 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-indigo-800">{title}</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
        {items.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </div>
  );
}

export default function Lesson() {
  const { courseId, moduleIndex, lessonIndex } = useParams();
  const [data, setData] = useState(null);
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const m = Number(moduleIndex);
  const l = Number(lessonIndex);

  const load = useCallback(() => {
    setData(null);
    setError("");
    api(`/api/courses/${courseId}/modules/${m}/lessons/${l}`).then(setData, (e) => setError(e.message));
  }, [courseId, m, l]);

  useEffect(load, [load]);
  useEffect(() => {
    api(`/api/courses/${courseId}`).then(setCourse, () => {});
  }, [courseId]);

  // Previous / next lesson across module boundaries.
  const flat = course?.modules.flatMap((mod, mi) => mod.lessons.map((_, li) => [mi, li])) ?? [];
  const pos = flat.findIndex(([mi, li]) => mi === m && li === l);
  const link = (p) => p && `/courses/${courseId}/module/${p[0]}/lesson/${p[1]}`;
  const prev = link(flat[pos - 1]);
  const next = link(flat[pos + 1]);

  if (error) return <ErrorMessage message={error} onRetry={load} />;
  if (!data) return <LoadingSpinner label="Writing this lesson with AI… (first open only, can take up to a minute)" />;
  const { lesson } = data;

  return (
    <article>
      <nav className="text-sm text-slate-500">
        <Link to={`/courses/${courseId}`} className="hover:text-indigo-700">
          {data.courseTitle}
        </Link>{" "}
        / {data.moduleTitle}
      </nav>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{lesson.title}</h1>
        <LessonPDFExporter lesson={lesson} courseTitle={data.courseTitle} moduleTitle={data.moduleTitle} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <List title="Objectives" items={lesson.objectives} />
        <List title="Key topics" items={lesson.keyTopics} />
      </div>

      <HinglishExplainer key={lesson._id} lessonId={lesson._id} />

      <LessonRenderer content={lesson.content} />

      {lesson.readings?.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900">Suggested readings</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {lesson.readings.map((r) => (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noreferrer" className="text-indigo-700 underline">
                  {r.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-12 flex justify-between border-t border-slate-200 pt-6 text-sm font-medium">
        {prev ? <Link to={prev} className="text-indigo-700">← Previous lesson</Link> : <span />}
        {next ? <Link to={next} className="text-indigo-700">Next lesson →</Link> : <span />}
      </div>
    </article>
  );
}
