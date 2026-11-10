import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }) =>
  `block truncate rounded-lg px-3 py-2 text-sm ${isActive ? "bg-indigo-50 font-medium text-indigo-700" : "text-slate-700 hover:bg-slate-100"}`;

export default function Sidebar({ courses, open, onClose }) {
  const { user, logout } = useAuth();
  return (
    <>
      {open && <div className="fixed inset-0 z-20 bg-black/30 md:hidden" onClick={onClose} />}
      <nav
        aria-label="Main"
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white p-4 transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <NavLink to="/" onClick={onClose} className="mb-4 px-3 text-lg font-bold text-indigo-700">
          Text-to-Learn
        </NavLink>
        <NavLink to="/" end onClick={onClose} className={linkClass}>
          + New course
        </NavLink>
        <p className="mt-6 mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">My courses</p>
        <div className="flex-1 space-y-1 overflow-y-auto">
          {courses.length === 0 && <p className="px-3 text-sm text-slate-500">No courses yet</p>}
          {courses.map((c) => (
            <NavLink key={c._id} to={`/courses/${c._id}`} onClick={onClose} className={linkClass}>
              {c.title}
            </NavLink>
          ))}
        </div>
        <div className="mt-4 border-t border-slate-200 pt-4">
          <p className="truncate px-3 text-sm text-slate-600">{user?.displayName || user?.email}</p>
          <button onClick={logout} className="mt-2 px-3 text-sm font-medium text-slate-700 hover:text-red-600">
            Log out
          </button>
        </div>
      </nav>
    </>
  );
}
