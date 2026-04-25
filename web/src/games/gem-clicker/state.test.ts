import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, minerCost, refineryCost } from "./state.js";

const defaultSettings = { goal: "250" as const };

describe("initialState", () => {
  it("starts with 0 gems, 1 refinery, 0 miners", () => {
    const s = initialState(1, defaultSettings);
    expect(s.gems).toBe(0);
    expect(s.refineries).toBe(1);
    expect(s.miners).toBe(0);
    expect(s.gameOver).toBe(false);
  });

  it("goal matches setting", () => {
    expect(initialState(1, { goal: "1000" }).goal).toBe(1000);
  });
});

describe("reducer — click", () => {
  it("earns gems on click", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "click" });
    expect(s2.gems).toBeGreaterThanOrEqual(s.clickPower * s.refineries);
    expect(s2.clicks).toBe(1);
  });

  it("ends game when goal reached", () => {
    const s = initialState(1, defaultSettings);
    const near = { ...s, gems: 245, clickPower: 10 };
    const s2 = reducer(near, { type: "click" });
    expect(s2.gameOver).toBe(true);
  });

  it("is no-op after game over", () => {
    const s = { ...initialState(1, defaultSettings), gameOver: true };
    expect(reducer(s, { type: "click" })).toBe(s);
  });
});

describe("reducer — hireMiner", () => {
  it("refuses without gems", () => {
    const s = initialState(1, defaultSettings);
    expect(reducer(s, { type: "hireMiner" }).miners).toBe(0);
  });

  it("hires when affordable", () => {
    const s = initialState(1, defaultSettings);
    const cost = minerCost(0);
    const rich = { ...s, gems: cost };
    const s2 = reducer(rich, { type: "hireMiner" });
    expect(s2.miners).toBe(1);
    expect(s2.clickPower).toBe(s.clickPower + 1);
  });

  it("cost doubles each hire", () => {
    expect(minerCost(0)).toBe(15);
    expect(minerCost(1)).toBe(30);
  });
});

describe("reducer — buildRefinery", () => {
  it("builds when affordable", () => {
    const s = initialState(1, defaultSettings);
    const cost = refineryCost(1);
    const rich = { ...s, gems: cost };
    const s2 = reducer(rich, { type: "buildRefinery" });
    expect(s2.refineries).toBe(2);
  });

  it("refinery cost scales by 3x", () => {
    expect(refineryCost(1)).toBe(75);
    expect(refineryCost(2)).toBe(225);
  });
});

describe("reducer — tick", () => {
  it("no passive without miners", () => {
    const s = initialState(1, defaultSettings);
    expect(reducer(s, { type: "tick" }).gems).toBe(0);
  });

  it("miners produce gems each tick", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer({ ...s, miners: 3, refineries: 2 }, { type: "tick" });
    expect(s2.gems).toBe(6); // 3 * 2
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, defaultSettings))).toBeNull();
  });

  it("returns score on completion", () => {
    const s = { ...initialState(1, defaultSettings), gameOver: true, gems: 250 };
    expect(isTerminal(s)!.score).toBeGreaterThan(0);
  });
});
