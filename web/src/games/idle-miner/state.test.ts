import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, getHireCost } from "./state.js";

const defaultSettings = { depth: "10" as const };

describe("initialState", () => {
  it("starts at depth 0 with no gold", () => {
    const s = initialState(42, defaultSettings);
    expect(s.gold).toBe(0);
    expect(s.depth).toBe(0);
    expect(s.targetDepth).toBe(10);
    expect(s.gameOver).toBe(false);
  });

  it("is deterministic for same seed", () => {
    const s1 = initialState(99, defaultSettings);
    const s2 = initialState(99, defaultSettings);
    expect(s1.rngSeed).toBe(s2.rngSeed);
  });
});

describe("reducer — dig", () => {
  it("increments depth and gold", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "dig" });
    expect(s2.depth).toBe(1);
    expect(s2.gold).toBeGreaterThanOrEqual(1);
    expect(s2.digs).toBe(1);
  });

  it("game ends when target depth reached", () => {
    const s = initialState(42, defaultSettings);
    const near = { ...s, depth: 9 };
    const s2 = reducer(near, { type: "dig" });
    expect(s2.gameOver).toBe(true);
    expect(s2.depth).toBe(10);
  });

  it("is no-op after game over", () => {
    const s = initialState(42, defaultSettings);
    const over = { ...s, gameOver: true };
    expect(reducer(over, { type: "dig" })).toBe(over);
  });
});

describe("reducer — hire", () => {
  it("refuses hire without enough gold", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "hire" });
    expect(s2.autoMiners).toBe(0);
  });

  it("hires miner when affordable", () => {
    const s = initialState(42, defaultSettings);
    const rich = { ...s, gold: 15 };
    const s2 = reducer(rich, { type: "hire" });
    expect(s2.autoMiners).toBe(1);
    expect(s2.pickaxePower).toBe(2);
    expect(s2.gold).toBe(0);
  });

  it("hire cost doubles each time", () => {
    const s = initialState(42, defaultSettings);
    expect(getHireCost(s)).toBe(15);
    const s2 = reducer({ ...s, gold: 15 }, { type: "hire" });
    expect(getHireCost(s2)).toBe(30);
  });
});

describe("reducer — tick", () => {
  it("tick with no miners does not earn gold", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.gold).toBe(0);
    expect(s2.ticks).toBe(1);
  });

  it("tick with miners earns gold and depth", () => {
    const s = initialState(42, defaultSettings);
    const withMiners = { ...s, autoMiners: 2 };
    const s2 = reducer(withMiners, { type: "tick" });
    expect(s2.gold).toBe(2);
    expect(s2.depth).toBe(2);
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when done", () => {
    const s = initialState(42, defaultSettings);
    const over = { ...s, gameOver: true, gold: 50, depth: 10 };
    const result = isTerminal(over);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(550);
  });
});
