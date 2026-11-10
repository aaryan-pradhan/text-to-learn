export default function LoadingSpinner({ label = "Loading…" }) {
  return (
    <div role="status" className="flex items-center gap-3 p-6 text-slate-600">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      {label}
    </div>
  );
}
