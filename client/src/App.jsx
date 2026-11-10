import { useCallback, useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { api } from "./utils/api";
import Sidebar from "./components/Sidebar";
import LoadingSpinner from "./components/LoadingSpinner";
import Home from "./pages/Home";
import Course from "./pages/Course";

// Protected layout: persistent sidebar + the current page in <Outlet />.
function Layout() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [open, setOpen] = useState(false);
  const refresh = useCallback(() => api("/api/courses").then(setCourses).catch(() => {}), []);

  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  if (user === undefined) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen">
      <Sidebar courses={courses} open={open} onClose={() => setOpen(false)} />
      <div className="min-w-0 flex-1">
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="rounded p-1 text-2xl leading-none">
            ☰
          </button>
          <span className="font-semibold">Text-to-Learn</span>
        </header>
        <main className="mx-auto max-w-4xl p-4 md:p-8">
          <Outlet context={{ courses, refresh }} />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="courses/:courseId" element={<Course />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
