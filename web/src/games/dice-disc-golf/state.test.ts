import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_HOLES, DIE_COUNT, PAR } from "./state.js";
const S = { dummy: false };
describe("DiscGolf", () => {
  it("starts at hole 1", () => {
    const s = initialState(1, S);
    expect(s.hole).toBe(1);
    expect(s.totalStrokes).toBe(0);
  });
  it("roll yields dice and strokes", () => {
    const s = reducer(initialState(1, S), { type:"roll" });
    expect(s.dice!.length).toBe(DIE_COUNT);
    expect(s.strokes).toBeGreaterThanOrEqual(1);
  });
  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
  it("ends after holes with valid score", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_HOLES + 4; i++) {
      if (s.phase === "rolling") s = reducer(s, { type:"roll" });
      if (s.phase === "rolled") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
    const t = isTerminal(s);
    expect(t!.score).toBeGreaterThanOrEqual(0);
    expect(t!.score).toBeLessThanOrEqual(100);
  });
  it("PAR is positive", () => {
    expect(PAR).toBeGreaterThan(0);
  });
});
