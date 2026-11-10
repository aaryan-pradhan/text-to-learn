import { useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { api } from "../utils/api";
import PromptForm from "../components/PromptForm";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

export default function Home() {
  const { courses, refresh } = useOutletContext();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const create = async (topic) => {
    setBusy(true);
    setError("");
    try {
      const course = await api("/api/courses", { method: "POST", body: { topic } });
      await refresh();
      navigate(`/courses/${course._id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    await api(`/api/courses/${id}`, { method: "DELETE" }).catch((e) => setError(e.message));
    refresh();
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">What do you want to learn?</h1>
      <p className="mt-2 mb-6 text-slate-600">Type a topic and get a structured course: modules, lessons, quizzes and videos.</p>
      <PromptForm onSubmit={create} busy={busy} />
      {busy && <LoadingSpinner label="Designing your course outline… (free AI tier, this can take up to a minute)" />}
      {error && <ErrorMessage message={error} />}

      <h2 className="mt-10 mb-4 text-lg font-semibold">Your courses</h2>
      {courses.length === 0 ? (
        <p className="text-slate-500">No courses yet. Generate your first one above.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {courses.map((c) => (
            <li key={c._id} className="flex flex-col rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <Link to={`/courses/${c._id}`} className="font-semibold text-slate-900 hover:text-indigo-700">
                {c.title}
              </Link>
              <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-600">{c.description}</p>
              <button onClick={() => remove(c._id)} className="mt-3 self-start text-sm text-slate-500 hover:text-red-600">
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
