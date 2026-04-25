import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("phrase-puzzle", () => {
  it("initialState creates 8 puzzles", () => {
    const s = initialState(1);
    expect(s.puzzles).toHaveLength(8);
    expect(s.phase).toBe("playing");
    expect(s.score).toBe(0);
  });

  it("blanks match underscores in blankedPhrase", () => {
    const s = initialState(2);
    const puzzle = s.puzzles[0]!;
    const blanks = s.blankIndexes[0]!;
    const underscoreCount = puzzle.blankedPhrase.split("").filter(c => c === "_").length;
    expect(blanks.length).toBe(underscoreCount);
  });

  it("correct answers score 100 points", () => {
    let s = initialState(3);
    const puzzle = s.puzzles[0]!;
    const blanks = s.blankIndexes[0]!;
    // Fill in correct answers
    for (let i = 0; i < blanks.length; i++) {
      const correctChar = puzzle.phrase[blanks[i]!] ?? "";
      s = reducer(s, { type: "type", puzzleIdx: 0, blankPos: i, char: correctChar });
    }
    s = reducer(s, { type: "check" });
    expect(s.solved[0]).toBe(true);
    expect(s.score).toBe(100);
  });

  it("wrong answers score 0 and reveal phrase", () => {
    let s = initialState(4);
    // Submit without filling in blanks (all empty = wrong)
    s = reducer(s, { type: "check" });
    expect(s.solved[0]).toBe(false);
    expect(s.score).toBe(0);
    expect(s.message).toContain(s.puzzles[0]!.phrase.slice(0, 5));
  });

  it("next advances to next puzzle", () => {
    let s = initialState(5);
    s = reducer(s, { type: "check" });
    s = reducer(s, { type: "next" });
    expect(s.current).toBe(1);
    expect(s.checked).toBe(false);
  });
});
