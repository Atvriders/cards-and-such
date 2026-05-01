import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";

const S = { dummy: false };

describe("dice-bullseye", () => {
  it("starts at round 1", () => {
    const s = initialState(1, S);
    expect(s.round).toBe(1);
    expect(s.score).toBe(0);
  });
  it("shoot rolls 2 dice", () => {
    const s = reducer(initialState(2, S), { type: "shoot", target: 3 });
    expect(s.rolls!.length).toBe(2);
  });
  it("score never decreases", () => {
    let s = initialState(3, S);
    let last = 0;
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type: "shoot", target: 4 });
      expect(s.score).toBeGreaterThanOrEqual(last);
      last = s.score;
      if (s.phase === "result") s = reducer(s, { type: "next" });
    }
  });
  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(4, S))).toBeNull();
  });
  it("game ends after TOTAL_ROUNDS shots", () => {
    let s = initialState(5, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type: "shoot", target: 4 });
      if (s.phase === "result") s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });
});
