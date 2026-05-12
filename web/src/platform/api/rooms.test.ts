import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRoom, joinRoomByCode } from "./rooms.js";
import { useAuth } from "../stores/auth.js";

/**
 * Exercises the real wire contract of rooms.ts: bearer-token plumbing,
 * URL/method shape, JSON body construction, and the Zod-validated
 * response transform. Fetch is stubbed; the auth store is seeded with a
 * synthetic token via setState so authed() does not short-circuit.
 */

const VALID_ROOM = {
  id: "abcdef012345",          // 12 lowercase alphanumerics
  code: "AB12",                // 4 uppercase alphanumerics
  gameId: "tic-tac-toe",
  members: [],
  min: 2,
  max: 2,
  phase: "waiting" as const,
};

beforeEach(() => {
  useAuth.setState({
    username: "u",
    token: "tok-123",
    expiresAt: Date.now() + 60_000,
    status: "idle",
    error: null,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  useAuth.getState().logout();
});

describe("createRoom", () => {
  it("POSTs to /api/rooms with bearer token and returns parsed room+seat", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ room: VALID_ROOM, seat: 1 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const out = await createRoom("tic-tac-toe");

    expect(out).toEqual({ room: VALID_ROOM, seat: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/rooms");
    expect(init.method).toBe("POST");
    const headers = init.headers as Record<string, string>;
    expect(headers.authorization).toBe("Bearer tok-123");
    expect(headers["content-type"]).toBe("application/json");
    expect(JSON.parse(init.body as string)).toEqual({ gameId: "tic-tac-toe" });
  });

  it("throws the server-supplied error string on non-2xx", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ error: "room_full" }), {
          status: 409,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    await expect(createRoom("tic-tac-toe")).rejects.toThrow("room_full");
  });
});

describe("joinRoomByCode", () => {
  it("POSTs to /api/rooms/join with the code and parses the room envelope", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ room: VALID_ROOM }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const out = await joinRoomByCode("AB12");

    expect(out).toEqual({ room: VALID_ROOM });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/rooms/join");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ code: "AB12" });
  });
});
