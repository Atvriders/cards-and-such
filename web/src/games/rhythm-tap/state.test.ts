import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = { bpm: "90" as const };

describe("initialState", () => {
  it("starts with lives=5, score=0, beats generated", () => {
    const s = initialState(42, settings);
    expect(s.lives).toBe(5);
    expect(s.score).toBe(0);
    expect(s.beats.length).toBeGreaterThan(0);
    expect(s.over).toBe(false);
    expect(s.started).toBe(false);
  });
});

describe("determinism", () => {
  it("produces same beats for same seed", () => {
    const s1 = initialState(99, settings);
    const s2 = initialState(99, settings);
    expect(s1.beats.length).toBe(s2.beats.length);
    expect(s1.beats[0]).toEqual(s2.beats[0]);
  });
});

describe("tap in window scores", () => {
  it("hitting a beat in window increases score", () => {
    const s = initialState(42, settings);
    const started = reducer(s, { type: "start" });
    // Advance time to just before first beat
    const firstBeat = started.beats[0]!;
    const atBeat: typeof started = { ...started, elapsed: firstBeat.time };
    const tapped = reducer(atBeat, { type: "tap", lane: firstBeat.lane });
    expect(tapped.score).toBeGreaterThan(0);
    expect(tapped.beats.find((b) => b.id === firstBeat.id)!.hit).toBe(true);
  });
});

describe("beat missed loses life", () => {
  it("a beat past miss window marks it missed and loses life", () => {
    const s = initialState(42, settings);
    const started = reducer(s, { type: "start" });
    const firstBeat = started.beats[0]!;
    // Tick past miss window
    const after = reducer({ ...started, elapsed: firstBeat.time + 0.3 }, { type: "tick", dt: 0.01 });
    expect(after.lives).toBeLessThan(5);
  });
});

describe("isTerminal", () => {
  it("returns null in progress", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });
  it("returns score when over", () => {
    const s = { ...initialState(1, settings), over: true, score: 100, maxCombo: 10 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(150); // 100 + 10*5
  });
});
