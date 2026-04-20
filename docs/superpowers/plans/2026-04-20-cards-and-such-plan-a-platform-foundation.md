# cards-and-such — Plan A: Platform Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the monorepo, backend, and frontend shell so a user can claim/resume a username, see an (empty) lobby, and open a Leaderboard tab that shows an "Online Now" panel backed by real WebSocket presence. **No games are implemented in this plan** — that's Plan B.

**Architecture:** npm workspaces monorepo with three packages (`web`, `server`, `shared`). Backend is Fastify + SQLite + a single `ws` WebSocket server. Frontend is Vite + React + Zustand. All wire-level messages and DB row shapes are defined once in `shared/` as zod schemas and imported by both sides. Everything runs under `docker compose up`.

**Tech stack:** Node 20, TypeScript 5 strict, npm workspaces, Fastify 4, `better-sqlite3` 11, `ws` 8, `jose` 5, `zod` 3, React 18, Vite 5, React Router 6, Zustand 4, Vitest 1, Playwright 1, GitHub Actions.

**Reference spec:** `docs/superpowers/specs/2026-04-20-cards-and-such-phase-1-design.md`

---

## Conventions used across all tasks

- Project root: `/home/kasm-user/cards-and-such`
- Node is at `/home/kasm-user/.local/node/bin/node`; `npm` is on PATH. Run npm from the repo root and target workspaces with `-w <workspace>`.
- Git user identity is already set globally — do not run `git config user.*`.
- **TDD is the rule.** Every task that adds behavior follows: write failing test → run it & confirm failure → write minimal code → run & confirm pass → commit.
- **Commit after every task.** Commits reference the task number: `feat(plan-a-taskN): <summary>`.
- **Type-check before commit** in any task that touches TS: `npm -w <workspace> run typecheck`. If it fails, fix before committing.

---

## File map — what each file is responsible for

### Root
- `package.json` — workspaces declaration, root scripts (`typecheck`, `test`, `dev`).
- `tsconfig.base.json` — strict compiler options shared by all packages.
- `.gitignore` — node_modules, dist, *.db, .env.
- `docker-compose.yml` — two services: `server`, `web`. SQLite volume on `server`.
- `.github/workflows/ci.yml` — typecheck + vitest + playwright on every push.

### `shared/`
Pure-TS, no runtime dependencies except zod. Imported by web and server.
- `shared/package.json`, `shared/tsconfig.json`.
- `shared/src/index.ts` — barrel re-export.
- `shared/src/auth.ts` — `UsernameSchema`, `ClaimRequestSchema`, `AuthResponseSchema`, `JwtClaimsSchema`.
- `shared/src/presence.ts` — `PresenceMessageSchema`, `OnlineUserSchema`.
- `shared/src/leaderboard.ts` — `LeaderboardRowSchema`, `GameIdSchema`.
- `shared/src/ws.ts` — `WsClientMessageSchema`, `WsServerMessageSchema` (discriminated unions).

### `server/`
- `server/package.json`, `server/tsconfig.json`, `server/vitest.config.ts`.
- `server/src/index.ts` — entrypoint; reads env, starts Fastify, attaches WS, runs migrations.
- `server/src/config.ts` — env parsing with zod (JWT_SECRET, PORT, DB_PATH).
- `server/src/db/index.ts` — opens SQLite, runs migrations, exports typed prepared statements.
- `server/src/db/migrations.ts` — runs idempotent `CREATE TABLE IF NOT EXISTS` statements.
- `server/src/auth/jwt.ts` — `issueToken`, `verifyToken`.
- `server/src/auth/routes.ts` — `POST /auth/claim`, `POST /auth/resume`.
- `server/src/leaderboard/routes.ts` — `GET /leaderboard/game/:gameId`, `GET /leaderboard/global`, `POST /scores`.
- `server/src/ws/server.ts` — attaches WS to Fastify, routes messages.
- `server/src/ws/presence.ts` — in-memory presence map and broadcast.
- `server/src/http/plugins.ts` — cors, rate-limit registration.
- `server/test/helpers.ts` — spawns a fresh test server on an ephemeral port with an in-memory DB.
- `server/test/*.test.ts` — one file per route group.

### `web/`
- `web/package.json`, `web/tsconfig.json`, `web/vite.config.ts`, `web/index.html`.
- `web/src/main.tsx` — React entry, mounts router.
- `web/src/App.tsx` — router + top-level shell.
- `web/src/platform/AppShell.tsx` + `.css` — header, nav, outlet.
- `web/src/platform/stores/auth.ts` — Zustand auth store.
- `web/src/platform/api/http.ts` — typed fetch wrappers using shared zod schemas.
- `web/src/platform/api/ws.ts` — WebSocket client hook `useLobbyPresence()`.
- `web/src/pages/LoginPage.tsx` + `.css`.
- `web/src/pages/LeaderboardPage.tsx` + `.css`.
- `web/src/pages/leaderboard/OnlineNowPanel.tsx` + `.css`.
- `web/test/*.test.tsx` — React Testing Library component tests.

### `e2e/`
- `e2e/package.json`, `e2e/playwright.config.ts`, `e2e/tests/smoke.spec.ts`.

---

## Task 1: Initialize monorepo + gitignore + base tsconfig

**Files:**
- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `.npmrc`

- [ ] **Step 1: Write root `package.json`**

```json
{
  "name": "cards-and-such",
  "private": true,
  "version": "0.0.0",
  "workspaces": ["shared", "server", "web"],
  "scripts": {
    "typecheck": "npm -ws --if-present run typecheck",
    "test": "npm -ws --if-present run test",
    "build": "npm -ws --if-present run build"
  },
  "devDependencies": {
    "typescript": "^5.4.5"
  }
}
```

- [ ] **Step 2: Write `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  }
}
```

- [ ] **Step 3: Write `.gitignore`**

```
node_modules/
dist/
build/
coverage/
*.db
*.db-journal
.env
.env.local
.DS_Store
.vite/
playwright-report/
test-results/
```

- [ ] **Step 4: Write `.npmrc`**

```
engine-strict=true
```

- [ ] **Step 5: Install, verify, commit**

```bash
cd /home/kasm-user/cards-and-such
npm install
ls -la
```

Expected: `node_modules/` exists, `package-lock.json` created, no errors.

```bash
git add package.json tsconfig.base.json .gitignore .npmrc package-lock.json
git commit -m "feat(plan-a-task1): initialize monorepo with npm workspaces"
```

---

## Task 2: Scaffold `shared/` package with zod schemas

**Files:**
- Create: `shared/package.json`
- Create: `shared/tsconfig.json`
- Create: `shared/src/index.ts`
- Create: `shared/src/auth.ts`
- Create: `shared/src/presence.ts`
- Create: `shared/src/leaderboard.ts`
- Create: `shared/src/ws.ts`
- Create: `shared/test/schemas.test.ts`

- [ ] **Step 1: Write `shared/package.json`**

```json
{
  "name": "@cards/shared",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "scripts": {
    "typecheck": "tsc -b --noEmit",
    "test": "vitest run"
  },
  "dependencies": { "zod": "^3.23.8" },
  "devDependencies": { "vitest": "^1.6.0" }
}
```

- [ ] **Step 2: Write `shared/tsconfig.json`**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "dist",
    "rootDir": "src",
    "types": []
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: Write `shared/src/auth.ts`**

```ts
import { z } from "zod";

export const UsernameSchema = z
  .string()
  .trim()
  .min(2, "Username must be at least 2 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(/^[a-zA-Z0-9_-]+$/, "Username may only contain letters, digits, hyphen, and underscore");

export type Username = z.infer<typeof UsernameSchema>;

export const ClaimRequestSchema = z.object({ username: UsernameSchema });
export const ResumeRequestSchema = z.object({ username: UsernameSchema });

export const AuthResponseSchema = z.object({
  username: UsernameSchema,
  token: z.string().min(1),
  expiresAt: z.number().int().positive(),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const JwtClaimsSchema = z.object({
  sub: UsernameSchema,
  iat: z.number().int().positive(),
  exp: z.number().int().positive(),
});
export type JwtClaims = z.infer<typeof JwtClaimsSchema>;
```

- [ ] **Step 4: Write `shared/src/presence.ts`**

```ts
import { z } from "zod";
import { UsernameSchema } from "./auth.js";

export const OnlineUserSchema = z.object({
  username: UsernameSchema,
  game: z.string().nullable(),
});
export type OnlineUser = z.infer<typeof OnlineUserSchema>;

export const PresenceMessageSchema = z.object({
  type: z.literal("presence"),
  online: z.number().int().nonnegative(),
  users: z.array(OnlineUserSchema),
});
export type PresenceMessage = z.infer<typeof PresenceMessageSchema>;
```

- [ ] **Step 5: Write `shared/src/leaderboard.ts`**

```ts
import { z } from "zod";
import { UsernameSchema } from "./auth.js";

export const GameIdSchema = z.string().regex(/^[a-z][a-z0-9-]{1,31}$/);
export type GameId = z.infer<typeof GameIdSchema>;

export const LeaderboardRowSchema = z.object({
  rank: z.number().int().positive(),
  username: UsernameSchema,
  score: z.number().int(),
  playedAt: z.number().int().positive(),
});
export type LeaderboardRow = z.infer<typeof LeaderboardRowSchema>;

export const GlobalLeaderboardRowSchema = z.object({
  rank: z.number().int().positive(),
  username: UsernameSchema,
  gamesPlayed: z.number().int().nonnegative(),
});
export type GlobalLeaderboardRow = z.infer<typeof GlobalLeaderboardRowSchema>;

export const ScoreSubmitSchema = z.object({
  gameId: GameIdSchema,
  score: z.number().int(),
  settingsHash: z.string().length(8),
});
export type ScoreSubmit = z.infer<typeof ScoreSubmitSchema>;
```

