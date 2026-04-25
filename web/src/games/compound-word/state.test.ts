import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("compound-word", () => {
  it("initialState has 10 puzzles", () => {
    const s = initialState(1);
    expect(s.puzzles).toHaveLength(10);
    expect(s.phase).toBe("playing");
    expect(s.score).toBe(0);
  });

  it("correct answer scores 100 and advances", () => {
    let s = initialState(5);
    const puzzle = s.puzzles[0]!;
    s = reducer(s, { type: "type", text: puzzle.answer });
    s = reducer(s, { type: "submit" });
    expect(s.score).toBe(100);
    expect(s.current).toBe(1);
  });

  it("wrong answer shows error and stays on same puzzle", () => {
    let s = initialState(7);
    s = reducer(s, { type: "type", text: "WRONGWORD" });
    s = reducer(s, { type: "submit" });
    expect(s.error).toBeTruthy();
    expect(s.current).toBe(0);
  });

  it("skip advances without scoring", () => {
    let s = initialState(3);
    s = reducer(s, { type: "skip" });
    expect(s.current).toBe(1);
    expect(s.score).toBe(0);
  });

  it("isTerminal returns null while playing", () => {
    const s = initialState(2);
    expect(isTerminal(s)).toBeNull();
  });
});
