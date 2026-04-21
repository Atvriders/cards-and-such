import type { FastifyInstance } from "fastify";
import { GameIdSchema, ScoreSubmitSchema, type LeaderboardRow, type GlobalLeaderboardRow } from "@cards/shared";
import { createJwt } from "../auth/jwt.js";

export async function registerLeaderboardRoutes(app: FastifyInstance): Promise<void> {
  const jwt = createJwt(app.config.JWT_SECRET);
  const insertScore = app.db.prepare(
    `INSERT INTO scores (game_id, username, score, settings_hash, played_at)
     VALUES (?, ?, ?, ?, ?)`,
  );

  const topScores = app.db.prepare(
    `SELECT username, score, played_at AS playedAt
       FROM scores
      WHERE game_id = ? AND settings_hash = ?
      ORDER BY score DESC, played_at ASC
      LIMIT 100`,
  );

  const globalTotals = app.db.prepare(
    `SELECT username, COUNT(*) AS gamesPlayed
       FROM scores
      GROUP BY username
      ORDER BY gamesPlayed DESC
      LIMIT 100`,
  );

  app.get<{
    Params: { gameId: string };
    Querystring: { settingsHash?: string };
  }>("/leaderboard/game/:gameId", async (req, reply) => {
    const gid = GameIdSchema.safeParse(req.params.gameId);
    if (!gid.success) return reply.code(400).send({ error: "bad_game_id" });
    const settingsHash = req.query.settingsHash ?? "default0";
    const rows = topScores.all(gid.data, settingsHash) as Array<{
      username: string; score: number; playedAt: number;
    }>;
    const result: LeaderboardRow[] = rows.map((r, i) => ({
      rank: i + 1, username: r.username, score: r.score, playedAt: r.playedAt,
    }));
    return result;
  });

  app.get("/leaderboard/global", async () => {
    const rows = globalTotals.all() as Array<{ username: string; gamesPlayed: number }>;
    const result: GlobalLeaderboardRow[] = rows.map((r, i) => ({
      rank: i + 1, username: r.username, gamesPlayed: r.gamesPlayed,
    }));
    return result;
  });

  app.post("/scores", async (req, reply) => {
    const auth = req.headers.authorization ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return reply.code(401).send({ error: "missing_token" });

    let username: string;
    try {
      username = (await jwt.verify(token)).sub;
    } catch {
      return reply.code(401).send({ error: "bad_token" });
    }

    const parsed = ScoreSubmitSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.errors[0]?.message ?? "bad_request" });
    }
    const { gameId, score, settingsHash } = parsed.data;
    insertScore.run(gameId, username, score, settingsHash, Date.now());
    return reply.code(201).send({ ok: true });
  });
}
