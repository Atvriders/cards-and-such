import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/index.js";

describe("GET /health", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp({
      PORT: 0,
      JWT_SECRET: "test-secret-long-enough",
      DB_PATH: ":memory:",
      CORS_ORIGIN: "http://localhost:5173",
    });
    await app.ready();
  });

  afterAll(async () => { await app.close(); });

  it("returns ok:true", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ok: true });
  });
});
