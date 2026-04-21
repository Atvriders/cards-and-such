import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { makeTestApp } from "./helpers.js";

describe("auth routes", () => {
  let app: FastifyInstance;
  beforeEach(async () => { app = await makeTestApp(); });
  afterEach(async () => { await app.close(); });

  it("claim issues a token for a fresh username", async () => {
    const res = await app.inject({
      method: "POST", url: "/auth/claim",
      payload: { username: "alice" },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { username: string; token: string; expiresAt: number };
    expect(body.username).toBe("alice");
    expect(body.token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
    expect(body.expiresAt).toBeGreaterThan(Date.now());
  });

  it("claim conflicts on a taken username", async () => {
    await app.inject({ method: "POST", url: "/auth/claim", payload: { username: "bob" } });
    const res = await app.inject({ method: "POST", url: "/auth/claim", payload: { username: "bob" } });
    expect(res.statusCode).toBe(409);
  });

  it("claim 400s on an invalid username", async () => {
    const res = await app.inject({ method: "POST", url: "/auth/claim", payload: { username: "x" } });
    expect(res.statusCode).toBe(400);
  });

  it("resume works for an existing username", async () => {
    await app.inject({ method: "POST", url: "/auth/claim", payload: { username: "carol" } });
    const res = await app.inject({ method: "POST", url: "/auth/resume", payload: { username: "carol" } });
    expect(res.statusCode).toBe(200);
  });

  it("resume 404s for an unknown username", async () => {
    const res = await app.inject({ method: "POST", url: "/auth/resume", payload: { username: "ghost" } });
    expect(res.statusCode).toBe(404);
  });
});