- [ ] **Step 6: Write `shared/src/ws.ts`**

```ts
import { z } from "zod";
import { PresenceMessageSchema } from "./presence.js";

export const WsAuthMessageSchema = z.object({
  type: z.literal("auth"),
  token: z.string().min(1),
});

export const WsSubscribeSchema = z.object({
  type: z.literal("subscribe"),
  channel: z.enum(["lobby"]),
});

export const WsClientMessageSchema = z.discriminatedUnion("type", [
  WsAuthMessageSchema,
  WsSubscribeSchema,
]);
export type WsClientMessage = z.infer<typeof WsClientMessageSchema>;

export const WsAuthOkSchema = z.object({ type: z.literal("auth_ok") });
export const WsErrorSchema = z.object({
  type: z.literal("error"),
  reason: z.string(),
});

export const WsServerMessageSchema = z.discriminatedUnion("type", [
  WsAuthOkSchema,
  PresenceMessageSchema,
  WsErrorSchema,
]);
export type WsServerMessage = z.infer<typeof WsServerMessageSchema>;
```

- [ ] **Step 7: Write `shared/src/index.ts`**

```ts
export * from "./auth.js";
export * from "./presence.js";
export * from "./leaderboard.js";
export * from "./ws.js";
```

- [ ] **Step 8: Write failing test `shared/test/schemas.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import {
  UsernameSchema,
  GameIdSchema,
  WsClientMessageSchema,
} from "../src/index.js";

describe("UsernameSchema", () => {
  it("accepts valid usernames", () => {
    expect(UsernameSchema.parse("alice_01")).toBe("alice_01");
  });
  it("rejects too short", () => {
    expect(() => UsernameSchema.parse("a")).toThrow();
  });
  it("rejects forbidden characters", () => {
    expect(() => UsernameSchema.parse("alice!")).toThrow();
  });
  it("trims whitespace", () => {
    expect(UsernameSchema.parse("  bob  ")).toBe("bob");
  });
});

describe("GameIdSchema", () => {
  it("accepts lowercase slug", () => {
    expect(GameIdSchema.parse("klondike")).toBe("klondike");
  });
  it("rejects uppercase", () => {
    expect(() => GameIdSchema.parse("Klondike")).toThrow();
  });
});

describe("WsClientMessageSchema", () => {
  it("parses auth messages", () => {
    const m = WsClientMessageSchema.parse({ type: "auth", token: "x.y.z" });
    expect(m.type).toBe("auth");
  });
  it("rejects unknown types", () => {
    expect(() => WsClientMessageSchema.parse({ type: "bogus" })).toThrow();
  });
});
```

- [ ] **Step 9: Install deps, run test, confirm pass**

```bash
cd /home/kasm-user/cards-and-such
npm install
npm -w @cards/shared run test
npm -w @cards/shared run typecheck
```

Expected: all tests pass, no TS errors.

- [ ] **Step 10: Commit**

```bash
git add shared/ package.json package-lock.json
git commit -m "feat(plan-a-task2): shared zod schemas for auth/presence/leaderboard/ws"
```

---

## Task 3: Scaffold `server/` package with Fastify

**Files:**
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `server/vitest.config.ts`
- Create: `server/src/config.ts`
- Create: `server/src/index.ts`
- Create: `server/test/health.test.ts`

- [ ] **Step 1: Write `server/package.json`**

```json
{
  "name": "@cards/server",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc -b",
    "start": "node dist/index.js",
    "typecheck": "tsc -b --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@cards/shared": "*",
    "@fastify/cors": "^9.0.1",
    "@fastify/rate-limit": "^9.1.0",
    "better-sqlite3": "^11.0.0",
    "fastify": "^4.27.0",
    "jose": "^5.4.0",
    "ws": "^8.17.1",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.10",
    "@types/node": "^20.14.0",
    "@types/ws": "^8.5.10",
    "tsx": "^4.15.0",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: Write `server/tsconfig.json`**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "dist",
    "rootDir": "src",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "references": [{ "path": "../shared" }]
}
```

- [ ] **Step 3: Write `server/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Write `server/src/config.ts`**

```ts
import { z } from "zod";

const ConfigSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 chars"),
  DB_PATH: z.string().default("./data/cards.db"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return ConfigSchema.parse(env);
}
```

- [ ] **Step 5: Write `server/src/index.ts`**

```ts
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
```

- [ ] **Step 6: Write failing test `server/test/health.test.ts`**

```ts
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
```

- [ ] **Step 7: Install, run, confirm pass**

```bash
cd /home/kasm-user/cards-and-such
npm install
npm -w @cards/server run typecheck
npm -w @cards/server run test
```

Expected: typecheck clean, 1 test passes.

- [ ] **Step 8: Commit**

```bash
git add server/ package.json package-lock.json
git commit -m "feat(plan-a-task3): fastify server scaffold with /health endpoint"
```

---

## Task 4: SQLite schema + migrations

**Files:**
- Create: `server/src/db/index.ts`
- Create: `server/src/db/migrations.ts`
- Create: `server/test/db.test.ts`
- Modify: `server/src/index.ts` (open DB at startup)

- [ ] **Step 1: Write `server/src/db/migrations.ts`**

```ts
import type Database from "better-sqlite3";

