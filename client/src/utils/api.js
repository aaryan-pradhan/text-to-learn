import { auth } from "../firebase";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// fetch wrapper: adds the Firebase ID token (refreshed automatically) and unwraps JSON errors.
export async function api(path, { method = "GET", body } = {}) {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(body && { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body && JSON.stringify(body),
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}
