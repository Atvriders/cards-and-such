import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, avgHappiness, TOTAL_TURNS } from "./state.js";

describe("Zoo Keeper", () => {
  it("initializes with 5 animals and correct defaults", () => {
    const s = initialState(42);
    expect(s.animals.length).toBe(5);
    expect(s.turn).toBe(1);
    expect(s.phase).toBe("action");
    expect(s.animals[0]?.happiness).toBe(70);
  });

  it("feeding reduces hunger and increases happiness", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "feed", animalIndex: 0 });
    expect(s2.animals[0]?.hunger).toBeLessThan(s.animals[0]?.hunger ?? 100);
    expect(s2.animals[0]?.happiness).toBeGreaterThanOrEqual(s.animals[0]?.happiness ?? 0);
  });

  it("cleaning reduces dirt and increases happiness", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "clean", animalIndex: 1 });
    expect(s2.animals[1]?.dirt).toBeLessThan(s.animals[1]?.dirt ?? 100);
    expect(s2.animals[1]?.happiness).toBeGreaterThanOrEqual(s.animals[1]?.happiness ?? 0);
  });

  it("letVisit generates revenue based on happiness", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "letVisit" });
    expect(s2.totalRevenue).toBeGreaterThan(0);
    expect(s2.visitors).toBeGreaterThan(0);
  });

  it("endTurn advances turn and increases hunger/dirt", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "endTurn" });
    expect(s2.turn).toBe(2);
    expect(s2.animals[0]?.hunger).toBeGreaterThan(s.animals[0]?.hunger ?? 0);
    expect(s2.animals[0]?.dirt).toBeGreaterThan(s.animals[0]?.dirt ?? 0);
  });

  it("avgHappiness calculates mean across all animals", () => {
    const s = initialState(42);
    const avg = avgHappiness(s);
    expect(avg).toBe(70);
  });

  it("game completes after 30 turns", () => {
    let s = initialState(42);
    for (let i = 0; i < TOTAL_TURNS; i++) {
      s = reducer(s, { type: "endTurn" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });

  it("score reflects final average happiness", () => {
    const s = { ...initialState(42), phase: "done" as const };
    const term = isTerminal(s);
    expect(term?.score).toBe(avgHappiness(s));
  });
});
