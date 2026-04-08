export function getApiBase(): string {
  const fromEnv = import.meta.env.VITE_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  // Relative URLs: Vite dev proxy, or production when API is same origin (e.g. Vercel Services).
  return "";
}

/** Join base + path without duplicating `/api` when env is `.../api` and paths are `/api/...`. */
export function resolveApiUrl(path: string): string {
  const base = getApiBase();
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!base) return p;
  const b = base.replace(/\/$/, "");
  if (b.endsWith("/api") && (p === "/api" || p.startsWith("/api/"))) {
    return b + p.slice("/api".length);
  }
  return b + p;
}

export async function api<T>(
  path: string,
  opts: RequestInit = {},
  token?: string,
): Promise<T> {
  const res = await fetch(resolveApiUrl(path), {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data as T;
}
