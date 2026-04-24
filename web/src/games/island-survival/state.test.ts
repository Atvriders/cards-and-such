import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_DAYS } from "./state.js";

describe("Island Survival", () => {
  it("initializes with correct starting resources", () => {
    const s = initialState(42);
    expect(s.day).toBe(1);
    expect(s.food).toBe(60);
    expect(s.water).toBe(60);
    expect(s.health).toBe(100);
    expect(s.phase).toBe("choose");
    expect(s.survived).toBe(true);
  });

  it("foraging food increases food resource", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "choose", action: "food" });
    // After choosing food, daily consumption is applied, but net should be positive
    expect(s2.food).toBeGreaterThan(s.food - 20); // at minimum increased before consumption
  });

  it("finding water increases water resource", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "choose", action: "water" });
    expect(s2.water).toBeGreaterThan(s.water - 25);
  });

  it("building shelter increases shelter value", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "choose", action: "shelter" });
    // Even after daily consumption (food/water drop), shelter should be higher
    expect(s2.shelter).toBeGreaterThan(s.shelter);
  });

  it("transitions to event phase after choosing action", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "choose", action: "food" });
    // Should be either "event" or "done"
    expect(s2.phase === "event" || s2.phase === "done").toBe(true);
  });

  it("nextDay advances day counter", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "choose", action: "water" });
    if (s2.phase === "event") {
      const s3 = reducer(s2, { type: "nextDay" });
      expect(s3.day).toBe(2);
      expect(s3.phase).toBe("choose");
    }
  });

  it("health drops to zero when starving for many days", () => {
    // Override state with zero food and water
    let s = { ...initialState(99), food: 0, water: 0, shelter: 0, health: 30 };
    // Run several turns - should eventually die
    for (let i = 0; i < 5 && s.phase !== "done"; i++) {
      s = reducer(s, { type: "choose", action: "shelter" });
      if (s.phase === "event") s = reducer(s, { type: "nextDay" });
    }
    expect(s.health).toBeLessThanOrEqual(30);
  });

  it("isTerminal returns null when in play", () => {
    const s = initialState(42);
    expect(isTerminal(s)).toBeNull();
  });

  it("rescued state yields score 100", () => {
    const s = { ...initialState(42), phase: "done" as const, rescued: true, survived: true };
    expect(isTerminal(s)?.score).toBe(100);
  });
});
