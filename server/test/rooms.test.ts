import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import WebSocket from "ws";
import { makeTestApp } from "./helpers.js";
import { registerServerGame, SERVER_GAMES } from "../src/rooms/game-registry.js";

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
      const m = JSON.parse(d.toString());
      if (m.type === "auth_ok") resolve();
      else reject(new Error("expected auth_ok"));
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

// Register a trivial counter game before tests run.
beforeEach(() => {
  SERVER_GAMES.clear();
  registerServerGame<{ n: number }, { type: "inc" }>({
    gameId: "test-counter",
    minPlayers: 2,
    maxPlayers: 2,
    initialState: () => ({ n: 0 }),
    reducer: (s, a) => (a.type === "inc" ? { n: s.n + 1 } : s),
    isTerminal: (s) => (s.n >= 3 ? { winner: 0, score: s.n } : null),
  });
});

describe("room system", () => {
  let app: FastifyInstance;
  let port: number;

  beforeEach(async () => { app = await makeTestApp(); port = await startListening(app); });
  afterEach(async () => { await app.close(); });

  it("POST /rooms creates a room for a registered game", async () => {
    const token = await claim(app, "alice");
    const res = await app.inject({
      method: "POST", url: "/rooms",
      headers: { authorization: `Bearer ${token}` },
      payload: { gameId: "test-counter" },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { room: { id: string; code: string }; seat: number };
    expect(body.room.id).toMatch(/^[a-f0-9]{12}$/);
    expect(body.room.code).toMatch(/^[A-Z0-9]{4}$/);
  });

  it("POST /rooms 400s for unregistered game", async () => {
    const token = await claim(app, "alice");
    const res = await app.inject({
      method: "POST", url: "/rooms",
      headers: { authorization: `Bearer ${token}` },
      payload: { gameId: "no-such-game" },
    });
    expect(res.statusCode).toBe(400);
  });

  it("POST /rooms/join finds a room by code", async () => {
    const token = await claim(app, "alice");
    const created = await app.inject({
      method: "POST", url: "/rooms",
      headers: { authorization: `Bearer ${token}` },
      payload: { gameId: "test-counter" },
    });
    const code = (created.json() as { room: { code: string } }).room.code;
    const join = await app.inject({
      method: "POST", url: "/rooms/join",
      headers: { authorization: `Bearer ${token}` },
      payload: { code },
    });
    expect(join.statusCode).toBe(200);
  });

  it("two members can join and receive state broadcasts", async () => {
    const aliceToken = await claim(app, "alice");
    const bobToken = await claim(app, "bob");

    const created = await app.inject({
      method: "POST", url: "/rooms",
      headers: { authorization: `Bearer ${aliceToken}` },
      payload: { gameId: "test-counter" },
    });
    const roomId = (created.json() as { room: { id: string } }).room.id;

    const ws1 = await openAndAuth(`ws://127.0.0.1:${port}/ws`, aliceToken);
    const ws2 = await openAndAuth(`ws://127.0.0.1:${port}/ws`, bobToken);

    const next1 = makeQueue(ws1);
    const next2 = makeQueue(ws2);

    ws1.send(JSON.stringify({ type: "room-join", roomId }));
    // alice: first comes room-joined, then room-state broadcast
    const m1 = await next1();
    expect(m1["type"]).toBe("room-joined");
    const m1b = await next1();
    expect(m1b["type"]).toBe("room-state");

    // Bob joins — server sends: room-joined to bob, then broadcasts room-state to alice+bob
    ws2.send(JSON.stringify({ type: "room-join", roomId }));
    const [broadcastToAlice, bobJoined, broadcastToBob] = await Promise.all([next1(), next2(), next2()]);
    expect(bobJoined["type"]).toBe("room-joined");
    expect(broadcastToAlice["type"]).toBe("room-state");
    expect(broadcastToBob["type"]).toBe("room-state");

    // dispatch 3 increments → terminal; each dispatch broadcasts to both members
    for (let i = 0; i < 3; i++) {
      const p = Promise.all([next1(), next2()]);
      ws1.send(JSON.stringify({ type: "room-action", roomId, action: { type: "inc" } }));
      await p;
    }

    ws1.close(); ws2.close();
  });
});
