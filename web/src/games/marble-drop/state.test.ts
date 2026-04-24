import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const SEED = 33;
const SETTINGS = { marbles: "5" as const };

describe("marble-drop state", () => {
  it("initializes correctly", () => {
    const s = initialState(SEED, SETTINGS);
    expect(s.totalMarbles).toBe(5);
    expect(s.marblesDropped).toBe(0);
    expect(s.pegs.length).toBeGreaterThan(0);
  });

  it("drop adds a marble", () => {
    const s = initialState(SEED, SETTINGS);
    const s2 = reducer(s, { type: "drop", x: 0.5 });
    expect(s2.marbles.length).toBe(1);
    expect(s2.marblesDropped).toBe(1);
  });

  it("tick moves marble downward", () => {
    const s = initialState(SEED, SETTINGS);
    const s2 = reducer(s, { type: "drop", x: 0.5 });
    const s3 = reducer(s2, { type: "tick", dt: 0.05 });
    expect(s3.marbles[0]!.y).toBeGreaterThan(s2.marbles[0]!.y);
  });

  it("slot values match expected pattern", () => {
    const s = initialState(SEED, SETTINGS);
    expect(s.slotValues[0]).toBe(5);
    expect(s.slotValues[3]).toBe(50); // centre
  });

  it("isTerminal null when marbles remain", () => {
    const s = initialState(SEED, SETTINGS);
    expect(isTerminal(s)).toBeNull();
  });
});
