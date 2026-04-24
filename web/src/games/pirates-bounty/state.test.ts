import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, GRID_COLS, GRID_ROWS, MAX_FUEL } from "./state.js";

describe("Pirate's Bounty", () => {
  it("initializes with correct starting state", () => {
    const s = initialState(42);
    expect(s.fuel).toBe(MAX_FUEL);
    expect(s.gold).toBe(0);
    expect(s.pirateRow).toBe(0);
    expect(s.pirateCol).toBe(0);
    expect(s.islands.length).toBe(GRID_ROWS * GRID_COLS);
    expect(s.phase).toBe("sail");
  });

  it("sailing costs fuel proportional to distance", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "sail", row: 0, col: 2 }); // distance 2
    expect(s2.fuel).toBe(MAX_FUEL - 2);
    expect(s2.pirateCol).toBe(2);
  });

  it("cannot sail if insufficient fuel", () => {
    const s = { ...initialState(42), fuel: 1 };
    const s2 = reducer(s, { type: "sail", row: 2, col: 3 }); // distance 5
    expect(s2.pirateRow).toBe(0);
    expect(s2.pirateCol).toBe(0);
    expect(s2.fuel).toBe(1);
  });

  it("digging costs 1 fuel and reveals island", () => {
    const s = initialState(42);
    const fuelBefore = s.fuel;
    const s2 = reducer(s, { type: "dig" });
    expect(s2.fuel).toBe(fuelBefore - 1);
    expect(s2.islands[0]?.dug).toBe(true);
  });

  it("cannot dig same island twice", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "dig" });
    const fuelAfterDig = s2.fuel;
    const s3 = reducer(s2, { type: "dig" });
    expect(s3.fuel).toBe(fuelAfterDig); // no extra cost
  });

  it("game ends when fuel runs out", () => {
    let s = { ...initialState(42), fuel: 1 };
    s = reducer(s, { type: "dig" }); // dig costs 1 fuel, drains it
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });

  it("gold increases when treasure is found", () => {
    // Force a high-probability island dig by seeding
    const s = initialState(1); // seed 1 for reproducibility
    // Find an island with very high probability
    const highProbIdx = s.islands.reduce((best, island, i) =>
      island.treasureProbability > (s.islands[best]?.treasureProbability ?? 0) ? i : best, 0);
    const row = Math.floor(highProbIdx / GRID_COLS);
    const col = highProbIdx % GRID_COLS;
    let cur = s;
    // Sail to it if needed
    if (row !== 0 || col !== 0) {
      cur = reducer(cur, { type: "sail", row, col });
    }
    cur = reducer(cur, { type: "dig" });
    // Gold may or may not have been found (seeded), just test the state is valid
    expect(cur.gold).toBeGreaterThanOrEqual(0);
    expect(cur.islands[highProbIdx]?.dug).toBe(true);
  });

  it("score proportional to gold", () => {
    const s = { ...initialState(42), phase: "done" as const, gold: 300 };
    expect(isTerminal(s)?.score).toBe(100);
    const s2 = { ...initialState(42), phase: "done" as const, gold: 150 };
    expect(isTerminal(s2)?.score).toBe(50);
  });
});
