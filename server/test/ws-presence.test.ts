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
