import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "../src/platform/stores/auth.js";

describe("useAuth store", () => {
  beforeEach(() => {
    useAuth.getState().logout();
    vi.restoreAllMocks();
  });

  it("claim stores the token on success", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(
      JSON.stringify({ username: "alice", token: "tok.tok.tok", expiresAt: Date.now() + 1000 * 60 }),
      { status: 200, headers: { "content-type": "application/json" } },
    ));
    await useAuth.getState().claim("alice");
    const s = useAuth.getState();
    expect(s.username).toBe("alice");
    expect(s.token).toBe("tok.tok.tok");
    expect(s.status).toBe("idle");
  });

  it("claim records an error on 409", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(
      JSON.stringify({ error: "username_taken" }),
      { status: 409, headers: { "content-type": "application/json" } },
    ));
    await useAuth.getState().claim("bob");
    expect(useAuth.getState().status).toBe("error");
    expect(useAuth.getState().error).toBe("username_taken");
  });
});
