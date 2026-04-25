import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { waves: "3" as const };

describe("initialState", () => {
  it("starts with castle HP, gold, and one archer", () => {
    const s = initialState(1, defaultSettings);
    expect(s.castleHP).toBe(100);
    expect(s.archerCount).toBe(1);
    expect(s.gold).toBe(50);
    expect(s.over).toBe(false);
  });
});

describe("determinism", () => {
  it("same seed produces identical state", () => {
    const s1 = initialState(42, defaultSettings);
    const s2 = initialState(42, defaultSettings);
    expect(s1).toEqual(s2);
  });
});

describe("buyArcher", () => {
  it("deducts gold and increments archerCount", () => {
    const s = initialState(1, defaultSettings);
    const after = reducer(s, { type: "buyArcher" });
    expect(after.archerCount).toBe(2);
    expect(after.gold).toBeLessThan(s.gold);
  });

  it("does not buy if not enough gold", () => {
    const s = { ...initialState(1, defaultSettings), gold: 0 };
    const after = reducer(s, { type: "buyArcher" });
    expect(after.archerCount).toBe(1);
    expect(after.gold).toBe(0);
  });
});

describe("tick", () => {
  it("ticks advance game state without error", () => {
    let s = initialState(1, defaultSettings);
    for (let i = 0; i < 30; i++) {
      s = reducer(s, { type: "tick" });
    }
    expect(s.ticks).toBe(30);
  });
});

describe("isTerminal", () => {
  it("returns null when not over", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when over", () => {
    const s = { ...initialState(1, defaultSettings), over: true, score: 150 };
    expect(isTerminal(s)?.score).toBe(150);
  });
});
