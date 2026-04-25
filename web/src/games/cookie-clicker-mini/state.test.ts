import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, upgradeNextCost } from "./state.js";

const defaultSettings = { goal: "100" as const };

describe("initialState", () => {
  it("starts with 0 cookies and no upgrades", () => {
    const s = initialState(42, defaultSettings);
    expect(s.cookies).toBe(0);
    expect(s.upgrades).toBe(0);
    expect(s.cps).toBe(1);
    expect(s.gameOver).toBe(false);
  });

  it("sets goal from settings", () => {
    const s = initialState(1, { goal: "500" });
    expect(s.goal).toBe(500);
  });
});

describe("reducer — click", () => {
  it("adds cookies on click", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "click" });
    expect(s2.cookies).toBeGreaterThanOrEqual(1);
    expect(s2.clicks).toBe(1);
  });

  it("game ends when goal reached", () => {
    const s = initialState(42, defaultSettings);
    const near = { ...s, cookies: 99 };
    const s2 = reducer(near, { type: "click" });
    expect(s2.gameOver).toBe(true);
  });

  it("no-op after game over", () => {
    const s = initialState(42, defaultSettings);
    const over = { ...s, gameOver: true };
    expect(reducer(over, { type: "click" })).toBe(over);
  });
});

describe("reducer — upgrade", () => {
  it("refuses upgrade if not enough cookies", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "upgrade" });
    expect(s2.upgrades).toBe(0); // no upgrade
  });

  it("buys upgrade when affordable", () => {
    const s = initialState(42, defaultSettings);
    const rich = { ...s, cookies: 10 };
    const s2 = reducer(rich, { type: "upgrade" });
    expect(s2.upgrades).toBe(1);
    expect(s2.cps).toBe(3);
    expect(s2.autoPerTick).toBe(1);
    expect(s2.cookies).toBe(0);
  });

  it("upgrade cost grows exponentially", () => {
    const s = initialState(42, defaultSettings);
    expect(upgradeNextCost(s)).toBe(10);
    const s2 = reducer({ ...s, cookies: 10 }, { type: "upgrade" });
    expect(upgradeNextCost(s2)).toBe(30);
  });
});

describe("reducer — tick", () => {
  it("tick with no auto does not add cookies", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.cookies).toBe(0);
    expect(s2.ticks).toBe(1);
  });

  it("tick with auto adds cookies", () => {
    const s = initialState(42, defaultSettings);
    const withAuto = { ...s, autoPerTick: 2 };
    const s2 = reducer(withAuto, { type: "tick" });
    expect(s2.cookies).toBe(2);
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when game over", () => {
    const s = initialState(42, defaultSettings);
    const over = { ...s, gameOver: true, cookies: 100, clicks: 50, ticks: 10 };
    const result = isTerminal(over);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(0);
  });
});
