import type { FastifyInstance } from "fastify";
import {
  ClaimRequestSchema,
  ResumeRequestSchema,
  AuthResponseSchema,
  type AuthResponse,
} from "@cards/shared";
import { createJwt } from "./jwt.js";

const CLAIM_LIMIT = { max: 20, timeWindow: "1 hour" };
const RESUME_LIMIT = { max: 60, timeWindow: "1 hour" };

export async function registerAuthRoutes(app: FastifyInstance): Promise<void> {
  const jwt = createJwt(app.config.JWT_SECRET);
  const insertUser = app.db.prepare(
    "INSERT INTO users (username, created_at) VALUES (?, ?)",
  );
  const findUser = app.db.prepare(
    "SELECT username FROM users WHERE username = ?",
  );

  app.post("/auth/claim", { config: { rateLimit: CLAIM_LIMIT } }, async (req, reply) => {
    const parsed = ClaimRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.errors[0]?.message ?? "bad_request" });
    }
    const { username } = parsed.data;
    if (findUser.get(username)) return reply.code(409).send({ error: "username_taken" });

    insertUser.run(username, Date.now());
    const { token, expiresAt } = await jwt.issue(username);
    const body: AuthResponse = { username, token, expiresAt };
    return AuthResponseSchema.parse(body);
  });

  app.post("/auth/resume", { config: { rateLimit: RESUME_LIMIT } }, async (req, reply) => {
    const parsed = ResumeRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.errors[0]?.message ?? "bad_request" });
    }
    const { username } = parsed.data;
    if (!findUser.get(username)) return reply.code(404).send({ error: "username_not_found" });

    const { token, expiresAt } = await jwt.issue(username);
    const body: AuthResponse = { username, token, expiresAt };
    return AuthResponseSchema.parse(body);
  });
}
