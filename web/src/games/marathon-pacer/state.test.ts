import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_MILES } from "./state.js";

describe("Marathon Pacer", () => {
  it("initializes in running phase with full energy", () => {
    const s = initialState(1);
    expect(s.phase).toBe("running");
    expect(s.energy).toBe(100);
    expect(s.mile).toBe(0);
    expect(s.boosts).toBe(5);
  });

  it("surge decreases pace and energy, uses a boost", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "surge" });
    expect(s2.pace).toBeLessThan(s.pace);
    expect(s2.energy).toBeLessThan(s.energy);
    expect(s2.boosts).toBe(s.boosts - 1);
  });

  it("surge does nothing when no boosts left", () => {
    const s = { ...initialState(1), boosts: 0 };
    const s2 = reducer(s, { type: "surge" });
    expect(s2.pace).toBe(s.pace);
    expect(s2.boosts).toBe(0);
  });

  it("recover increases pace and energy", () => {
    const s = { ...initialState(1), pace: 400, energy: 50 };
    const s2 = reducer(s, { type: "recover" });
    expect(s2.pace).toBeGreaterThan(400);
    expect(s2.energy).toBeGreaterThan(50);
  });

  it("tick advances mileProgress", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.mileProgress).toBeGreaterThan(0);
    expect(s2.tick).toBe(1);
  });

  it("completing all miles ends in done", () => {
    let s = initialState(1);
    s = { ...s, pace: 1 };
    let ticks = 0;
    while (s.phase === "running" && ticks < 10000) {
      s = reducer(s, { type: "tick" });
      ticks++;
    }
    expect(s.phase).toBe("done");
    expect(s.mile).toBe(TOTAL_MILES);
  });

  it("isTerminal returns null while running", () => {
    const s = initialState(1);
    expect(isTerminal(s)).toBeNull();
  });

  it("isTerminal returns score when done", () => {
    const s = initialState(1);
    const result = isTerminal({ ...s, phase: "done", score: 75 });
    expect(result).not.toBeNull();
    expect(result!.score).toBe(75);
  });
});