export const MIGRATIONS: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS users (
     username   TEXT PRIMARY KEY,
     created_at INTEGER NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS scores (
     id            INTEGER PRIMARY KEY AUTOINCREMENT,
     game_id       TEXT    NOT NULL,
     username      TEXT    NOT NULL REFERENCES users(username),
     score         INTEGER NOT NULL,
     settings_hash TEXT    NOT NULL,
     played_at     INTEGER NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS scores_by_game
     ON scores(game_id, settings_hash, score DESC)`,
  `CREATE INDEX IF NOT EXISTS scores_by_user ON scores(username)`,
  `CREATE TABLE IF NOT EXISTS ratings (
     game_id      TEXT NOT NULL,
     username     TEXT NOT NULL REFERENCES users(username),
     elo          INTEGER NOT NULL DEFAULT 1000,
     games_played INTEGER NOT NULL DEFAULT 0,
     PRIMARY KEY (game_id, username)
   )`,
];

export function runMigrations(db: Database.Database): void {
  const runOne = (sql: string): void => { db.prepare(sql).run(); };
  db.transaction(() => {
    for (const sql of MIGRATIONS) runOne(sql);
  })();
}
```

- [ ] **Step 2: Write `server/src/db/index.ts`**

```ts
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { runMigrations } from "./migrations.js";

export type Db = Database.Database;

export function openDb(path: string): Db {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  runMigrations(db);
  return db;
}
```

- [ ] **Step 3: Modify `server/src/index.ts` — open DB and decorate Fastify**

Replace the existing file with:

```ts
import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { loadConfig, type Config } from "./config.js";
import { openDb, type Db } from "./db/index.js";

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

  app.get("/health", async () => ({ ok: true }));
  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const config = loadConfig();
  const app = await buildApp(config);
  await app.listen({ port: config.PORT, host: "0.0.0.0" });
}
```

- [ ] **Step 4: Write failing test `server/test/db.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { openDb } from "../src/db/index.js";
import { runMigrations } from "../src/db/migrations.js";

describe("openDb", () => {
  it("creates an in-memory DB with all tables", () => {
    const db = openDb(":memory:");
    const tables = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
      )
      .all() as { name: string }[];
    expect(tables.map((t) => t.name)).toEqual(["ratings", "scores", "users"]);
    db.close();
  });

  it("is idempotent — running migrations twice is safe", () => {
    const db = openDb(":memory:");
    expect(() => runMigrations(db)).not.toThrow();
    db.close();
  });
});
```

- [ ] **Step 5: Run tests, confirm pass, commit**

```bash
cd /home/kasm-user/cards-and-such
npm -w @cards/server run typecheck
npm -w @cards/server run test
git add server/
git commit -m "feat(plan-a-task4): sqlite schema + migrations + db bootstrap"
```

---

## Task 5: JWT helper

**Files:**
- Create: `server/src/auth/jwt.ts`
- Create: `server/test/auth-jwt.test.ts`

- [ ] **Step 1: Write `server/src/auth/jwt.ts`**

```ts
import { SignJWT, jwtVerify } from "jose";
import type { Username, JwtClaims } from "@cards/shared";

const ALG = "HS256";
const EXPIRES_SEC = 60 * 60 * 24 * 30;

export interface Jwt {
  issue(username: Username): Promise<{ token: string; expiresAt: number }>;
  verify(token: string): Promise<JwtClaims>;
}

export function createJwt(secret: string): Jwt {
  const key = new TextEncoder().encode(secret);
  return {
    async issue(username) {
      const now = Math.floor(Date.now() / 1000);
      const exp = now + EXPIRES_SEC;
      const token = await new SignJWT({})
        .setProtectedHeader({ alg: ALG })
        .setSubject(username)
        .setIssuedAt(now)
        .setExpirationTime(exp)
        .sign(key);
      return { token, expiresAt: exp * 1000 };
    },
    async verify(token) {
      const { payload } = await jwtVerify(token, key, { algorithms: [ALG] });
      return { sub: payload.sub as string, iat: payload.iat!, exp: payload.exp! };
    },
  };
}
```

- [ ] **Step 2: Write failing test `server/test/auth-jwt.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { createJwt } from "../src/auth/jwt.js";

const SECRET = "test-secret-at-least-16-chars";

describe("createJwt", () => {
  it("issues a token that verifies with the right sub", async () => {
    const jwt = createJwt(SECRET);
    const { token, expiresAt } = await jwt.issue("alice");
    expect(token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
    expect(expiresAt).toBeGreaterThan(Date.now());
    const claims = await jwt.verify(token);
    expect(claims.sub).toBe("alice");
  });

  it("rejects a token signed with a different secret", async () => {
    const a = createJwt(SECRET);
    const b = createJwt("some-other-secret-123456789");
    const { token } = await a.issue("alice");
    await expect(b.verify(token)).rejects.toBeDefined();
  });
});
```

- [ ] **Step 3: Run + commit**

```bash
cd /home/kasm-user/cards-and-such
npm -w @cards/server run typecheck
npm -w @cards/server run test
git add server/
git commit -m "feat(plan-a-task5): JWT issue/verify helper"
```

---

## Task 6: Auth routes — claim + resume

**Files:**
- Create: `server/src/auth/routes.ts`
- Create: `server/test/helpers.ts`
- Create: `server/test/auth-routes.test.ts`
- Modify: `server/src/index.ts`

- [ ] **Step 1: Write `server/src/auth/routes.ts`**

```ts
import type { FastifyInstance } from "fastify";
import {
  ClaimRequestSchema,
  ResumeRequestSchema,
  AuthResponseSchema,
  type AuthResponse,
} from "@cards/shared";
import { createJwt } from "./jwt.js";

export async function registerAuthRoutes(app: FastifyInstance): Promise<void> {
  const jwt = createJwt(app.config.JWT_SECRET);
  const insertUser = app.db.prepare(
    "INSERT INTO users (username, created_at) VALUES (?, ?)",
  );
  const findUser = app.db.prepare(
    "SELECT username FROM users WHERE username = ?",
  );

  app.post("/auth/claim", async (req, reply) => {
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

  app.post("/auth/resume", async (req, reply) => {
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
```

- [ ] **Step 2: Write `server/test/helpers.ts`**

```ts
import { buildApp } from "../src/index.js";
import type { FastifyInstance } from "fastify";

export async function makeTestApp(): Promise<FastifyInstance> {
  const app = await buildApp({
    PORT: 0,
    JWT_SECRET: "test-secret-at-least-16-chars",
    DB_PATH: ":memory:",
    CORS_ORIGIN: "http://localhost:5173",
  });
  await app.ready();
  return app;
}
```

- [ ] **Step 3: Modify `server/src/index.ts` — register auth routes**

Add the import near the top:

```ts
import { registerAuthRoutes } from "./auth/routes.js";
```

Inside `buildApp`, after the `cors` registration and before `app.get("/health", ...)`:

```ts
  await registerAuthRoutes(app);
```

- [ ] **Step 4: Write failing test `server/test/auth-routes.test.ts`**

```ts
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { makeTestApp } from "./helpers.js";

describe("auth routes", () => {
  let app: FastifyInstance;
  beforeEach(async () => { app = await makeTestApp(); });
  afterEach(async () => { await app.close(); });

  it("claim issues a token for a fresh username", async () => {
    const res = await app.inject({
      method: "POST", url: "/auth/claim",
      payload: { username: "alice" },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { username: string; token: string; expiresAt: number };
    expect(body.username).toBe("alice");
    expect(body.token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
    expect(body.expiresAt).toBeGreaterThan(Date.now());
  });

  it("claim conflicts on a taken username", async () => {
    await app.inject({ method: "POST", url: "/auth/claim", payload: { username: "bob" } });
    const res = await app.inject({ method: "POST", url: "/auth/claim", payload: { username: "bob" } });
    expect(res.statusCode).toBe(409);
  });

  it("claim 400s on an invalid username", async () => {
    const res = await app.inject({ method: "POST", url: "/auth/claim", payload: { username: "x" } });
    expect(res.statusCode).toBe(400);
  });

  it("resume works for an existing username", async () => {
    await app.inject({ method: "POST", url: "/auth/claim", payload: { username: "carol" } });
    const res = await app.inject({ method: "POST", url: "/auth/resume", payload: { username: "carol" } });
    expect(res.statusCode).toBe(200);
  });

  it("resume 404s for an unknown username", async () => {
    const res = await app.inject({ method: "POST", url: "/auth/resume", payload: { username: "ghost" } });
    expect(res.statusCode).toBe(404);
  });
});
```

- [ ] **Step 5: Run + commit**

```bash
cd /home/kasm-user/cards-and-such
npm -w @cards/server run typecheck
npm -w @cards/server run test
git add server/
git commit -m "feat(plan-a-task6): /auth/claim and /auth/resume with JWT"
```

---

## Task 7: Rate limiting on auth routes

**Files:**
- Create: `server/src/http/plugins.ts`
- Modify: `server/src/index.ts`
- Modify: `server/src/auth/routes.ts`
- Modify: `server/test/auth-routes.test.ts`

- [ ] **Step 1: Write `server/src/http/plugins.ts`**

```ts
import type { FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";

export async function registerRateLimit(app: FastifyInstance): Promise<void> {
  await app.register(rateLimit, {
    global: false,
    keyGenerator: (req) => req.ip,
  });
}
```

- [ ] **Step 2: Modify `server/src/index.ts` — register rate-limit before routes**

Add import:
```ts
import { registerRateLimit } from "./http/plugins.js";
```

Inside `buildApp`, after `cors` and before `registerAuthRoutes`:
```ts
  await registerRateLimit(app);
```

- [ ] **Step 3: Replace `server/src/auth/routes.ts` with the rate-limited version**

```ts
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
```

- [ ] **Step 4: Append a test to `server/test/auth-routes.test.ts`**

```ts
it("claim rate-limits after 20 attempts per IP/hour", async () => {
  for (let i = 0; i < 20; i++) {
    await app.inject({
      method: "POST", url: "/auth/claim",
      payload: { username: `user${i}` },
    });
  }
  const res = await app.inject({
    method: "POST", url: "/auth/claim",
    payload: { username: "user-over-limit" },
  });
  expect(res.statusCode).toBe(429);
});
```

- [ ] **Step 5: Run + commit**

```bash
cd /home/kasm-user/cards-and-such
npm -w @cards/server run typecheck
npm -w @cards/server run test
git add server/
git commit -m "feat(plan-a-task7): rate-limit auth routes"
```

---

## Task 8: WebSocket server + auth handshake

**Files:**
- Create: `server/src/ws/server.ts`
- Create: `server/test/ws-auth.test.ts`
- Modify: `server/src/index.ts`

- [ ] **Step 1: Write `server/src/ws/server.ts`**

```ts
import { WebSocketServer, type WebSocket } from "ws";
import type { FastifyInstance } from "fastify";
import {
  WsClientMessageSchema,
  type WsServerMessage,
} from "@cards/shared";
import { createJwt } from "../auth/jwt.js";

export interface WsClient { socket: WebSocket; username: string }
export interface WsHub { wss: WebSocketServer; clients: Map<WebSocket, WsClient>; }

export function attachWs(app: FastifyInstance): WsHub {
  const jwt = createJwt(app.config.JWT_SECRET);
  const wss = new WebSocketServer({ server: app.server, path: "/ws" });
  const clients = new Map<WebSocket, WsClient>();

  wss.on("connection", (socket) => {
    const authTimer = setTimeout(() => {
      sendError(socket, "auth_timeout");
      socket.close(1008, "auth_timeout");
    }, 5000);

    socket.on("message", async (raw) => {
      let parsed;
      try { parsed = WsClientMessageSchema.parse(JSON.parse(raw.toString())); }
      catch { return sendError(socket, "bad_message"); }

      if (parsed.type === "auth") {
        try {
          const claims = await jwt.verify(parsed.token);
          clearTimeout(authTimer);
          clients.set(socket, { socket, username: claims.sub });
          send(socket, { type: "auth_ok" });
        } catch {
          sendError(socket, "bad_token");
          socket.close(1008, "bad_token");
        }
        return;
      }

      if (!clients.has(socket)) return sendError(socket, "not_authenticated");
      // subscribe handled in Task 9.
    });

    socket.on("close", () => {
      clearTimeout(authTimer);
      clients.delete(socket);
    });
  });

  app.addHook("onClose", () => new Promise<void>((r) => wss.close(() => r())));
  return { wss, clients };
}

function send(socket: WebSocket, msg: WsServerMessage): void {
  socket.send(JSON.stringify(msg));
}
function sendError(socket: WebSocket, reason: string): void {
  send(socket, { type: "error", reason });
}
```

- [ ] **Step 2: Modify `server/src/index.ts` to attach WS after routes**

Add import:
```ts
import { attachWs, type WsHub } from "./ws/server.js";
```

Add to the module augmentation:
```ts
declare module "fastify" {
  interface FastifyInstance {
    db: Db;
    config: Config;
    ws: WsHub;
  }
}
```

Inside `buildApp`, **after** all route registrations and **before** the function returns:
```ts
  await app.ready();
  const ws = attachWs(app);
  app.decorate("ws", ws);
```

Note: `app.ready()` ensures the HTTP server exists so `ws` can attach to it.

- [ ] **Step 3: Write failing test `server/test/ws-auth.test.ts`**

```ts
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import WebSocket from "ws";
import type { FastifyInstance } from "fastify";
import { makeTestApp } from "./helpers.js";

async function startListening(app: FastifyInstance): Promise<number> {
  const addr = await app.listen({ port: 0, host: "127.0.0.1" });
  return Number(/:(\d+)$/.exec(addr)![1]);
}

async function claim(app: FastifyInstance, username: string): Promise<string> {
  const res = await app.inject({
    method: "POST", url: "/auth/claim",
    payload: { username },
  });
  return (res.json() as { token: string }).token;
}

function recv(ws: WebSocket): Promise<unknown> {
  return new Promise((resolve, reject) => {
    ws.once("message", (d) => resolve(JSON.parse(d.toString())));
    ws.once("error", reject);
  });
}

describe("ws auth handshake", () => {
  let app: FastifyInstance;
  let port: number;

  beforeEach(async () => { app = await makeTestApp(); port = await startListening(app); });
  afterEach(async () => { await app.close(); });

  it("accepts a valid token and replies auth_ok", async () => {
    const token = await claim(app, "alice");
    const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
    await new Promise((r) => ws.once("open", r));
    ws.send(JSON.stringify({ type: "auth", token }));
    const msg = await recv(ws);
    expect(msg).toEqual({ type: "auth_ok" });
    ws.close();
  });

  it("rejects a bogus token", async () => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
    await new Promise((r) => ws.once("open", r));
    ws.send(JSON.stringify({ type: "auth", token: "not-a-jwt" }));
    const msg = await recv(ws);
    expect((msg as { type: string }).type).toBe("error");
  });
});
```

- [ ] **Step 4: Run + commit**

```bash
cd /home/kasm-user/cards-and-such
npm -w @cards/server run typecheck
npm -w @cards/server run test
git add server/
git commit -m "feat(plan-a-task8): websocket server with JWT handshake"
```

---

## Task 9: Presence tracking + lobby broadcast

**Files:**
- Create: `server/src/ws/presence.ts`
- Modify: `server/src/ws/server.ts`
- Create: `server/test/ws-presence.test.ts`

- [ ] **Step 1: Write `server/src/ws/presence.ts`**

```ts
import type { WebSocket } from "ws";
import type { PresenceMessage, WsServerMessage } from "@cards/shared";

export interface PresenceEntry {
  socket: WebSocket;
  username: string;
  game: string | null;
}

export class PresenceRegistry {
  private readonly byUser = new Map<string, PresenceEntry>();
  private readonly lobbySubscribers = new Set<WebSocket>();
  private pending: NodeJS.Timeout | null = null;
  private readonly debounceMs = 500;

  add(entry: PresenceEntry): void {
    this.byUser.set(entry.username, entry);
    this.schedule();
  }

  remove(username: string): void {
    this.byUser.delete(username);
    this.schedule();
  }

  subscribeLobby(socket: WebSocket): void {
    this.lobbySubscribers.add(socket);
    this.sendTo(socket);
  }

  unsubscribeLobby(socket: WebSocket): void {
    this.lobbySubscribers.delete(socket);
  }

  private schedule(): void {
    if (this.pending) return;
    this.pending = setTimeout(() => {
      this.pending = null;
      this.lobbySubscribers.forEach((s) => this.sendTo(s));
    }, this.debounceMs);
  }

  private sendTo(socket: WebSocket): void {
    const msg: PresenceMessage = {
      type: "presence",
      online: this.byUser.size,
      users: [...this.byUser.values()].map((e) => ({
        username: e.username,
        game: e.game,
      })),
    };
    const wire: WsServerMessage = msg;
    socket.send(JSON.stringify(wire));
  }
}
```

- [ ] **Step 2: Modify `server/src/ws/server.ts` — replace the whole file**

```ts
import { WebSocketServer, type WebSocket } from "ws";
import type { FastifyInstance } from "fastify";
import {
  WsClientMessageSchema,
  type WsServerMessage,
} from "@cards/shared";
import { createJwt } from "../auth/jwt.js";
import { PresenceRegistry } from "./presence.js";

export interface WsClient { socket: WebSocket; username: string }
export interface WsHub { wss: WebSocketServer; presence: PresenceRegistry; }

export function attachWs(app: FastifyInstance): WsHub {
  const jwt = createJwt(app.config.JWT_SECRET);
  const wss = new WebSocketServer({ server: app.server, path: "/ws" });
  const clients = new Map<WebSocket, WsClient>();
  const presence = new PresenceRegistry();

  wss.on("connection", (socket) => {
    const authTimer = setTimeout(() => {
      sendError(socket, "auth_timeout");
      socket.close(1008, "auth_timeout");
    }, 5000);

    socket.on("message", async (raw) => {
      let parsed;
      try { parsed = WsClientMessageSchema.parse(JSON.parse(raw.toString())); }
      catch { return sendError(socket, "bad_message"); }

      if (parsed.type === "auth") {
        try {
          const claims = await jwt.verify(parsed.token);
          clearTimeout(authTimer);
          clients.set(socket, { socket, username: claims.sub });
          presence.add({ socket, username: claims.sub, game: null });
          send(socket, { type: "auth_ok" });
        } catch {
          sendError(socket, "bad_token");
          socket.close(1008, "bad_token");
        }
        return;
      }

      const client = clients.get(socket);
      if (!client) return sendError(socket, "not_authenticated");

      if (parsed.type === "subscribe" && parsed.channel === "lobby") {
        presence.subscribeLobby(socket);
      }
    });

    socket.on("close", () => {
      clearTimeout(authTimer);
      const client = clients.get(socket);
      if (client) {
        presence.remove(client.username);
        clients.delete(socket);
      }
      presence.unsubscribeLobby(socket);
    });
  });

  app.addHook("onClose", () => new Promise<void>((r) => wss.close(() => r())));
  return { wss, presence };
}

function send(socket: WebSocket, msg: WsServerMessage): void {
  socket.send(JSON.stringify(msg));
}
function sendError(socket: WebSocket, reason: string): void {
  send(socket, { type: "error", reason });
}
```

- [ ] **Step 3: Write failing test `server/test/ws-presence.test.ts`**

```ts
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import WebSocket from "ws";
import type { FastifyInstance } from "fastify";
import { makeTestApp } from "./helpers.js";

async function startListening(app: FastifyInstance): Promise<number> {
  const addr = await app.listen({ port: 0, host: "127.0.0.1" });
  return Number(/:(\d+)$/.exec(addr)![1]);
}
async function claim(app: FastifyInstance, username: string): Promise<string> {
  const res = await app.inject({
    method: "POST", url: "/auth/claim",
    payload: { username },
  });
  return (res.json() as { token: string }).token;
}
async function openAndAuth(url: string, token: string): Promise<WebSocket> {
  const ws = new WebSocket(url);
  await new Promise((r) => ws.once("open", r));
  await new Promise<void>((resolve, reject) => {
    ws.once("message", (d) => {
      const msg = JSON.parse(d.toString());
      if (msg.type === "auth_ok") resolve();
      else reject(new Error(`expected auth_ok, got ${JSON.stringify(msg)}`));
    });
    ws.send(JSON.stringify({ type: "auth", token }));
  });
  return ws;
}
function nextMessage(ws: WebSocket): Promise<{ type: string; online?: number; users?: { username: string }[] }> {
  return new Promise((resolve) => {
    ws.once("message", (d) => resolve(JSON.parse(d.toString())));
  });
}

describe("ws presence", () => {
  let app: FastifyInstance;
  let port: number;
  beforeEach(async () => { app = await makeTestApp(); port = await startListening(app); });
  afterEach(async () => { await app.close(); });

  it("sends a presence snapshot on lobby subscribe", async () => {
    const t1 = await claim(app, "alice");
    const t2 = await claim(app, "bob");
    const ws1 = await openAndAuth(`ws://127.0.0.1:${port}/ws`, t1);
    const ws2 = await openAndAuth(`ws://127.0.0.1:${port}/ws`, t2);
    ws1.send(JSON.stringify({ type: "subscribe", channel: "lobby" }));
    const snap = await nextMessage(ws1);
    expect(snap.type).toBe("presence");
    expect(snap.online).toBe(2);
    const usernames = (snap.users ?? []).map((u) => u.username).sort();
    expect(usernames).toEqual(["alice", "bob"]);
    ws1.close(); ws2.close();
  });

  it("broadcasts on disconnect (debounced)", async () => {
    const t1 = await claim(app, "alice");
    const t2 = await claim(app, "bob");
    const ws1 = await openAndAuth(`ws://127.0.0.1:${port}/ws`, t1);
    const ws2 = await openAndAuth(`ws://127.0.0.1:${port}/ws`, t2);
    ws1.send(JSON.stringify({ type: "subscribe", channel: "lobby" }));
    await nextMessage(ws1); // initial snapshot
    ws2.close();
    const update = await nextMessage(ws1);
    expect(update.type).toBe("presence");
    expect(update.online).toBe(1);
    ws1.close();
  });
});
```

- [ ] **Step 4: Run + commit**

```bash
cd /home/kasm-user/cards-and-such
npm -w @cards/server run typecheck
npm -w @cards/server run test
git add server/
git commit -m "feat(plan-a-task9): presence registry and lobby broadcast"
```

---

## Task 10: Leaderboard read endpoints

**Files:**
- Create: `server/src/leaderboard/routes.ts`
- Create: `server/test/leaderboard.test.ts`
- Modify: `server/src/index.ts`

- [ ] **Step 1: Write `server/src/leaderboard/routes.ts`**

```ts
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
```

- [ ] **Step 2: Modify `server/src/index.ts` to register leaderboard routes**

Add import:
```ts
import { registerLeaderboardRoutes } from "./leaderboard/routes.js";
```

Call after `registerAuthRoutes(app)`:
```ts
  await registerLeaderboardRoutes(app);
