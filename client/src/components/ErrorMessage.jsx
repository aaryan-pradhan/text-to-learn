export default function ErrorMessage({ message, onRetry }) {
  return (
    <div role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
      {message}
      {onRetry && (
        <button onClick={onRetry} className="ml-2 font-medium underline">
          Try again
        </button>
      )}
    </div>
  );
}
