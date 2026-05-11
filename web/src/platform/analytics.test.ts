import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  ANALYTICS_STORAGE_KEY,
  RING_CAPACITY,
  _reloadFromStorage,
  clearEvents,
  getEvents,
  track,
} from "./analytics.js";

describe("analytics: local-only ring buffer", () => {
  beforeEach(() => {
    localStorage.clear();
    _reloadFromStorage();
  });
  afterEach(() => {
    localStorage.clear();
    clearEvents();
  });

  it("starts empty when storage is empty", () => {
    expect(getEvents()).toEqual([]);
  });

  it("appends events with name, ts, and props", () => {
    track("game.start", { gameId: "klondike" });
    const evts = getEvents();
    expect(evts.length).toBe(1);
    expect(evts[0]!.name).toBe("game.start");
    expect(typeof evts[0]!.ts).toBe("number");
    expect(evts[0]!.props).toEqual({ gameId: "klondike" });
  });

  it("omits the props key when none are passed", () => {
    track("app.boot");
    const evt = getEvents()[0]!;
    expect(evt.name).toBe("app.boot");
    expect("props" in evt).toBe(false);
  });

  it("mirrors to localStorage under cards-events", () => {
    track("route.change", { path: "/" });
    const raw = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed[0].name).toBe("route.change");
  });

  it("caps the ring at RING_CAPACITY (drops oldest)", () => {
    for (let i = 0; i < RING_CAPACITY + 25; i++) {
      track("noise", { i });
    }
    const evts = getEvents();
    expect(evts.length).toBe(RING_CAPACITY);
    // Oldest 25 dropped; first remaining should be i=25.
    expect((evts[0]!.props as { i: number }).i).toBe(25);
    expect((evts[evts.length - 1]!.props as { i: number }).i).toBe(RING_CAPACITY + 24);
  });

  it("clearEvents wipes both the ring and storage", () => {
    track("a");
    track("b");
    clearEvents();
    expect(getEvents()).toEqual([]);
    expect(localStorage.getItem(ANALYTICS_STORAGE_KEY)).toBeNull();
  });

  it("strips non-serialisable props without throwing", () => {
    const cyclic: Record<string, unknown> = { x: 1 };
    cyclic.self = cyclic;
    expect(() => track("cyclic", cyclic)).not.toThrow();
    const evt = getEvents()[0]!;
    // The whole props bag is dropped when JSON.stringify throws.
    expect(evt.name).toBe("cyclic");
    expect(evt.props).toBeUndefined();
  });

  it("recovers from corrupt localStorage", () => {
    localStorage.setItem(ANALYTICS_STORAGE_KEY, "{not json");
    _reloadFromStorage();
    expect(getEvents()).toEqual([]);
  });
});
