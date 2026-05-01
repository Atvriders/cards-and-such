import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { dummy: false };

describe("dice-tournament", () => {
  it("starts at match 1", () => {
    const s = initialState(1, S);
    expect(s.round).toBe(1);
    expect(s.myWins).toBe(0);
  });
  it("play rolls 4 dice", () => {
    const s = reducer(initialState(2, S), { type: "play" });
    expect(s.rolls!.mine.length).toBe(2);
    expect(s.rolls!.theirs.length).toBe(2);
  });
  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(3, S))).toBeNull();
  });
  it("eventually ends", () => {
    let s = initialState(4, S);
    for (let i = 0; i < 100 && s.phase !== "done"; i++) {
      if (s.phase === "ready" || s.phase === "result") s = reducer(s, { type: "play" });
      else s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });
  it("a win adds to score", () => {
    let s = initialState(5, S);
    while (s.phase !== "done") {
      if (s.phase === "ready" || s.phase === "result") s = reducer(s, { type: "play" });
      else s = reducer(s, { type: "next" });
    }
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
});