```

- [ ] **Step 3: Write failing test `server/test/leaderboard.test.ts`**

```ts
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { makeTestApp } from "./helpers.js";

function seedUser(app: FastifyInstance, username: string): void {
  app.db.prepare("INSERT INTO users (username, created_at) VALUES (?, ?)")
    .run(username, Date.now());
}
function seedScore(app: FastifyInstance, username: string, gameId: string, score: number): void {
  app.db.prepare(
    `INSERT INTO scores (game_id, username, score, settings_hash, played_at)
     VALUES (?, ?, ?, 'default00', ?)`,
  ).run(gameId, username, score, Date.now());
}

describe("GET /leaderboard/game/:gameId", () => {
  let app: FastifyInstance;
  beforeEach(async () => { app = await makeTestApp(); });
  afterEach(async () => { await app.close(); });

  it("returns ordered top scores", async () => {
    seedUser(app, "alice"); seedUser(app, "bob");
    seedScore(app, "alice", "klondike", 120);
    seedScore(app, "bob", "klondike", 300);
    seedScore(app, "alice", "klondike", 250);
    const res = await app.inject({ method: "GET", url: "/leaderboard/game/klondike" });
    expect(res.statusCode).toBe(200);
    const body = res.json() as Array<{ rank: number; username: string; score: number }>;
    expect(body.map((r) => [r.rank, r.username, r.score])).toEqual([
      [1, "bob", 300], [2, "alice", 250], [3, "alice", 120],
    ]);
  });

  it("rejects a bad game id", async () => {
    const res = await app.inject({ method: "GET", url: "/leaderboard/game/BAD%20ID" });
    expect(res.statusCode).toBe(400);
  });
});

