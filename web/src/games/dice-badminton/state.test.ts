import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: true };
describe("DiceBadmintonState", () => {
  it("starts in rolling phase", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("rolling");
    expect(s.round).toBe(1);
  });
  it("rolling produces dice and advances", () => {
    const s = reducer(initialState(2, S), { type: "roll" });
    expect(s.dice).not.toBeNull();
    expect(["rolled", "done"]).toContain(s.phase);
  });
  it("isTerminal null mid-game", () => {
    expect(isTerminal(initialState(3, S))).toBeNull();
  });
  it("game finishes with non-negative score", () => {
    let s = initialState(4, S);
    for (let i = 0; i < TOTAL_ROUNDS * 4 + 10; i++) {
      if (s.phase === "done") break;
      if (s.phase === "rolling") s = reducer(s, { type: "roll" });
      if (s.phase === "rolled") s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(0);
  });
  it("seed is deterministic", () => {
    const play = (seed: number) => {
      let s = initialState(seed, S);
      for (let i = 0; i < TOTAL_ROUNDS * 4 + 10; i++) {
        if (s.phase === "done") break;
        if (s.phase === "rolling") s = reducer(s, { type: "roll" });
        if (s.phase === "rolled") s = reducer(s, { type: "next" });
      }
      return s.score;
    };
    expect(play(99)).toBe(play(99));
  });
});
