import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { dummy: false };

describe("spot-it-jr", () => {
  it("creates rounds", () => {
    expect(initialState(1, S).rounds.length).toBeGreaterThanOrEqual(10);
  });
  it("starts playing", () => {
    expect(initialState(1, S).phase).toBe("playing");
  });
  it("submitting correct scores", () => {
    const s = initialState(1, S);
    const s2 = reducer(reducer(s, { type: "select", choice: s.rounds[0]!.correct }), { type: "submit" });
    expect(s2.score).toBeGreaterThanOrEqual(10);
  });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
  it("next advances", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "select", choice: 0 });
    s = reducer(s, { type: "submit" });
    s = reducer(s, { type: "next" });
    expect(s.currentIndex).toBeGreaterThanOrEqual(1);
  });
});
