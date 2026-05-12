import { buildApp } from "../src/index.js";
import type { FastifyInstance } from "fastify";

export async function makeTestApp(): Promise<FastifyInstance> {
  const app = await buildApp({
    PORT: 0,
    JWT_SECRET: "test-secret-at-least-16-chars",
    DB_PATH: ":memory:",
    CORS_ORIGIN: "http://localhost:5173",
    CLAIM_RATE_MAX: 20,
    CLAIM_RATE_WINDOW: "1 hour",
    RESUME_RATE_MAX: 60,
    RESUME_RATE_WINDOW: "1 hour",
  });
  await app.ready();
  return app;
}
