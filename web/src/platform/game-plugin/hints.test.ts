import { describe, it, expect } from "vitest";
import { inferHint } from "./hints.js";

describe("inferHint", () => {
  it("returns null for non-object/empty input and unrecognised shapes", () => {
    expect(inferHint(null)).toBeNull();
    expect(inferHint(undefined)).toBeNull();
    expect(inferHint(42)).toBeNull();
    expect(inferHint("hello")).toBeNull();
    expect(inferHint({})).toBeNull();
    expect(inferHint({ foo: "bar", baz: 1 })).toBeNull();
  });

  it("eliminates a wrong choice for quiz-shaped state, avoiding the user's selection", () => {
    const state = {
      currentIndex: 0,
      selected: 1,
      questions: [
        { correct: 2, choices: ["w", "x", "y", "z"] },
      ],
    };
    const hint = inferHint(state);
    expect(hint).not.toBeNull();
    // pick must be a wrong index (not correct=2) and not the user's selection=1
    expect(hint!.eliminatedChoice).toBe(0);
    expect(hint!.message).toBe("Eliminate one wrong answer: A is incorrect.");

    // Suppressed after submission
    expect(inferHint({ ...state, submitted: true })).toBeNull();
    expect(inferHint({ ...state, phase: "result" })).toBeNull();
    expect(inferHint({ ...state, phase: "done" })).toBeNull();
  });

  it("reveals the first empty non-given sudoku cell with row/col formatting for 9x9", () => {
    const current = new Array(81).fill(0);
    const given = new Array(81).fill(0);
    const solution = new Array(81).fill(0).map((_, i) => ((i % 9) + 1));

    // Mark first cell as given+filled so it gets skipped; index 1 is the first empty non-given cell.
    current[0] = 1;
    given[0] = 1;

    const hint = inferHint({ current, solution, given });
    expect(hint).not.toBeNull();
    expect(hint!.revealedIndex).toBe(1);
    // index 1 -> row 1, col 2; solution[1] = 2
    expect(hint!.message).toBe("Reveal one cell: row 1, col 2 is 2.");

    // Fully filled grid -> no hint
    const filled = solution.slice();
    expect(
      inferHint({ current: filled, solution, given: new Array(81).fill(0) }),
    ).toBeNull();
  });
});
