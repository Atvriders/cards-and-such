import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { rounds: "10" as const };

describe("coup-bluff", () => {
  it("creates 10 rounds", () => {
    expect(initialState(1, S).rounds.length).toBe(10);
  });
  it("starts in playing phase", () => {
    expect(initialState(1, S).phase).toBe("playing");
  });
  it("calling bluff correctly awards score", () => {
    const s = initialState(1, S);
    const r = s.rounds[0]!;
    const decision = r.isBluffing ? "callBluff" : "trust";
    const s2 = reducer(s, { type: "decide", decision });
    expect(s2.score).toBeGreaterThanOrEqual(100);
  });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
  it("next advances round", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "decide", decision: "trust" });
    s = reducer(s, { type: "next" });
    expect(s.currentIndex).toBeGreaterThanOrEqual(1);
  });
});
