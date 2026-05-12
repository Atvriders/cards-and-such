import { z } from "zod";

const ConfigSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 chars"),
  DB_PATH: z.string().default("./data/cards.db"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  CLAIM_RATE_MAX: z.coerce.number().int().positive().default(20),
  CLAIM_RATE_WINDOW: z.string().default("1 hour"),
  RESUME_RATE_MAX: z.coerce.number().int().positive().default(60),
  RESUME_RATE_WINDOW: z.string().default("1 hour"),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return ConfigSchema.parse(env);
}
