import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, ROUNDS } from "./state.js";

const S = { dummy: false };

describe("dice-courtroom", () => {
  it("starts at round 1", () => {
    const s = initialState(1, S);
    expect(s.round).toBe(1);
    expect(s.myEvidence).toBe(0);
    expect(s.oppEvidence).toBe(0);
  });
  it("evidence move adds to my evidence", () => {
    const s = reducer(initialState(2, S), { type: "play", move: "evidence" });
    expect(s.myEvidence).toBeGreaterThan(0);
  });
  it("objection rolls dice for both sides", () => {
    const s = reducer(initialState(3, S), { type: "play", move: "objection" });
    expect(s.rolls).not.toBeNull();
    expect(s.rolls!.mine.length).toBe(2);
    expect(s.rolls!.opp.length).toBe(2);
  });
  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(4, S))).toBeNull();
  });
  it("game ends after ROUNDS rounds", () => {
    let s = initialState(5, S);
    for (let i = 0; i < ROUNDS; i++) {
      s = reducer(s, { type: "play", move: "evidence" });
      if (s.phase === "result") s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });
  it("verdict bonus applies on done", () => {
    let s = initialState(7, S);
    for (let i = 0; i < ROUNDS; i++) {
      s = reducer(s, { type: "play", move: "evidence" });
      if (s.phase === "result") s = reducer(s, { type: "next" });
    }
    expect(s.log.length).toBeGreaterThan(0);
  });
});
