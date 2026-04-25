import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_SHIFTS, REFUEL_COST, MAX_FUEL } from "./state.js";

describe("Taxi Driver Sim", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(42);
    expect(s.shift).toBe(1);
    expect(s.cash).toBe(50);
    expect(s.fuel).toBe(MAX_FUEL);
    expect(s.phase).toBe("pick");
  });

  it("pickZone moves to drive phase and earns money", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "pickZone", zone: "downtown" });
    expect(s2.phase).toBe("drive");
    expect(s2.fuel).toBeLessThan(MAX_FUEL);
  });

  it("refuel restores fuel and costs cash", () => {
    const s = { ...initialState(42), fuel: 5, cash: 100 };
    const s2 = reducer(s, { type: "refuel" });
    expect(s2.fuel).toBe(MAX_FUEL);
    expect(s2.cash).toBe(100 - REFUEL_COST);
  });

  it("refuel fails with insufficient cash", () => {
    const s = { ...initialState(42), fuel: 5, cash: 5 };
    const s2 = reducer(s, { type: "refuel" });
    expect(s2.fuel).toBe(5);
  });

  it("nextShift advances shift counter", () => {
    const s = { ...initialState(42), phase: "drive" as const, shift: 1 };
    const s2 = reducer(s, { type: "nextShift" });
    expect(s2.shift).toBe(2);
    expect(s2.phase).toBe("pick");
  });

  it("isTerminal only triggers on done", () => {
    const s = initialState(42);
    expect(isTerminal(s)).toBeNull();
  });

  it("completes all shifts", () => {
    let s = initialState(42);
    for (let i = 0; i < TOTAL_SHIFTS; i++) {
      // Ensure enough fuel for downtown (costs 2)
      if (s.fuel < 2) s = { ...s, cash: 200, fuel: MAX_FUEL };
      s = reducer(s, { type: "pickZone", zone: "downtown" });
      s = reducer(s, { type: "nextShift" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });

  it("score is capped at 100", () => {
    const s = { ...initialState(42), phase: "done" as const, cash: 10000 };
    expect(isTerminal(s)!.score).toBe(100);
  });
});
