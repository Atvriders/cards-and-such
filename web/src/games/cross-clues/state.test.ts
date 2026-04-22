import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import { PUZZLES } from "./puzzles.js";

const defaultSettings = { difficulty: "easy" as const };

describe("CrossClues initialState", () => {
  it("creates state with a 3x3 grid", () => {
    const s = initialState(1, defaultSettings);
    expect(s.rowCategories.length).toBe(3);
    expect(s.colCategories.length).toBe(3);
    expect(s.playerGuesses.length).toBe(3);
    s.playerGuesses.forEach(row => expect(row.length).toBe(3));
  });

  it("starts with all empty guesses", () => {
    const s = initialState(1, defaultSettings);
    s.playerGuesses.forEach(row => row.forEach(cell => expect(cell).toBe("")));
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(42, defaultSettings);
    const s2 = initialState(42, defaultSettings);
    expect(s1.puzzleIdx).toBe(s2.puzzleIdx);
    expect(s1.rowCategories).toEqual(s2.rowCategories);
  });

  it("selects a puzzle matching difficulty when possible", () => {
    const hardSettings = { difficulty: "hard" as const };
    // Run a few seeds and verify the puzzle is hard
    let hasHard = false;
    for (let i = 0; i < 20; i++) {
      const s = initialState(i, hardSettings);
      const puzzle = PUZZLES[s.puzzleIdx];
      if (puzzle?.difficulty === "hard") hasHard = true;
    }
    expect(hasHard).toBe(true);
  });
});

describe("CrossClues reducer - cell selection and typing", () => {
  it("selectCell sets activeCell", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "selectCell", row: 1, col: 2 });
    expect(s2.activeCell).toEqual([1, 2]);
  });

  it("typeText updates the active cell", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "selectCell", row: 0, col: 0 });
    const s3 = reducer(s2, { type: "typeText", text: "hello" });
    expect(s3.playerGuesses[0]![0]).toBe("HELLO");
  });

  it("clearCell empties the active cell", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "selectCell", row: 0, col: 0 });
    const s3 = reducer(s2, { type: "typeText", text: "test" });
    const s4 = reducer(s3, { type: "clearCell" });
    expect(s4.playerGuesses[0]![0]).toBe("");
  });
});

describe("CrossClues reducer - hints", () => {
  it("hint reveals a cell with the correct answer", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "hint" });
    expect(s2.hintsUsed).toBe(1);
    expect(s2.hintRevealed.length).toBe(1);
    const [r, c] = s2.hintRevealed[0]!.split(",").map(Number) as [number, number];
    const answer = s2.answers[r]![c]!.toUpperCase();
    expect(s2.playerGuesses[r]![c]).toBe(answer);
  });

  it("hint increments hintsUsed each time", () => {
    let s = initialState(1, defaultSettings);
    s = reducer(s, { type: "hint" });
    s = reducer(s, { type: "hint" });
    expect(s.hintsUsed).toBe(2);
    expect(s.hintRevealed.length).toBe(2);
  });

  it("cannot select a hint-revealed cell", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "hint" });
    const [r, c] = s2.hintRevealed[0]!.split(",").map(Number) as [number, number];
    // Try to select that cell — should not change activeCell to it
    const s3 = reducer(s2, { type: "selectCell", row: r, col: c });
    // The cell is in hintRevealed so selectCell should no-op
    expect(s3.activeCell).toEqual(s2.activeCell);
  });
});

describe("CrossClues reducer - submit", () => {
  it("submit marks correct answers as correct", () => {
    const s = initialState(1, defaultSettings);
    // Fill all answers correctly
    let curr = s;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        curr = reducer(curr, { type: "selectCell", row: r, col: c });
        curr = reducer(curr, { type: "typeText", text: s.answers[r]![c]! });
      }
    }
    const submitted = reducer(curr, { type: "submit" });
    expect(submitted.submitted).toBe(true);
    expect(submitted.won).toBe(true);
    expect(submitted.score).toBe(900);
    Object.values(submitted.checked).forEach(v => expect(v).toBe("correct"));
  });

  it("submit marks wrong answers as wrong", () => {
    const s = initialState(1, defaultSettings);
    const submitted = reducer(s, { type: "submit" }); // all empty = wrong
    expect(submitted.submitted).toBe(true);
    expect(submitted.won).toBe(false);
    Object.values(submitted.checked).forEach(v => expect(v).toBe("wrong"));
  });

  it("hints reduce score", () => {
    let s = initialState(1, defaultSettings);
    s = reducer(s, { type: "hint" }); // 1 hint = -50
    let curr = s;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        curr = reducer(curr, { type: "selectCell", row: r, col: c });
        curr = reducer(curr, { type: "typeText", text: s.answers[r]![c]! });
      }
    }
    const submitted = reducer(curr, { type: "submit" });
    expect(submitted.score).toBe(850); // 900 - 50
  });

  it("no further actions after submitted", () => {
    const s = initialState(1, defaultSettings);
    const submitted = reducer(s, { type: "submit" });
    const s2 = reducer(submitted, { type: "selectCell", row: 0, col: 0 });
    expect(s2).toBe(submitted);
  });
});

describe("CrossClues isTerminal", () => {
  it("returns null before submit", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score after submit", () => {
    const s = initialState(1, defaultSettings);
    const submitted = reducer(s, { type: "submit" });
    const result = isTerminal(submitted);
    expect(result).not.toBeNull();
    expect(typeof result!.score).toBe("number");
  });
});

describe("CrossClues PUZZLES", () => {
  it("all puzzles have 3 row and 3 col categories", () => {
    PUZZLES.forEach(p => {
      expect(p.rowCategories.length).toBe(3);
      expect(p.colCategories.length).toBe(3);
    });
  });

  it("all puzzles have a 3x3 answer grid", () => {
    PUZZLES.forEach(p => {
      expect(p.answers.length).toBe(3);
      p.answers.forEach(row => expect(row.length).toBe(3));
    });
  });
});
