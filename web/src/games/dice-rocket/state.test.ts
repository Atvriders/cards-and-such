import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, GOAL, MAX_ROLLS } from "./state.js";
const S = { dummy: false };
describe("DiceRocket", () => {
  it("starts at altitude 0", () => {
    const s = initialState(1, S);
    expect(s.altitude).toBe(0);
    expect(s.phase).toBe("playing");
  });
  it("boost adds 1-6 altitude", () => {
    const s = reducer(initialState(1, S), { type:"boost" });
    expect(s.altitude).toBeGreaterThanOrEqual(1);
    expect(s.altitude).toBeLessThanOrEqual(6);
    expect(s.rolls).toBe(1);
  });
  it("game ends after MAX_ROLLS", () => {
    let s = initialState(1, S);
    for (let i = 0; i < MAX_ROLLS; i++) s = reducer(s, { type:"boost" });
    expect(s.phase).toBe("done");
  });
  it("reaching GOAL ends game", () => {
    let s = initialState(1, S);
    let cnt = 0;
    while (s.phase === "playing" && cnt++ < 100) s = reducer(s, { type:"boost" });
    expect(s.phase).toBe("done");
    if (s.altitude >= GOAL) expect(isTerminal(s)?.score).toBeGreaterThanOrEqual(50);
  });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
