import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ErrorMessage from "../components/ErrorMessage";

export default function Login() {
  const { user, login } = useAuth();
  const [error, setError] = useState("");
  if (user) return <Navigate to="/" replace />;

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Text-to-Learn</h1>
        <p className="mt-2 text-slate-600">Type any topic. Get a full course with lessons, quizzes and videos.</p>
        <button
          onClick={() => login().catch((e) => setError(e.message))}
          className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Continue with Google
        </button>
        {error && <ErrorMessage message={error} />}
      </div>
    </main>
  );
}
