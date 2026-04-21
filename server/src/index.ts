import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { loadConfig, type Config } from "./config.js";
import { openDb, type Db } from "./db/index.js";
import { registerAuthRoutes } from "./auth/routes.js";
import { registerRateLimit } from "./http/plugins.js";

declare module "fastify" {
  interface FastifyInstance {
    db: Db;
    config: Config;
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

  app.get("/health", async () => ({ ok: true }));
  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const config = loadConfig();
  const app = await buildApp(config);
  await app.listen({ port: config.PORT, host: "0.0.0.0" });
}
