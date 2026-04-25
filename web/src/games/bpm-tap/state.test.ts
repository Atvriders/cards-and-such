import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { target: "60" as const };

describe("initialState", () => {
  it("starts with empty taps and 0 bpm", () => {
    const s = initialState(42, defaultSettings);
    expect(s.taps).toHaveLength(0);
    expect(s.currentBpm).toBe(0);
    expect(s.targetBpm).toBe(60);
    expect(s.gameOver).toBe(false);
  });

  it("sets targetBpm from settings", () => {
    const s = initialState(1, { target: "120" });
    expect(s.targetBpm).toBe(120);
  });
});

describe("reducer — tap", () => {
  it("records taps", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "tap", time: 0 });
    expect(s2.taps).toHaveLength(1);
    expect(s2.taps[0]).toBe(0);
  });

  it("calculates BPM after 2 taps", () => {
    const s = initialState(42, defaultSettings);
    // 1000ms apart = 60 BPM
    const s1 = reducer(s, { type: "tap", time: 0 });
    const s2 = reducer(s1, { type: "tap", time: 1000 });
    expect(s2.currentBpm).toBe(60);
  });

  it("game ends after 8 taps", () => {
    let s = initialState(42, defaultSettings);
    for (let i = 0; i < 8; i++) {
      s = reducer(s, { type: "tap", time: i * 1000 });
    }
    expect(s.gameOver).toBe(true);
    expect(s.taps).toHaveLength(8);
  });

  it("is no-op after game over", () => {
    const s = initialState(42, defaultSettings);
    const over = { ...s, gameOver: true };
    expect(reducer(over, { type: "tap", time: 999 })).toBe(over);
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("perfect timing scores 1000", () => {
    const s = initialState(42, defaultSettings);
    const perfect = { ...s, gameOver: true, bestError: 0 };
    expect(isTerminal(perfect)!.score).toBe(1000);
  });

  it("score decreases with error", () => {
    const s = initialState(42, defaultSettings);
    const ok = { ...s, gameOver: true, bestError: 20 };
    expect(isTerminal(ok)!.score).toBe(800);
  });

  it("score never goes below 0", () => {
    const s = initialState(42, defaultSettings);
    const bad = { ...s, gameOver: true, bestError: 200 };
    expect(isTerminal(bad)!.score).toBe(0);
  });
});
