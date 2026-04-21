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
