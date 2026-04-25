import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, prospectorCost, claimCost } from "./state.js";

const defaultSettings = { nuggets: "100" as const };

describe("initialState", () => {
  it("starts with 0 nuggets, 1 claim, 0 prospectors", () => {
    const s = initialState(1, defaultSettings);
    expect(s.nuggets).toBe(0);
    expect(s.claims).toBe(1);
    expect(s.prospectors).toBe(0);
    expect(s.gameOver).toBe(false);
  });

  it("goal matches setting", () => {
    expect(initialState(1, { nuggets: "500" }).goal).toBe(500);
  });
});

describe("reducer — pan", () => {
  it("earns nuggets on pan", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "pan" });
    expect(s2.nuggets).toBeGreaterThanOrEqual(s.panPower * s.claims);
    expect(s2.pans).toBe(1);
  });

  it("ends game when goal reached", () => {
    const s = initialState(1, defaultSettings);
    const near = { ...s, nuggets: 95, panPower: 10 };
    const s2 = reducer(near, { type: "pan" });
    expect(s2.gameOver).toBe(true);
  });

  it("is no-op after game over", () => {
    const s = { ...initialState(1, defaultSettings), gameOver: true };
    expect(reducer(s, { type: "pan" })).toBe(s);
  });
});

describe("reducer — hireProspector", () => {
  it("refuses without nuggets", () => {
    const s = initialState(1, defaultSettings);
    expect(reducer(s, { type: "hireProspector" }).prospectors).toBe(0);
  });

  it("hires when affordable", () => {
    const s = initialState(1, defaultSettings);
    const cost = prospectorCost(0);
    const rich = { ...s, nuggets: cost };
    const s2 = reducer(rich, { type: "hireProspector" });
    expect(s2.prospectors).toBe(1);
    expect(s2.panPower).toBe(s.panPower + 1);
  });

  it("cost doubles", () => {
    expect(prospectorCost(0)).toBe(20);
    expect(prospectorCost(1)).toBe(40);
  });
});

describe("reducer — stakeClaim", () => {
  it("adds claim when affordable", () => {
    const s = initialState(1, defaultSettings);
    const cost = claimCost(1);
    const rich = { ...s, nuggets: cost };
    const s2 = reducer(rich, { type: "stakeClaim" });
    expect(s2.claims).toBe(2);
  });

  it("claim cost scales", () => {
    expect(claimCost(1)).toBe(60);
    expect(claimCost(2)).toBe(120);
  });
});

describe("reducer — tick", () => {
  it("no passive without prospectors", () => {
    const s = initialState(1, defaultSettings);
    expect(reducer(s, { type: "tick" }).nuggets).toBe(0);
  });

  it("prospectors earn nuggets per tick", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer({ ...s, prospectors: 4, claims: 2 }, { type: "tick" });
    expect(s2.nuggets).toBe(8); // 4 * 2
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, defaultSettings))).toBeNull();
  });

  it("returns score on completion", () => {
    const s = { ...initialState(1, defaultSettings), gameOver: true, nuggets: 100 };
    expect(isTerminal(s)!.score).toBeGreaterThan(0);
  });
});
