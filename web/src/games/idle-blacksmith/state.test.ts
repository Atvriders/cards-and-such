import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, helperCost, anvilCost } from "./state.js";

const defaultSettings = { goal: "200" as const };

describe("initialState", () => {
  it("starts with 0 iron and no helpers", () => {
    const s = initialState(1, defaultSettings);
    expect(s.iron).toBe(0);
    expect(s.helpers).toBe(0);
    expect(s.anvils).toBe(0);
    expect(s.gameOver).toBe(false);
  });

  it("goal matches setting", () => {
    expect(initialState(1, { goal: "1000" }).goal).toBe(1000);
  });
});

describe("reducer — forge", () => {
  it("earns iron on forge", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "forge" });
    expect(s2.iron).toBeGreaterThanOrEqual(s.forgePower);
    expect(s2.forges).toBe(1);
  });

  it("ends game when goal reached", () => {
    const s = initialState(1, defaultSettings);
    const near = { ...s, iron: 195, forgePower: 10 };
    const s2 = reducer(near, { type: "forge" });
    expect(s2.gameOver).toBe(true);
  });

  it("is no-op after game over", () => {
    const s = { ...initialState(1, defaultSettings), gameOver: true };
    expect(reducer(s, { type: "forge" })).toBe(s);
  });
});

describe("reducer — hireHelper", () => {
  it("refuses without iron", () => {
    const s = initialState(1, defaultSettings);
    expect(reducer(s, { type: "hireHelper" }).helpers).toBe(0);
  });

  it("hires when affordable", () => {
    const s = initialState(1, defaultSettings);
    const cost = helperCost(0);
    const rich = { ...s, iron: cost };
    const s2 = reducer(rich, { type: "hireHelper" });
    expect(s2.helpers).toBe(1);
    expect(s2.forgePower).toBe(s.forgePower + 2);
  });

  it("cost scales", () => {
    expect(helperCost(0)).toBe(18);
    expect(helperCost(1)).toBe(36);
  });
});

describe("reducer — buyAnvil", () => {
  it("adds anvil when affordable", () => {
    const s = initialState(1, defaultSettings);
    const cost = anvilCost(0);
    const rich = { ...s, iron: cost };
    const s2 = reducer(rich, { type: "buyAnvil" });
    expect(s2.anvils).toBe(1);
  });
});

describe("reducer — tick", () => {
  it("no passive without helpers or anvils", () => {
    const s = initialState(1, defaultSettings);
    expect(reducer(s, { type: "tick" }).iron).toBe(0);
  });

  it("anvils produce 2x passive per tick", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer({ ...s, anvils: 2, helpers: 1 }, { type: "tick" });
    expect(s2.iron).toBe(1 + 2 * 2); // helpers + anvils * 2
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, defaultSettings))).toBeNull();
  });

  it("returns score when done", () => {
    const s = { ...initialState(1, defaultSettings), gameOver: true, iron: 200 };
    expect(isTerminal(s)!.score).toBeGreaterThan(0);
  });
});