describe("GET /leaderboard/global", () => {
  let app: FastifyInstance;
  beforeEach(async () => { app = await makeTestApp(); });
  afterEach(async () => { await app.close(); });

  it("totals games played across all games", async () => {
    seedUser(app, "alice"); seedUser(app, "bob");
    seedScore(app, "alice", "klondike", 100);
    seedScore(app, "alice", "freecell", 200);
    seedScore(app, "bob", "klondike", 50);
    const res = await app.inject({ method: "GET", url: "/leaderboard/global" });
    const body = res.json() as Array<{ rank: number; username: string; gamesPlayed: number }>;
    expect(body).toEqual([
      { rank: 1, username: "alice", gamesPlayed: 2 },
      { rank: 2, username: "bob", gamesPlayed: 1 },
    ]);
  });
});
```

- [ ] **Step 4: Run + commit**

```bash
cd /home/kasm-user/cards-and-such
npm -w @cards/server run typecheck
npm -w @cards/server run test
git add server/
git commit -m "feat(plan-a-task10): leaderboard read endpoints"
```

---

## Task 11: Score submit endpoint (JWT-protected)

**Files:**
- Modify: `server/src/leaderboard/routes.ts`
- Modify: `server/test/leaderboard.test.ts`

- [ ] **Step 1: Add the route to `server/src/leaderboard/routes.ts`**

At the top, add imports:
```ts
import { ScoreSubmitSchema } from "@cards/shared";
import { createJwt } from "../auth/jwt.js";
```

Inside `registerLeaderboardRoutes`, after the existing statements:

```ts
  const jwt = createJwt(app.config.JWT_SECRET);
  const insertScore = app.db.prepare(
    `INSERT INTO scores (game_id, username, score, settings_hash, played_at)
     VALUES (?, ?, ?, ?, ?)`,
  );

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
```

- [ ] **Step 2: Append tests to `server/test/leaderboard.test.ts`**

```ts
async function claim(app: FastifyInstance, username: string): Promise<string> {
  const r = await app.inject({ method: "POST", url: "/auth/claim", payload: { username } });
  return (r.json() as { token: string }).token;
}

describe("POST /scores", () => {
  let app: FastifyInstance;
  beforeEach(async () => { app = await makeTestApp(); });
  afterEach(async () => { await app.close(); });

  it("rejects without token", async () => {
    const res = await app.inject({
      method: "POST", url: "/scores",
      payload: { gameId: "klondike", score: 100, settingsHash: "abcdefgh" },
    });
    expect(res.statusCode).toBe(401);
  });

  it("accepts with a valid token", async () => {
    const token = await claim(app, "alice");
    const res = await app.inject({
      method: "POST", url: "/scores",
      headers: { authorization: `Bearer ${token}` },
      payload: { gameId: "klondike", score: 100, settingsHash: "abcdefgh" },
    });
    expect(res.statusCode).toBe(201);
    const row = app.db.prepare("SELECT username, score FROM scores WHERE game_id = 'klondike'").get() as { username: string; score: number };
    expect(row).toEqual({ username: "alice", score: 100 });
  });

  it("400s on bad payload", async () => {
    const token = await claim(app, "bob");
    const res = await app.inject({
      method: "POST", url: "/scores",
      headers: { authorization: `Bearer ${token}` },
      payload: { gameId: "klondike", score: 100, settingsHash: "too-long-xxxxxx" },
    });
    expect(res.statusCode).toBe(400);
  });
});
```

- [ ] **Step 3: Run + commit**

```bash
cd /home/kasm-user/cards-and-such
npm -w @cards/server run typecheck
npm -w @cards/server run test
git add server/
git commit -m "feat(plan-a-task11): POST /scores with JWT auth"
```

---

## Task 12: Scaffold `web/` with Vite + React

**Files:**
- Create: `web/package.json`
- Create: `web/tsconfig.json`
- Create: `web/tsconfig.node.json`
- Create: `web/vite.config.ts`
- Create: `web/vitest.config.ts`
- Create: `web/test/setup.ts`
- Create: `web/index.html`
- Create: `web/src/main.tsx`
- Create: `web/src/App.tsx`
- Create: `web/src/App.css`
- Create: `web/test/App.test.tsx`

- [ ] **Step 1: Write `web/package.json`**

```json
{
  "name": "@cards/web",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc -b --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@cards/shared": "*",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.23.0",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.5",
    "@testing-library/react": "^15.0.7",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "jsdom": "^24.0.0",
    "vite": "^5.2.11",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: Write `web/tsconfig.json`**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "dist",
    "rootDir": "src",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "types": []
  },
  "include": ["src/**/*", "test/**/*"],
  "references": [
    { "path": "./tsconfig.node.json" },
    { "path": "../shared" }
  ]
}
```

- [ ] **Step 3: Write `web/tsconfig.node.json`**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "types": ["node"]
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

- [ ] **Step 4: Write `web/vite.config.ts`**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:4000", changeOrigin: true, rewrite: (p) => p.replace(/^\/api/, "") },
      "/ws": { target: "ws://localhost:4000", ws: true },
    },
  },
});
```

- [ ] **Step 5: Write `web/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["test/**/*.test.tsx", "test/**/*.test.ts"],
  },
});
```

- [ ] **Step 6: Write `web/test/setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 7: Write `web/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cards and Such</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Write `web/src/main.tsx`**

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.js";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
```

- [ ] **Step 9: Write `web/src/App.tsx`**

```tsx
import { Routes, Route } from "react-router-dom";

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<div data-testid="placeholder-home">Cards and Such — home</div>} />
    </Routes>
  );
}
```

- [ ] **Step 10: Write `web/src/App.css`**

```css
:root { color-scheme: dark; }
body { margin: 0; font-family: system-ui, sans-serif; background: #0b0b12; color: #f4f4fb; }
```

- [ ] **Step 11: Write failing test `web/test/App.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App.js";

describe("App", () => {
  it("renders the home placeholder at /", () => {
    render(<MemoryRouter initialEntries={["/"]}><App /></MemoryRouter>);
    expect(screen.getByTestId("placeholder-home")).toBeInTheDocument();
  });
});
```

- [ ] **Step 12: Install, run, commit**

```bash
cd /home/kasm-user/cards-and-such
npm install
npm -w @cards/web run typecheck
npm -w @cards/web run test
git add web/ package.json package-lock.json
git commit -m "feat(plan-a-task12): web scaffold with Vite + React + Vitest"
```

---

## Task 13: Auth store (Zustand) + HTTP client

**Files:**
- Create: `web/src/platform/api/http.ts`
- Create: `web/src/platform/stores/auth.ts`
- Create: `web/test/auth-store.test.tsx`

- [ ] **Step 1: Write `web/src/platform/api/http.ts`**

```ts
import {
  AuthResponseSchema,
  type AuthResponse,
  type Username,
} from "@cards/shared";

const API_BASE = "/api";

async function postJson<T>(url: string, body: unknown, schema: { parse(v: unknown): T }, token?: string): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `http_${res.status}` }));
    throw new Error((err as { error?: string }).error ?? `http_${res.status}`);
  }
  const json = await res.json();
  return schema.parse(json);
}

export async function claimUsername(username: Username): Promise<AuthResponse> {
  return postJson("/auth/claim", { username }, AuthResponseSchema);
}
export async function resumeUsername(username: Username): Promise<AuthResponse> {
  return postJson("/auth/resume", { username }, AuthResponseSchema);
}
```

- [ ] **Step 2: Write `web/src/platform/stores/auth.ts`**

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { claimUsername, resumeUsername } from "../api/http.js";
import type { Username } from "@cards/shared";

interface AuthState {
  username: string | null;
  token: string | null;
  expiresAt: number | null;
  status: "idle" | "loading" | "error";
  error: string | null;
  claim(username: Username): Promise<void>;
  resume(username: Username): Promise<void>;
  logout(): void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      username: null, token: null, expiresAt: null,
      status: "idle", error: null,

      async claim(username) {
        set({ status: "loading", error: null });
        try {
          const r = await claimUsername(username);
          set({ username: r.username, token: r.token, expiresAt: r.expiresAt, status: "idle" });
        } catch (e) {
          set({ status: "error", error: (e as Error).message });
        }
      },
      async resume(username) {
        set({ status: "loading", error: null });
        try {
          const r = await resumeUsername(username);
          set({ username: r.username, token: r.token, expiresAt: r.expiresAt, status: "idle" });
        } catch (e) {
          set({ status: "error", error: (e as Error).message });
        }
      },
      logout() {
        set({ username: null, token: null, expiresAt: null, status: "idle", error: null });
      },
    }),
    { name: "cards-auth" },
  ),
);
```

