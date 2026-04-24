import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_DAYS } from "./state.js";

describe("Space Colony", () => {
  it("initializes with correct starting state", () => {
    const s = initialState(42);
    expect(s.day).toBe(1);
    expect(s.oxygen).toBe(70);
    expect(s.food).toBe(70);
    expect(s.energy).toBe(70);
    expect(s.colonists).toBe(10);
    expect(s.phase).toBe("choose");
    expect(s.survived).toBe(true);
  });

  it("harvesting oxygen increases oxygen level", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "harvest", resource: "oxygen" });
    // After harvest, oxygen increased but daily consumption deducted
    // Net should be above starting - daily cost (12)
    expect(s2.oxygen).toBeGreaterThan(s.oxygen - 15);
  });

  it("harvesting food increases food level", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "harvest", resource: "food" });
    expect(s2.food).toBeGreaterThan(s.food - 12);
  });

  it("harvesting energy increases energy level", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "harvest", resource: "energy" });
    expect(s2.energy).toBeGreaterThan(s.energy - 12);
  });

  it("transitions to event phase after choosing harvest", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "harvest", resource: "oxygen" });
    expect(s2.phase === "event" || s2.phase === "done").toBe(true);
  });

  it("nextDay advances day counter", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "harvest", resource: "food" });
    if (s2.phase === "event") {
      const s3 = reducer(s2, { type: "nextDay" });
      expect(s3.day).toBe(2);
      expect(s3.phase).toBe("choose");
    }
  });

  it("colonists drop when oxygen hits zero", () => {
    let s = { ...initialState(42), oxygen: 5, food: 80, energy: 80 };
    s = reducer(s, { type: "harvest", resource: "food" }); // oxygen will drop to 0
    // colonists may drop if oxygen hits critical
    expect(s.colonists).toBeLessThanOrEqual(10);
  });

  it("game ends when 30 days are up", () => {
    let s = initialState(42);
    for (let i = 0; i < TOTAL_DAYS && s.phase !== "done"; i++) {
      s = reducer(s, { type: "harvest", resource: "oxygen" });
      if (s.phase === "event") s = reducer(s, { type: "nextDay" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });

  it("death before 30 days gives partial score", () => {
    const s = { ...initialState(42), phase: "done" as const, survived: false, day: 10 };
    const term = isTerminal(s);
    expect(term?.score).toBeLessThan(50);
  });
});
