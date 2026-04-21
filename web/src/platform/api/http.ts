import {
  AuthResponseSchema,
  type AuthResponse,
  type Username,
} from "@cards/shared";

const API_BASE = "/api";

async function postJson<T>(url: string, body: unknown, schema: { parse(v: unknown): T }, token?: string): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `http_${res.status}` }));
    throw new Error((err as { error?: string }).error ?? `http_${res.status}`);
  }
  const json = await res.json();
  return schema.parse(json);
}

export async function claimUsername(username: Username): Promise<AuthResponse> {
  return postJson("/auth/claim", { username }, AuthResponseSchema);
}
export async function resumeUsername(username: Username): Promise<AuthResponse> {
  return postJson("/auth/resume", { username }, AuthResponseSchema);
}
