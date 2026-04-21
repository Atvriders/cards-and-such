import Fastify from "fastify";
import cors from "@fastify/cors";
import { loadConfig } from "./config.js";

export async function buildApp(config = loadConfig()) {
  const app = Fastify({ logger: process.env.NODE_ENV !== "test" });
  await app.register(cors, { origin: config.CORS_ORIGIN, credentials: true });

  app.get("/health", async () => ({ ok: true }));
  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const config = loadConfig();
  const app = await buildApp(config);
  await app.listen({ port: config.PORT, host: "0.0.0.0" });
}
