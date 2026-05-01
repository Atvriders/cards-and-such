import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, ROUNDS, godScore } from "./state.js";

const S = { dummy: false };

describe("dice-shrine", () => {
  it("starts with a god assigned", () => {
    const s = initialState(1, S);
    expect(["sun","moon","river"]).toContain(s.god);
  });
  it("offer rolls 3 dice", () => {
    const s = reducer(initialState(2, S), { type: "offer" });
    expect(s.rolls!.length).toBe(3);
  });
  it("godScore differs by deity", () => {
    const r = [6,6,6];
    const s = godScore("sun", r).pts;
    const m = godScore("moon", r).pts;
    expect(s).not.toBe(m);
  });
  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(3, S))).toBeNull();
  });
  it("game ends after ROUNDS rounds", () => {
    let s = initialState(4, S);
    for (let i = 0; i < ROUNDS; i++) {
      s = reducer(s, { type: "offer" });
      if (s.phase === "result") s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });
});
