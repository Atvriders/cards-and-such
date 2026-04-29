import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS, TARGET_SCORE } from "./state.js";
const S = { dummy: false };
describe("HanabiAvenueBonus", () => {
  it("starts in ready", () => { const s = initialState(1, S); expect(s.phase).toBe("ready"); expect(s.teamScore).toBe(0); });
  it("play produces rolls and points", () => {
    const s = reducer(initialState(1, S), { type: "play" });
    expect(s.playerRoll).toBeGreaterThanOrEqual(1);
    expect(s.cpuRoll).toBeGreaterThanOrEqual(1);
    expect(s.lastPts).toBeGreaterThanOrEqual(2);
  });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after total rounds", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type: "play" });
      if (s.phase === "rolled") s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });
  it("target score is set", () => { expect(TARGET_SCORE).toBeGreaterThanOrEqual(1); });
  it("score grows with rolls", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "play" });
    expect(s.teamScore).toBeGreaterThanOrEqual(2);
  });
});
