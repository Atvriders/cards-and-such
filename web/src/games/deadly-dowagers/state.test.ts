import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { puzzles: "10" as const };

describe("deadly-dowagers", () => {
  it("creates puzzles", () => {
    expect(initialState(1, S).puzzles.length).toBeGreaterThanOrEqual(4);
  });
  it("starts in playing phase", () => {
    expect(initialState(1, S).phase).toBe("playing");
  });
  it("submitting correct earns score", () => {
    const s = initialState(1, S);
    const s2 = reducer(reducer(s, { type: "select", index: s.puzzles[0]!.correctIndex }), { type: "submit" });
    expect(s2.score).toBeGreaterThanOrEqual(100);
  });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
  it("next advances", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "select", index: 0 });
    s = reducer(s, { type: "submit" });
    s = reducer(s, { type: "next" });
    expect(s.currentIndex).toBeGreaterThanOrEqual(1);
  });
});
