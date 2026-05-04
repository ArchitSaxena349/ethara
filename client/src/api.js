const API_BASE = import.meta.env.VITE_API_URL || "/api";
let authToken = localStorage.getItem("taskflow-token");

export function setToken(token) {
  authToken = token;
  if (token) {
    localStorage.setItem("taskflow-token", token);
  } else {
    localStorage.removeItem("taskflow-token");
  }
}

export async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}
