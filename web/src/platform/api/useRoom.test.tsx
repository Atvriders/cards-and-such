import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useRoom } from "./useRoom.js";

type Listener = (ev: { data: string }) => void;

class FakeWebSocket {
  static instances: FakeWebSocket[] = [];
  static OPEN = 1;
  static CLOSED = 3;
  url: string;
  readyState = 0;
  OPEN = FakeWebSocket.OPEN;
  CLOSED = FakeWebSocket.CLOSED;
  sent: string[] = [];
  listeners: Record<string, Listener[]> = {};
  constructor(url: string) {
    this.url = url;
    FakeWebSocket.instances.push(this);
  }
  addEventListener(type: string, fn: Listener): void {
    (this.listeners[type] ||= []).push(fn);
  }
  send(payload: string): void {
    this.sent.push(payload);
  }
  close(): void {
    this.readyState = FakeWebSocket.CLOSED;
    this.dispatch("close", { data: "" });
  }
  dispatch(type: string, ev: { data: string }): void {
    (this.listeners[type] ?? []).forEach((fn) => fn(ev));
  }
  open(): void {
    this.readyState = FakeWebSocket.OPEN;
    this.dispatch("open", { data: "" });
  }
  message(obj: unknown): void {
    this.dispatch("message", { data: JSON.stringify(obj) });
  }
}

const ROOM_ID = "abcdef012345"; // matches /^[a-z0-9]{12}$/

beforeEach(() => {
  FakeWebSocket.instances = [];
  vi.stubGlobal("WebSocket", FakeWebSocket as unknown as typeof WebSocket);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useRoom", () => {
  it("returns connecting state and opens no socket without roomId/token", () => {
    const { result } = renderHook(() => useRoom(null, null));
    expect(result.current[0].status).toBe("connecting");
    expect(result.current[0].seat).toBeNull();
    expect(result.current[0].members).toEqual([]);
    expect(FakeWebSocket.instances).toHaveLength(0);
  });

  it("authenticates, joins, and applies room-state messages", () => {
    const { result } = renderHook(() => useRoom(ROOM_ID, "tok"));
    const ws = FakeWebSocket.instances[0]!;
    expect(ws).toBeDefined();

    act(() => {
      ws.open();
    });
    expect(JSON.parse(ws.sent[0]!)).toEqual({ type: "auth", token: "tok" });

    act(() => {
      ws.message({ type: "auth_ok" });
    });
    expect(JSON.parse(ws.sent[1]!)).toEqual({ type: "room-join", roomId: ROOM_ID });
    expect(result.current[0].status).toBe("authed");

    act(() => {
      ws.message({ type: "room-joined", roomId: ROOM_ID, seat: 2 });
    });
    expect(result.current[0].status).toBe("joined");
    expect(result.current[0].seat).toBe(2);

    act(() => {
      ws.message({
        type: "room-state",
        roomId: ROOM_ID,
        state: { hand: [] },
        phase: "playing",
        members: [{ seat: 2, username: "alice" }],
        terminal: null,
      });
    });
    expect(result.current[0].phase).toBe("playing");
    expect(result.current[0].members).toEqual([{ seat: 2, username: "alice" }]);
    expect(result.current[0].state).toEqual({ hand: [] });
  });

  it("dispatch sends room-action only when socket is OPEN", () => {
    const { result } = renderHook(() => useRoom(ROOM_ID, "tok"));
    const ws = FakeWebSocket.instances[0]!;

    // Not open yet -> dispatch is a no-op
    act(() => {
      result.current[1].dispatch({ kind: "noop" });
    });
    expect(ws.sent).toHaveLength(0);

    act(() => {
      ws.open();
    });
    // After open, the hook has sent "auth"; clear and verify dispatch goes through.
    ws.sent.length = 0;
    act(() => {
      result.current[1].dispatch({ kind: "play", card: 7 });
    });
    expect(ws.sent).toHaveLength(1);
    expect(JSON.parse(ws.sent[0]!)).toEqual({
      type: "room-action",
      roomId: ROOM_ID,
      action: { kind: "play", card: 7 },
    });

    act(() => {
      result.current[1].leave();
    });
    expect(JSON.parse(ws.sent[1]!)).toEqual({ type: "room-leave", roomId: ROOM_ID });
  });
});
