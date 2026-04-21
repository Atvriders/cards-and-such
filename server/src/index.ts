import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { loadConfig, type Config } from "./config.js";
import { openDb, type Db } from "./db/index.js";
import { registerAuthRoutes } from "./auth/routes.js";
import { registerLeaderboardRoutes } from "./leaderboard/routes.js";
import { registerRateLimit } from "./http/plugins.js";
import { attachWs, type WsHub } from "./ws/server.js";
import { RoomRegistry, type TerminalPersist } from "./rooms/registry.js";
import { registerRoomsRoutes } from "./rooms/routes.js";
import { registerConnect4 } from "./rooms/games/connect-4.js";
import { registerUnoLike } from "./rooms/games/uno-like.js";

declare module "fastify" {
  interface FastifyInstance {
    db: Db;
    config: Config;
    ws: WsHub;
  }
}

export async function buildApp(config = loadConfig()): Promise<FastifyInstance> {
  const app = Fastify({ logger: process.env.NODE_ENV !== "test" });
  const db = openDb(config.DB_PATH);

  app.decorate("db", db);
  app.decorate("config", config);
  app.addHook("onClose", async () => db.close());

  await app.register(cors, { origin: config.CORS_ORIGIN, credentials: true });

  await registerRateLimit(app);
  await registerAuthRoutes(app);
  await registerLeaderboardRoutes(app);

  app.get("/health", async () => ({ ok: true }));

  registerConnect4();
  registerUnoLike();

  const insertScore = db.prepare(
    `INSERT INTO scores (game_id, username, score, settings_hash, played_at) VALUES (?, ?, ?, 'online00', ?)`,
  );
  const getRating = db.prepare(
    `SELECT elo FROM ratings WHERE game_id = ? AND username = ?`,
  );
  const upsertRating = db.prepare(
    `INSERT INTO ratings (game_id, username, elo, games_played) VALUES (?, ?, ?, 1)
     ON CONFLICT(game_id, username) DO UPDATE SET elo = excluded.elo, games_played = games_played + 1`,
  );

  function eloExpected(a: number, b: number): number {
    return 1 / (1 + Math.pow(10, (b - a) / 400));
  }

  const persist: TerminalPersist = (gameId, members, terminal) => {
    const now = Date.now();
    for (const m of members) {
      const won = terminal.winner === m.seat;
      const score = won ? terminal.score : 0;
      insertScore.run(gameId, m.username, score, now);
    }
    // Elo only makes sense with exactly 2 members
    if (members.length === 2 && terminal.winner !== "draw") {
      const winner = members.find((x) => x.seat === terminal.winner)!;
      const loser = members.find((x) => x.seat !== terminal.winner)!;
      const wr = (getRating.get(gameId, winner.username) as { elo?: number } | undefined)?.elo ?? 1000;
      const lr = (getRating.get(gameId, loser.username) as { elo?: number } | undefined)?.elo ?? 1000;
      const K = 32;
      const ew = eloExpected(wr, lr);
      const el = eloExpected(lr, wr);
      const newWr = Math.round(wr + K * (1 - ew));
      const newLr = Math.round(lr + K * (0 - el));
      upsertRating.run(gameId, winner.username, newWr);
      upsertRating.run(gameId, loser.username, newLr);
    }
  };

  const rooms = new RoomRegistry(persist);
  await registerRoomsRoutes(app, rooms);

  // attachWs needs app.server (exists before ready) + app.config (decorated above).
  // Both decorate and addHook must be called before ready().
  // Note: attachWs registers its own onClose hook to close wss — no duplicate needed here.
  const ws = attachWs(app, rooms);
  app.decorate("ws", ws);

  await app.ready();
  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const config = loadConfig();
  const app = await buildApp(config);
  await app.listen({ port: config.PORT, host: "0.0.0.0" });
}
