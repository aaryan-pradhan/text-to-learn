import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../utils/api";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

export default function Course() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setCourse(null);
    api(`/api/courses/${courseId}`).then(setCourse, (e) => setError(e.message));
  }, [courseId]);

  if (error) return <ErrorMessage message={error} />;
  if (!course) return <LoadingSpinner />;

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{course.title}</h1>
      <p className="mt-2 text-slate-600">{course.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {course.tags.map((t) => (
          <span key={t} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            {t}
          </span>
        ))}
      </div>

      <ol className="mt-8 space-y-4">
        {course.modules.map((m, mi) => (
          <li key={m._id} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="font-semibold text-slate-900">
              Module {mi + 1}: {m.title}
            </h2>
            <ol className="mt-3 space-y-1">
              {m.lessons.map((l, li) => (
                <li key={l._id}>
                  <Link
                    to={`/courses/${courseId}/module/${mi}/lesson/${li}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    <span>
                      {mi + 1}.{li + 1} {l.title}
                    </span>
                    <span className={`text-xs ${l.isEnriched ? "text-emerald-600" : "text-slate-400"}`}>
                      {l.isEnriched ? "Ready" : "Generates on open"}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ol>
    </>
  );
}
