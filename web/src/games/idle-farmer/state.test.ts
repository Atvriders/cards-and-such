import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, farmerCost, fieldCost } from "./state.js";

const defaultSettings = { goal: "500" as const };

describe("initialState", () => {
  it("starts with 0 crops and 1 field", () => {
    const s = initialState(1, defaultSettings);
    expect(s.crops).toBe(0);
    expect(s.fields).toBe(1);
    expect(s.autoFarmers).toBe(0);
    expect(s.gameOver).toBe(false);
  });

  it("goal matches setting", () => {
    const s = initialState(1, { goal: "2000" });
    expect(s.goal).toBe(2000);
  });
});

describe("reducer — harvest", () => {
  it("earns crops on harvest", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "harvest" });
    expect(s2.crops).toBeGreaterThanOrEqual(s.harvestPower);
    expect(s2.harvests).toBe(1);
  });

  it("ends game when goal reached", () => {
    const s = initialState(1, defaultSettings);
    const near = { ...s, crops: 498, harvestPower: 5 };
    const s2 = reducer(near, { type: "harvest" });
    expect(s2.gameOver).toBe(true);
  });

  it("is no-op after game over", () => {
    const s = { ...initialState(1, defaultSettings), gameOver: true };
    expect(reducer(s, { type: "harvest" })).toBe(s);
  });
});

describe("reducer — buyFarmer", () => {
  it("refuses without enough crops", () => {
    const s = initialState(1, defaultSettings);
    expect(reducer(s, { type: "buyFarmer" }).autoFarmers).toBe(0);
  });

  it("hires farmer when affordable", () => {
    const s = initialState(1, defaultSettings);
    const cost = farmerCost(0);
    const rich = { ...s, crops: cost };
    const s2 = reducer(rich, { type: "buyFarmer" });
    expect(s2.autoFarmers).toBe(1);
    expect(s2.crops).toBe(0);
    expect(s2.harvestPower).toBe(s.harvestPower + 1);
  });

  it("farmer cost scales", () => {
    expect(farmerCost(0)).toBe(20);
    expect(farmerCost(1)).toBe(40);
  });
});

describe("reducer — buyField", () => {
  it("refuses without enough crops", () => {
    const s = initialState(1, defaultSettings);
    expect(reducer(s, { type: "buyField" }).fields).toBe(1);
  });

  it("adds a field when affordable", () => {
    const s = initialState(1, defaultSettings);
    const cost = fieldCost(1);
    const rich = { ...s, crops: cost };
    const s2 = reducer(rich, { type: "buyField" });
    expect(s2.fields).toBe(2);
  });
});

describe("reducer — tick", () => {
  it("tick with no farmers gives no crops", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.crops).toBe(0);
    expect(s2.ticks).toBe(1);
  });

  it("tick with farmers earns crops", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer({ ...s, autoFarmers: 2, fields: 3 }, { type: "tick" });
    expect(s2.crops).toBe(6); // 2 * 3
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, defaultSettings))).toBeNull();
  });

  it("returns score when done", () => {
    const s = { ...initialState(1, defaultSettings), gameOver: true, crops: 500 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(0);
  });
});
