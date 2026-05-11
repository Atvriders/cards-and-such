import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { claimUsername, resumeUsername } from "./http";

describe("http api", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("claimUsername POSTs JSON to /api/auth/claim and returns parsed AuthResponse", async () => {
    const payload = { username: "alice", token: "tok-abc", expiresAt: 1234567890 };
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const result = await claimUsername("alice");

    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/auth/claim");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>)["content-type"]).toBe("application/json");
    expect(init.body).toBe(JSON.stringify({ username: "alice" }));
  });

  it("resumeUsername throws the server-reported error on non-ok response", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "username_not_found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      }),
    );

    await expect(resumeUsername("bob")).rejects.toThrow("username_not_found");
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/auth/resume");
  });

  it("falls back to http_<status> when the error body is not JSON", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response("oops", {
        status: 500,
        headers: { "content-type": "text/plain" },
      }),
    );

    await expect(claimUsername("carol")).rejects.toThrow("http_500");
  });
});
