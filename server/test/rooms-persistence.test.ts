import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import WebSocket from "ws";
import { makeTestApp } from "./helpers.js";
import { SERVER_GAMES, registerServerGame } from "../src/rooms/game-registry.js";

async function startListening(app: FastifyInstance): Promise<number> {
  const addr = await app.listen({ port: 0, host: "127.0.0.1" });
  return Number(/:(\d+)$/.exec(addr)![1]);
}

async function claim(app: FastifyInstance, username: string): Promise<string> {
  const r = await app.inject({ method: "POST", url: "/auth/claim", payload: { username } });
  return (r.json() as { token: string }).token;
}

async function openAndAuth(url: string, token: string): Promise<WebSocket> {
  const ws = new WebSocket(url);
  await new Promise((r) => ws.once("open", r));
  await new Promise<void>((resolve, reject) => {
    ws.once("message", (d) => {
      const m = JSON.parse(d.toString()) as { type: string };
      if (m.type === "auth_ok") resolve();
      else reject(new Error(`expected auth_ok, got ${m.type}`));
    });
    ws.send(JSON.stringify({ type: "auth", token }));
  });
  return ws;
}

function makeQueue(ws: WebSocket): () => Promise<Record<string, unknown>> {
  const q: Array<Record<string, unknown>> = [];
  const waiters: Array<(v: Record<string, unknown>) => void> = [];
  ws.on("message", (d) => {
    const msg = JSON.parse(d.toString()) as Record<string, unknown>;
    const waiter = waiters.shift();
    if (waiter) waiter(msg);
    else q.push(msg);
  });
  return () => new Promise((resolve) => {
    const queued = q.shift();
    if (queued !== undefined) resolve(queued);
    else waiters.push(resolve);
  });
}

describe("terminal score persistence", () => {
  let app: FastifyInstance;
  let port: number;

  beforeEach(async () => {
    SERVER_GAMES.clear();
    registerServerGame<{ n: number }, { type: "inc" }>({
      gameId: "counter-persist",
      minPlayers: 2, maxPlayers: 2,
      initialState: () => ({ n: 0 }),
      reducer: (s, a) => (a.type === "inc" ? { n: s.n + 1 } : s),
      isTerminal: (s) => (s.n >= 2 ? { winner: 0, score: 42 } : null),
    });
    app = await makeTestApp();
    port = await startListening(app);
  });

  afterEach(async () => { await app.close(); });

  it("inserts a scores row for each seat and updates ratings", async () => {
    const ta = await claim(app, "alice");
    const tb = await claim(app, "bob");

    const res = await app.inject({
      method: "POST", url: "/rooms",
      headers: { authorization: `Bearer ${ta}` },
      payload: { gameId: "counter-persist" },
    });
    const roomId = (res.json() as { room: { id: string } }).room.id;

    const wa = await openAndAuth(`ws://127.0.0.1:${port}/ws`, ta);
    const wb = await openAndAuth(`ws://127.0.0.1:${port}/ws`, tb);
    const nextA = makeQueue(wa);
    const nextB = makeQueue(wb);

    // Alice joins
    wa.send(JSON.stringify({ type: "room-join", roomId }));
    await nextA(); // room-joined
    await nextA(); // room-state (broadcast, only alice)

    // Bob joins
    wb.send(JSON.stringify({ type: "room-join", roomId }));
    await nextB(); // room-joined
    // broadcast to both
    await nextA(); // room-state
    await nextB(); // room-state

    // First action (n=1)
    wa.send(JSON.stringify({ type: "room-action", roomId, action: { type: "inc" } }));
    await nextA(); // room-state
    await nextB(); // room-state

    // Second action (n=2 → terminal)
    wa.send(JSON.stringify({ type: "room-action", roomId, action: { type: "inc" } }));
    await nextA(); // room-state (terminal)
    await nextB(); // room-state (terminal)

    const rows = app.db.prepare(
      "SELECT username, score FROM scores WHERE game_id = 'counter-persist' ORDER BY username"
    ).all() as Array<{ username: string; score: number }>;
    expect(rows).toHaveLength(2);
    const alice = rows.find((r) => r.username === "alice")!;
    const bob = rows.find((r) => r.username === "bob")!;
    // Winner = seat 0 = alice; loser = bob
    expect(alice.score).toBe(42);
    expect(bob.score).toBe(0);

    const ratings = app.db.prepare(
      "SELECT username, elo FROM ratings WHERE game_id = 'counter-persist' ORDER BY username"
    ).all() as Array<{ username: string; elo: number }>;
    expect(ratings).toHaveLength(2);
    const aliceElo = ratings.find((r) => r.username === "alice")!.elo;
    const bobElo = ratings.find((r) => r.username === "bob")!.elo;
    expect(aliceElo).toBeGreaterThan(1000);
    expect(bobElo).toBeLessThan(1000);

    wa.close(); wb.close();
  });
});
