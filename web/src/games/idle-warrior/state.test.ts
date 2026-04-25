import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, recruitCost, trainCost } from "./state.js";

const defaultSettings = { enemies: "20" as const };

describe("initialState", () => {
  it("starts with 0 enemies defeated", () => {
    const s = initialState(1, defaultSettings);
    expect(s.enemiesDefeated).toBe(0);
    expect(s.soldiers).toBe(0);
    expect(s.gold).toBe(0);
    expect(s.gameOver).toBe(false);
  });

  it("targetEnemies matches setting", () => {
    expect(initialState(1, { enemies: "50" }).targetEnemies).toBe(50);
  });
});

describe("reducer — strike", () => {
  it("earns gold and defeats enemies", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "strike" });
    expect(s2.gold).toBeGreaterThanOrEqual(1);
    expect(s2.enemiesDefeated).toBeGreaterThanOrEqual(1);
    expect(s2.strikes).toBe(1);
  });

  it("ends game when all enemies defeated", () => {
    const s = initialState(1, defaultSettings);
    const near = { ...s, enemiesDefeated: 19, attackPower: 5 };
    const s2 = reducer(near, { type: "strike" });
    expect(s2.gameOver).toBe(true);
  });

  it("is no-op after game over", () => {
    const s = { ...initialState(1, defaultSettings), gameOver: true };
    expect(reducer(s, { type: "strike" })).toBe(s);
  });
});

describe("reducer — recruit", () => {
  it("refuses without gold", () => {
    const s = initialState(1, defaultSettings);
    expect(reducer(s, { type: "recruit" }).soldiers).toBe(0);
  });

  it("recruits when affordable", () => {
    const s = initialState(1, defaultSettings);
    const cost = recruitCost(0);
    const rich = { ...s, gold: cost };
    const s2 = reducer(rich, { type: "recruit" });
    expect(s2.soldiers).toBe(1);
  });

  it("cost doubles each time", () => {
    expect(recruitCost(0)).toBe(30);
    expect(recruitCost(1)).toBe(60);
  });
});

describe("reducer — train", () => {
  it("increases attack power when affordable", () => {
    const s = initialState(1, defaultSettings);
    const cost = trainCost(1);
    const rich = { ...s, gold: cost };
    const s2 = reducer(rich, { type: "train" });
    expect(s2.attackPower).toBe(2);
  });

  it("refuses training without gold", () => {
    const s = initialState(1, defaultSettings);
    expect(reducer(s, { type: "train" }).attackPower).toBe(1);
  });
});

describe("reducer — tick", () => {
  it("no passive without soldiers", () => {
    const s = initialState(1, defaultSettings);
    expect(reducer(s, { type: "tick" }).enemiesDefeated).toBe(0);
  });

  it("soldiers defeat enemies each tick", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer({ ...s, soldiers: 3 }, { type: "tick" });
    expect(s2.enemiesDefeated).toBe(3);
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, defaultSettings))).toBeNull();
  });

  it("returns score on completion", () => {
    const s = { ...initialState(1, defaultSettings), gameOver: true, gold: 100, soldiers: 2 };
    expect(isTerminal(s)!.score).toBeGreaterThan(0);
  });
});
