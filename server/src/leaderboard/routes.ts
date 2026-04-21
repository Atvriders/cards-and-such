import type { FastifyInstance } from "fastify";
import { GameIdSchema, type LeaderboardRow, type GlobalLeaderboardRow } from "@cards/shared";

export async function registerLeaderboardRoutes(app: FastifyInstance): Promise<void> {
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
    const settingsHash = req.query.settingsHash ?? "default00";
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
}
