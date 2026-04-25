import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Aquarium Keeper", () => {
  it("initializes correctly", () => {
    const s = initialState(5);
    expect(s.day).toBe(1);
    expect(s.water).toBe(80);
    expect(s.food).toBe(60);
    expect(s.temperature).toBe(24);
    expect(s.fish).toHaveLength(5);
    expect(s.phase).toBe("playing");
  });

  it("cleanWater increases water level", () => {
    const s = initialState(5);
    const s2 = reducer({ ...s, water: 50 }, { type: "cleanWater" });
    expect(s2.water).toBe(80);
  });

  it("addFood increases food level", () => {
    const s = initialState(5);
    const s2 = reducer({ ...s, food: 30 }, { type: "addFood", amount: 20 });
    expect(s2.food).toBe(50);
  });

  it("adjustTemp changes temperature within bounds", () => {
    const s = initialState(5);
    const s2 = reducer(s, { type: "adjustTemp", delta: 3 });
    expect(s2.temperature).toBe(27);
    const s3 = reducer(s, { type: "adjustTemp", delta: -10 });
    expect(s3.temperature).toBe(18); // clamped
  });

  it("nextDay increments day and decays water/food", () => {
    const s = initialState(5);
    const s2 = reducer(s, { type: "nextDay" });
    expect(s2.day).toBe(2);
    expect(s2.water).toBeLessThan(s.water);
    expect(s2.food).toBeLessThan(s.food);
  });

  it("isTerminal returns null while playing", () => {
    expect(isTerminal(initialState(5))).toBeNull();
  });

  it("game ends after totalDays", () => {
    let s = initialState(5);
    s = { ...s, day: s.totalDays };
    const s2 = reducer(s, { type: "nextDay" });
    expect(s2.phase).toBe("done");
  });
});
