import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLobbyPresence } from "./ws.js";

type Listener = (ev: unknown) => void;

class FakeWebSocket {
  static instances: FakeWebSocket[] = [];
  url: string;
  sent: string[] = [];
  listeners: Record<string, Listener[]> = {};
  readyState = 0;

  constructor(url: string) {
    this.url = url;
    FakeWebSocket.instances.push(this);
  }

  addEventListener(type: string, cb: Listener): void {
    (this.listeners[type] ??= []).push(cb);
  }

  send(data: string): void {
    this.sent.push(data);
  }

  close(): void {
    this.readyState = 3;
    this.emit("close", {});
  }

  emit(type: string, ev: unknown): void {
    for (const cb of this.listeners[type] ?? []) cb(ev);
  }
}

describe("useLobbyPresence (ws.ts)", () => {
  beforeEach(() => {
    FakeWebSocket.instances = [];
    (globalThis as unknown as { WebSocket: typeof FakeWebSocket }).WebSocket = FakeWebSocket;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens a ws:// URL ending in /ws and sends auth then subscribe on auth_ok", () => {
    const { result } = renderHook(() => useLobbyPresence("tok-123"));

    expect(FakeWebSocket.instances).toHaveLength(1);
    const sock = FakeWebSocket.instances[0];
    // jsdom's window.location.protocol is http:, so this should be ws://
    expect(sock.url.startsWith("ws://")).toBe(true);
    expect(sock.url.endsWith("/ws")).toBe(true);

    act(() => {
      sock.emit("open", {});
    });
    expect(sock.sent[0]).toBe(JSON.stringify({ type: "auth", token: "tok-123" }));

    act(() => {
      sock.emit("message", { data: JSON.stringify({ type: "auth_ok" }) });
    });
    expect(result.current.connected).toBe(true);
    expect(sock.sent[1]).toBe(JSON.stringify({ type: "subscribe", channel: "lobby" }));
  });

  it("updates state from a presence message and ignores malformed payloads", () => {
    const { result } = renderHook(() => useLobbyPresence("tok"));
    const sock = FakeWebSocket.instances[0];

    act(() => {
      sock.emit("open", {});
      sock.emit("message", { data: JSON.stringify({ type: "auth_ok" }) });
    });

    act(() => {
      sock.emit("message", { data: "not json" });
      sock.emit("message", {
        data: JSON.stringify({
          type: "presence",
          online: 3,
          users: [
            { username: "alice", game: null },
            { username: "bob", game: "uno" },
          ],
        }),
      });
    });

    expect(result.current.online).toBe(3);
    expect(result.current.users).toEqual([
      { username: "alice", game: null },
      { username: "bob", game: "uno" },
    ]);
    expect(result.current.connected).toBe(true);
  });

  it("marks disconnected on close and schedules a reconnect attempt", () => {
    vi.useFakeTimers();
    try {
      const { result } = renderHook(() => useLobbyPresence("tok"));
      expect(FakeWebSocket.instances).toHaveLength(1);
      const first = FakeWebSocket.instances[0];

      act(() => {
        first.emit("open", {});
        first.emit("message", { data: JSON.stringify({ type: "auth_ok" }) });
      });
      expect(result.current.connected).toBe(true);

      act(() => {
        first.emit("close", {});
      });
      expect(result.current.connected).toBe(false);

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(FakeWebSocket.instances.length).toBeGreaterThanOrEqual(2);
    } finally {
      vi.useRealTimers();
    }
  });
});