- [ ] **Step 3: Write failing test `web/test/auth-store.test.tsx`**

```tsx
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "../src/platform/stores/auth.js";

describe("useAuth store", () => {
  beforeEach(() => {
    useAuth.getState().logout();
    vi.restoreAllMocks();
  });

  it("claim stores the token on success", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(
      JSON.stringify({ username: "alice", token: "tok.tok.tok", expiresAt: Date.now() + 1000 * 60 }),
      { status: 200, headers: { "content-type": "application/json" } },
    ));
    await useAuth.getState().claim("alice");
    const s = useAuth.getState();
    expect(s.username).toBe("alice");
    expect(s.token).toBe("tok.tok.tok");
    expect(s.status).toBe("idle");
  });

  it("claim records an error on 409", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(
      JSON.stringify({ error: "username_taken" }),
      { status: 409, headers: { "content-type": "application/json" } },
    ));
    await useAuth.getState().claim("bob");
    expect(useAuth.getState().status).toBe("error");
    expect(useAuth.getState().error).toBe("username_taken");
  });
});
```

- [ ] **Step 4: Run + commit**

```bash
cd /home/kasm-user/cards-and-such
npm -w @cards/web run typecheck
npm -w @cards/web run test
git add web/
git commit -m "feat(plan-a-task13): zustand auth store + http client"
```

---

## Task 14: Login page

**Files:**
- Create: `web/src/pages/LoginPage.tsx`
- Create: `web/src/pages/LoginPage.css`
- Modify: `web/src/App.tsx`
- Create: `web/test/LoginPage.test.tsx`

- [ ] **Step 1: Write `web/src/pages/LoginPage.tsx`**

```tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../platform/stores/auth.js";
import { UsernameSchema } from "@cards/shared";
import "./LoginPage.css";

export default function LoginPage(): JSX.Element {
  const [username, setUsername] = useState("");
  const [mode, setMode] = useState<"claim" | "resume">("claim");
  const claim = useAuth((s) => s.claim);
  const resume = useAuth((s) => s.resume);
  const status = useAuth((s) => s.status);
  const error = useAuth((s) => s.error);
  const token = useAuth((s) => s.token);
  const navigate = useNavigate();

  if (token) { setTimeout(() => navigate("/"), 0); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = UsernameSchema.safeParse(username);
    if (!parsed.success) return;
    if (mode === "claim") await claim(parsed.data);
    else await resume(parsed.data);
  }

  return (
    <div className="login-page" data-testid="login-page">
      <h1>Cards and Such</h1>
      <form onSubmit={submit} className="login-form">
        <label>
          Username
          <input
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="your_username"
            aria-label="username"
          />
        </label>
        <div className="mode-switch">
          <button type="button" className={mode === "claim" ? "on" : ""} onClick={() => setMode("claim")}>Claim new</button>
          <button type="button" className={mode === "resume" ? "on" : ""} onClick={() => setMode("resume")}>Resume existing</button>
        </div>
        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "..." : mode === "claim" ? "Claim" : "Resume"}
        </button>
        {error && <div role="alert" className="error">{error}</div>}
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Write `web/src/pages/LoginPage.css`**

```css
.login-page { max-width: 420px; margin: 10vh auto; padding: 2rem; }
.login-page h1 { font-size: 2rem; margin-bottom: 1.5rem; }
.login-form { display: flex; flex-direction: column; gap: 1rem; }
.login-form label { display: flex; flex-direction: column; gap: 0.25rem; }
.login-form input { padding: 0.75rem; border-radius: 6px; border: 1px solid #333; background: #16161e; color: inherit; font-size: 1rem; }
.mode-switch { display: flex; gap: 0.5rem; }
.mode-switch button { flex: 1; padding: 0.5rem; border-radius: 6px; border: 1px solid #333; background: transparent; color: inherit; cursor: pointer; }
.mode-switch button.on { background: #3a3a4e; }
.login-form > button[type="submit"] { padding: 0.75rem; border-radius: 6px; border: 0; background: #5a5af2; color: white; font-weight: 600; cursor: pointer; }
.login-form > button[type="submit"][disabled] { opacity: 0.6; cursor: default; }
.error { color: #ff7070; }
```

- [ ] **Step 3: Modify `web/src/App.tsx` to add the route**

```tsx
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage.js";

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<div data-testid="placeholder-home">Cards and Such — home</div>} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}
```

- [ ] **Step 4: Write failing test `web/test/LoginPage.test.tsx`**

```tsx
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "../src/pages/LoginPage.js";
import { useAuth } from "../src/platform/stores/auth.js";

describe("LoginPage", () => {
  beforeEach(() => {
    useAuth.getState().logout();
    vi.restoreAllMocks();
  });

  it("calls claim with the typed username", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(
      JSON.stringify({ username: "alice", token: "t.t.t", expiresAt: Date.now() + 10000 }),
      { status: 200, headers: { "content-type": "application/json" } },
    ));
    const user = userEvent.setup();
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    await user.type(screen.getByLabelText(/username/i), "alice");
    await user.click(screen.getByRole("button", { name: /^claim$/i }));
    expect(useAuth.getState().username).toBe("alice");
  });

  it("shows an error when the username is taken", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(
      JSON.stringify({ error: "username_taken" }),
      { status: 409, headers: { "content-type": "application/json" } },
    ));
    const user = userEvent.setup();
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    await user.type(screen.getByLabelText(/username/i), "taken");
    await user.click(screen.getByRole("button", { name: /^claim$/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent("username_taken");
  });
});
```

- [ ] **Step 5: Run + commit**

```bash
cd /home/kasm-user/cards-and-such
npm -w @cards/web run typecheck
npm -w @cards/web run test
git add web/
git commit -m "feat(plan-a-task14): login page with claim/resume modes"
```

---

## Task 15: App shell + RequireAuth + logout

**Files:**
- Create: `web/src/platform/AppShell.tsx`
- Create: `web/src/platform/AppShell.css`
- Create: `web/src/platform/RequireAuth.tsx`
- Modify: `web/src/App.tsx`
- Create: `web/test/AppShell.test.tsx`

- [ ] **Step 1: Write `web/src/platform/RequireAuth.tsx`**

```tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "./stores/auth.js";

export function RequireAuth({ children }: { children: React.ReactNode }): JSX.Element {
  const token = useAuth((s) => s.token);
  const expiresAt = useAuth((s) => s.expiresAt);
  if (!token || !expiresAt || expiresAt <= Date.now()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
```

- [ ] **Step 2: Write `web/src/platform/AppShell.tsx`**

```tsx
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "./stores/auth.js";
import "./AppShell.css";

export default function AppShell(): JSX.Element {
  const username = useAuth((s) => s.username);
  const logout = useAuth((s) => s.logout);
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">Cards and Such</div>
        <nav>
          <NavLink to="/" end>Lobby</NavLink>
          <NavLink to="/leaderboard">Leaderboard</NavLink>
        </nav>
        <div className="user">
          <span data-testid="current-user">{username}</span>
          <button onClick={logout} aria-label="logout">Sign out</button>
        </div>
      </header>
      <main><Outlet /></main>
    </div>
  );
}
```

- [ ] **Step 3: Write `web/src/platform/AppShell.css`**

```css
.app-shell { min-height: 100vh; display: grid; grid-template-rows: 56px 1fr; }
.app-header { display: flex; align-items: center; justify-content: space-between; padding: 0 1.25rem; background: #141421; border-bottom: 1px solid #23233a; }
.app-header .brand { font-weight: 700; }
.app-header nav { display: flex; gap: 1rem; }
.app-header nav a { color: #c6c6d8; text-decoration: none; padding: 0.25rem 0.5rem; border-radius: 4px; }
.app-header nav a.active { background: #2a2a42; color: white; }
.app-header .user { display: flex; align-items: center; gap: 0.75rem; }
.app-header .user button { background: transparent; color: inherit; border: 1px solid #333; border-radius: 4px; padding: 0.25rem 0.5rem; cursor: pointer; }
main { padding: 1.5rem; }
```

- [ ] **Step 4: Modify `web/src/App.tsx`**

```tsx
import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./platform/AppShell.js";
import { RequireAuth } from "./platform/RequireAuth.js";
import LoginPage from "./pages/LoginPage.js";

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={<RequireAuth><AppShell /></RequireAuth>}
      >
        <Route path="/" element={<div data-testid="placeholder-home">Lobby placeholder — games come in Plan B</div>} />
        <Route path="/leaderboard" element={<div data-testid="placeholder-leaderboard">Leaderboard placeholder</div>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
```

- [ ] **Step 5: Write failing test `web/test/AppShell.test.tsx`**

```tsx
import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App.js";
import { useAuth } from "../src/platform/stores/auth.js";

function authenticate() {
  useAuth.setState({ username: "alice", token: "tok.tok.tok", expiresAt: Date.now() + 1000 * 60 });
}

describe("AppShell", () => {
  beforeEach(() => useAuth.getState().logout());

  it("redirects unauthenticated users to /login", () => {
    render(<MemoryRouter initialEntries={["/"]}><App /></MemoryRouter>);
    expect(screen.getByTestId("login-page")).toBeInTheDocument();
  });

  it("shows the lobby placeholder when authenticated", () => {
    authenticate();
    render(<MemoryRouter initialEntries={["/"]}><App /></MemoryRouter>);
    expect(screen.getByTestId("placeholder-home")).toBeInTheDocument();
    expect(screen.getByTestId("current-user")).toHaveTextContent("alice");
  });

  it("logout clears the store", async () => {
    authenticate();
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={["/"]}><App /></MemoryRouter>);
    await user.click(screen.getByRole("button", { name: /logout/i }));
    expect(useAuth.getState().token).toBeNull();
  });
});
```

- [ ] **Step 6: Run + commit**

```bash
cd /home/kasm-user/cards-and-such
npm -w @cards/web run typecheck
npm -w @cards/web run test
git add web/
git commit -m "feat(plan-a-task15): app shell, nav, logout, and RequireAuth guard"
```

---

## Task 16: WebSocket client hook

**Files:**
- Create: `web/src/platform/api/ws.ts`
- Create: `web/test/ws-hook.test.tsx`

- [ ] **Step 1: Write `web/src/platform/api/ws.ts`**

```ts
import { useEffect, useState } from "react";
import {
  PresenceMessageSchema,
  WsServerMessageSchema,
  type PresenceMessage,
} from "@cards/shared";

const WS_URL = `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/ws`;

export interface LobbyPresence {
  online: number;
  users: { username: string; game: string | null }[];
  connected: boolean;
}

export function useLobbyPresence(token: string | null): LobbyPresence {
  const [state, setState] = useState<LobbyPresence>({ online: 0, users: [], connected: false });

  useEffect(() => {
    if (!token) return;
    const ws = new WebSocket(WS_URL);

    ws.addEventListener("open", () => {
      ws.send(JSON.stringify({ type: "auth", token }));
    });

    ws.addEventListener("message", (ev) => {
      let parsed;
      try { parsed = WsServerMessageSchema.parse(JSON.parse(ev.data)); }
      catch { return; }
      if (parsed.type === "auth_ok") {
        setState((s) => ({ ...s, connected: true }));
        ws.send(JSON.stringify({ type: "subscribe", channel: "lobby" }));
      } else if (parsed.type === "presence") {
        const p: PresenceMessage = PresenceMessageSchema.parse(parsed);
        setState({ online: p.online, users: p.users, connected: true });
      }
    });

    ws.addEventListener("close", () => {
      setState((s) => ({ ...s, connected: false }));
    });

    return () => { ws.close(); };
  }, [token]);

  return state;
}
```

- [ ] **Step 2: Write a smoke test `web/test/ws-hook.test.tsx`**

Note: The integration of this hook against a real server is covered by the Playwright e2e test in Task 20. This smoke test only verifies that the hook returns the initial disconnected state when no token is provided.

```tsx
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useLobbyPresence } from "../src/platform/api/ws.js";

describe("useLobbyPresence", () => {
  it("returns disconnected state when token is null", () => {
    const { result } = renderHook(() => useLobbyPresence(null));
    expect(result.current.connected).toBe(false);
    expect(result.current.online).toBe(0);
    expect(result.current.users).toEqual([]);
  });
});
```

- [ ] **Step 3: Run + commit**

```bash
cd /home/kasm-user/cards-and-such
npm -w @cards/web run typecheck
npm -w @cards/web run test
git add web/
git commit -m "feat(plan-a-task16): useLobbyPresence hook"
```

---

## Task 17: Leaderboard page + Online Now panel

**Files:**
- Create: `web/src/pages/LeaderboardPage.tsx`
- Create: `web/src/pages/LeaderboardPage.css`
- Create: `web/src/pages/leaderboard/OnlineNowPanel.tsx`
- Create: `web/src/pages/leaderboard/OnlineNowPanel.css`
- Modify: `web/src/App.tsx`
- Create: `web/test/LeaderboardPage.test.tsx`

- [ ] **Step 1: Write `web/src/pages/leaderboard/OnlineNowPanel.tsx`**

```tsx
import { useAuth } from "../../platform/stores/auth.js";
import { useLobbyPresence } from "../../platform/api/ws.js";
import "./OnlineNowPanel.css";

export function OnlineNowPanel(): JSX.Element {
  const token = useAuth((s) => s.token);
  const { online, users, connected } = useLobbyPresence(token);
  return (
    <aside className="online-now" aria-label="online users">
      <header>
        <strong>{online}</strong> online {connected ? "" : "(connecting…)"}
      </header>
      <ul>
        {users.map((u) => (
          <li key={u.username}>
            <span className="name">{u.username}</span>
            <span className="where">{u.game ?? "in lobby"}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
```

- [ ] **Step 2: Write `web/src/pages/leaderboard/OnlineNowPanel.css`**

```css
.online-now { border: 1px solid #23233a; border-radius: 8px; padding: 1rem; min-width: 240px; max-height: 70vh; overflow-y: auto; }
.online-now header { font-size: 1rem; margin-bottom: 0.75rem; }
.online-now ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.25rem; }
.online-now li { display: flex; justify-content: space-between; font-size: 0.9rem; padding: 0.25rem 0.5rem; border-radius: 4px; }
.online-now li:nth-child(odd) { background: #14141f; }
.online-now .where { color: #8f8fa3; font-size: 0.8rem; }
```

- [ ] **Step 3: Write `web/src/pages/LeaderboardPage.tsx`**

```tsx
import { useEffect, useState } from "react";
import {
  LeaderboardRowSchema,
  GlobalLeaderboardRowSchema,
  type LeaderboardRow,
  type GlobalLeaderboardRow,
} from "@cards/shared";
import { z } from "zod";
import { OnlineNowPanel } from "./leaderboard/OnlineNowPanel.js";
import "./LeaderboardPage.css";

type Tab = "per-game" | "global" | "online";

export default function LeaderboardPage(): JSX.Element {
  const [tab, setTab] = useState<Tab>("per-game");
  return (
    <div className="leaderboard-layout">
      <section className="leaderboard-main">
        <h1>Leaderboard</h1>
        <nav className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === "per-game"} onClick={() => setTab("per-game")}>Per-game</button>
          <button role="tab" aria-selected={tab === "global"} onClick={() => setTab("global")}>Global</button>
          <button role="tab" aria-selected={tab === "online"} onClick={() => setTab("online")}>Online now</button>
        </nav>
        {tab === "per-game" && <PerGamePanel />}
        {tab === "global" && <GlobalPanel />}
        {tab === "online" && <div className="online-standalone"><OnlineNowPanel /></div>}
      </section>
      {tab !== "online" && <OnlineNowPanel />}
    </div>
  );
}

function PerGamePanel(): JSX.Element {
  const [gameId, setGameId] = useState("klondike");
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    setErr(null);
    fetch(`/api/leaderboard/game/${gameId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`http_${r.status}`);
        const j = await r.json();
        setRows(z.array(LeaderboardRowSchema).parse(j));
      })
      .catch((e: Error) => setErr(e.message));
  }, [gameId]);
  return (
    <div>
      <label>Game: <input value={gameId} onChange={(e) => setGameId(e.target.value)} aria-label="game id" /></label>
      {err && <div role="alert">{err}</div>}
      <ol className="scores">
        {rows.map((r) => (
          <li key={`${r.rank}-${r.username}`}><span>{r.rank}. {r.username}</span><span>{r.score}</span></li>
        ))}
      </ol>
    </div>
  );
}

function GlobalPanel(): JSX.Element {
  const [rows, setRows] = useState<GlobalLeaderboardRow[]>([]);
  useEffect(() => {
    fetch("/api/leaderboard/global").then(async (r) => {
      const j = await r.json();
      setRows(z.array(GlobalLeaderboardRowSchema).parse(j));
    });
  }, []);
  return (
    <ol className="scores">
      {rows.map((r) => (
        <li key={r.username}><span>{r.rank}. {r.username}</span><span>{r.gamesPlayed} games</span></li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 4: Write `web/src/pages/LeaderboardPage.css`**

```css
.leaderboard-layout { display: grid; grid-template-columns: 1fr auto; gap: 2rem; align-items: start; }
.leaderboard-main h1 { margin-top: 0; }
.tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
.tabs button { background: transparent; color: inherit; border: 1px solid #333; border-radius: 4px; padding: 0.25rem 0.75rem; cursor: pointer; }
.tabs button[aria-selected="true"] { background: #2a2a42; }
.scores { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.25rem; }
.scores li { display: flex; justify-content: space-between; padding: 0.5rem 0.75rem; background: #14141f; border-radius: 4px; }
.online-standalone { max-width: 420px; }
@media (max-width: 720px) {
  .leaderboard-layout { grid-template-columns: 1fr; }
}
```

- [ ] **Step 5: Modify `web/src/App.tsx` to use the real LeaderboardPage**

```tsx
import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./platform/AppShell.js";
import { RequireAuth } from "./platform/RequireAuth.js";
import LoginPage from "./pages/LoginPage.js";
import LeaderboardPage from "./pages/LeaderboardPage.js";

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth><AppShell /></RequireAuth>}>
        <Route path="/" element={<div data-testid="placeholder-home">Lobby placeholder — games come in Plan B</div>} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
```

- [ ] **Step 6: Write failing test `web/test/LeaderboardPage.test.tsx`**

```tsx
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import LeaderboardPage from "../src/pages/LeaderboardPage.js";
import { useAuth } from "../src/platform/stores/auth.js";

describe("LeaderboardPage", () => {
  beforeEach(() => {
    useAuth.getState().logout();
    vi.restoreAllMocks();
  });

  it("renders tab buttons", () => {
    render(<MemoryRouter><LeaderboardPage /></MemoryRouter>);
    expect(screen.getByRole("tab", { name: /per-game/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /global/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /online now/i })).toBeInTheDocument();
  });

  it("fetches and renders per-game rows", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(
      JSON.stringify([{ rank: 1, username: "alice", score: 500, playedAt: Date.now() }]),
      { status: 200, headers: { "content-type": "application/json" } },
    ));
    render(<MemoryRouter><LeaderboardPage /></MemoryRouter>);
    expect(await screen.findByText(/alice/)).toBeInTheDocument();
    expect(await screen.findByText(/500/)).toBeInTheDocument();
  });

  it("switches to Global tab", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(
      JSON.stringify([{ rank: 1, username: "bob", gamesPlayed: 3 }]),
      { status: 200, headers: { "content-type": "application/json" } },
    ));
    const user = userEvent.setup();
    render(<MemoryRouter><LeaderboardPage /></MemoryRouter>);
    await user.click(screen.getByRole("tab", { name: /global/i }));
    expect(await screen.findByText(/3 games/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 7: Run + commit**

```bash
cd /home/kasm-user/cards-and-such
npm -w @cards/web run typecheck
npm -w @cards/web run test
git add web/
git commit -m "feat(plan-a-task17): leaderboard page with per-game, global, online-now"
```

---

## Task 18: Dockerfile for server

**Files:**
- Create: `server/Dockerfile`
- Create: `server/.dockerignore`

- [ ] **Step 1: Write `server/Dockerfile`**

```dockerfile
# syntax=docker/dockerfile:1.7
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/
COPY web/package.json ./web/
RUN npm ci --workspaces --include-workspace-root

FROM deps AS build
COPY shared ./shared
COPY server ./server
RUN npm -w @cards/server run build

FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=4000 DB_PATH=/data/cards.db
RUN mkdir -p /data
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/shared ./shared
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/server/package.json ./server/package.json
COPY --from=build /app/package.json ./package.json
EXPOSE 4000
CMD ["node", "server/dist/index.js"]
```

- [ ] **Step 2: Write `server/.dockerignore`**

```
node_modules
dist
test
*.db
```

- [ ] **Step 3: Build + smoke-test**

```bash
cd /home/kasm-user/cards-and-such
docker build -t cards-server -f server/Dockerfile .
docker run --rm -d --name cards-server-test -p 4099:4000 -e JWT_SECRET=test-secret-at-least-16 cards-server
sleep 2
curl -s http://127.0.0.1:4099/health
docker stop cards-server-test
```

Expected: `{"ok":true}`.

- [ ] **Step 4: Commit**

```bash
git add server/Dockerfile server/.dockerignore
git commit -m "feat(plan-a-task18): Dockerfile for server"
```

---

## Task 19: Dockerfile for web + docker-compose.yml

**Files:**
- Create: `web/Dockerfile`
- Create: `web/.dockerignore`
- Create: `web/nginx.conf`
- Create: `docker-compose.yml`

- [ ] **Step 1: Write `web/nginx.conf`**

```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  location /api/ {
    proxy_pass http://server:4000/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
  }

  location /ws {
    proxy_pass http://server:4000/ws;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 3600s;
  }

  location / { try_files $uri /index.html; }
}
```

- [ ] **Step 2: Write `web/Dockerfile`**

```dockerfile
# syntax=docker/dockerfile:1.7
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/
COPY web/package.json ./web/
RUN npm ci --workspaces --include-workspace-root
COPY shared ./shared
COPY web ./web
RUN npm -w @cards/web run build

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/web/dist /usr/share/nginx/html
COPY web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

- [ ] **Step 3: Write `web/.dockerignore`**

```
node_modules
dist
test
```

- [ ] **Step 4: Write `docker-compose.yml`**

```yaml
services:
  server:
    build:
      context: .
      dockerfile: server/Dockerfile
    environment:
      JWT_SECRET: ${JWT_SECRET:-dev-secret-change-me-please-32ch}
      PORT: 4000
      DB_PATH: /data/cards.db
      CORS_ORIGIN: http://localhost:8080
    volumes:
      - cards_data:/data
    ports:
      - "4000:4000"
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://127.0.0.1:4000/health || exit 1"]
      interval: 10s
      timeout: 3s
      retries: 5

  web:
    build:
      context: .
      dockerfile: web/Dockerfile
    ports:
      - "8080:80"
    depends_on:
      server:
        condition: service_healthy

volumes:
  cards_data:
```

- [ ] **Step 5: Bring it up, smoke-test, commit**

```bash
cd /home/kasm-user/cards-and-such
docker compose up -d --build
sleep 6
curl -s http://127.0.0.1:8080/api/health
curl -s -X POST -H 'content-type: application/json' -d '{"username":"docker_alice"}' http://127.0.0.1:8080/api/auth/claim | head -c 200
docker compose down
git add web/Dockerfile web/.dockerignore web/nginx.conf docker-compose.yml
git commit -m "feat(plan-a-task19): web Dockerfile + docker-compose stack"
```

Expected: the health curl returns `{"ok":true}`, the claim curl returns a JSON body with a token.

---

## Task 20: Playwright smoke test (login → leaderboard → Online Now)

**Files:**
- Create: `e2e/package.json`
- Create: `e2e/playwright.config.ts`
- Create: `e2e/tests/smoke.spec.ts`
- Modify: root `package.json` (add `e2e` to workspaces)

- [ ] **Step 1: Add `e2e` to root workspaces**

In root `package.json`, change:
```json
"workspaces": ["shared", "server", "web"]
```
to:
```json
"workspaces": ["shared", "server", "web", "e2e"]
```

- [ ] **Step 2: Write `e2e/package.json`**

```json
{
  "name": "@cards/e2e",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "test": "playwright test",
    "test:install": "playwright install --with-deps chromium"
  },
  "devDependencies": {
    "@playwright/test": "^1.44.0"
  }
}
```

- [ ] **Step 3: Write `e2e/playwright.config.ts`**

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  use: {
    baseURL: "http://127.0.0.1:8080",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
```

- [ ] **Step 4: Write failing test `e2e/tests/smoke.spec.ts`**

```ts
import { expect, test } from "@playwright/test";

test("user can claim a username, see the shell, and see themselves in Online Now", async ({ page }) => {
  const username = `e2e_${Math.random().toString(36).slice(2, 8)}`;
  await page.goto("/login");
  await page.getByLabel(/username/i).fill(username);
  await page.getByRole("button", { name: /^claim$/i }).click();

  await expect(page.getByTestId("placeholder-home")).toBeVisible();
  await expect(page.getByTestId("current-user")).toHaveText(username);

  await page.getByRole("link", { name: /leaderboard/i }).click();
  const panel = page.locator(".online-now");
  await expect(panel).toBeVisible();
  await expect(panel).toContainText(username, { timeout: 5000 });
});
```

- [ ] **Step 5: Install, run, commit**

Assumes the docker compose stack is up (from Task 19). If not, run `docker compose up -d --build` first.

```bash
cd /home/kasm-user/cards-and-such
npm install
npm -w @cards/e2e run test:install
docker compose up -d --build
sleep 8
npm -w @cards/e2e run test
docker compose down
git add e2e/ package.json package-lock.json
git commit -m "feat(plan-a-task20): playwright smoke test through the full stack"
```

Expected: one test passes — the user is redirected from `/login` to `/`, lands on the lobby placeholder, navigates to `/leaderboard`, and sees their own username in the Online Now panel.

---

## Task 21: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Write `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: ["**"]
  pull_request:
    branches: ["**"]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci --workspaces --include-workspace-root
      - run: npm run typecheck
      - run: npm -w @cards/shared run test
      - run: npm -w @cards/server run test
      - run: npm -w @cards/web run test

  e2e:
    runs-on: ubuntu-latest
    needs: unit
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci --workspaces --include-workspace-root
      - name: Build & start stack
        run: docker compose up -d --build
      - name: Wait for health
        run: |
          for i in {1..30}; do
            curl -sf http://127.0.0.1:8080/api/health && break
            sleep 2
          done
      - run: npm -w @cards/e2e run test:install
      - run: npm -w @cards/e2e run test
      - if: always()
        run: docker compose down
      - if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: e2e/playwright-report
          if-no-files-found: ignore
```

- [ ] **Step 2: Commit**

```bash
cd /home/kasm-user/cards-and-such
git add .github/
git commit -m "feat(plan-a-task21): GitHub Actions CI for unit + e2e"
```

---

## Task 22: README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write `README.md`**

````markdown
# cards-and-such

Browser-based game hub for card, dice, board, and arcade games. See
`docs/superpowers/specs/2026-04-20-cards-and-such-phase-1-design.md` for
the full Phase 1 design.

## Status

- **Plan A — Platform Foundation:** in progress
- **Plan B — Single-Player Games:** not started
- **Plan C — Multiplayer + Polish:** not started

## Local development

```bash
npm install
docker compose up -d --build     # brings up web (:8080) + server (:4000)
curl http://127.0.0.1:8080/api/health
# then open http://127.0.0.1:8080/
```

To run tests:

```bash
npm run typecheck
npm run test                     # unit tests for all workspaces
npm -w @cards/e2e run test       # requires docker compose to be up
```

## Packages

- `shared/` — zod schemas + TS types shared by client and server.
- `server/` — Fastify + SQLite + WebSocket server.
- `web/` — React + Vite UI.
- `e2e/` — Playwright end-to-end tests.
````

- [ ] **Step 2: Commit**

```bash
cd /home/kasm-user/cards-and-such
git add README.md
git commit -m "docs(plan-a-task22): README with local dev + test commands"
```

---

## Plan A completion checklist

When all tasks are checked:

- [ ] `npm run typecheck` passes across all workspaces
- [ ] `npm run test` passes across all workspaces
- [ ] `docker compose up -d --build` brings up web (port 8080) and server (port 4000)
- [ ] Visiting `http://localhost:8080` redirects to `/login`
- [ ] After claiming a username, the user lands on the lobby placeholder and sees their username in the header
- [ ] Opening a second private browser window, claiming a second username, and checking the Leaderboard tab shows both users in Online Now
- [ ] Closing one window removes that user within ~2 seconds
- [ ] `npm -w @cards/e2e run test` passes against the running stack
- [ ] CI passes on GitHub Actions

When all these hold, Plan A is done and **Plan B (Single-Player Games)** is ready to be written.
