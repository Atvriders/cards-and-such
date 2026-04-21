import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { makeTestApp } from "./helpers.js";

async function claim(app: FastifyInstance, username: string): Promise<string> {
  const r = await app.inject({ method: "POST", url: "/auth/claim", payload: { username } });
  return (r.json() as { token: string }).token;
}

function seedUser(app: FastifyInstance, username: string): void {
  app.db.prepare("INSERT INTO users (username, created_at) VALUES (?, ?)")
    .run(username, Date.now());
}
function seedScore(app: FastifyInstance, username: string, gameId: string, score: number): void {
  app.db.prepare(
    `INSERT INTO scores (game_id, username, score, settings_hash, played_at)
     VALUES (?, ?, ?, 'default0', ?)`,
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
