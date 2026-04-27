import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("DiceStadium", () => {
  it("starts in cheering at round 1", () => { const s = initialState(1, S); expect(s.phase).toBe("cheering"); expect(s.round).toBe(1); });
  it("low cheer rolls dice and scores sum", () => {
    const s = reducer(initialState(1, S), { type:"cheer", level:"low" });
    expect(s.phase).toBe("result");
    expect(s.dice).not.toBeNull();
    if (s.dice) expect(s.score).toBe(s.dice[0] + s.dice[1] + s.dice[2]);
  });
  it("score is non-negative for any cheer", () => { const s = reducer(initialState(1, S), { type:"cheer", level:"high" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after TOTAL_ROUNDS rounds", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type:"cheer", level:"low" });
      if (s.phase !== "done") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
});
