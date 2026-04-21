import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { loadConfig, type Config } from "./config.js";
import { openDb, type Db } from "./db/index.js";
import { registerAuthRoutes } from "./auth/routes.js";
import { registerLeaderboardRoutes } from "./leaderboard/routes.js";
import { registerRateLimit } from "./http/plugins.js";
import { attachWs, type WsHub } from "./ws/server.js";
import { RoomRegistry } from "./rooms/registry.js";
import { registerRoomsRoutes } from "./rooms/routes.js";
import { registerConnect4 } from "./rooms/games/connect-4.js";

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
  const rooms = new RoomRegistry();
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
