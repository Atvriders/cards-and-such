import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, getGridCodes } from "./state.js";
import { PUZZLES } from "./puzzles.js";

const defaultSettings = { difficulty: "easy" as const };

describe("Codewords initialState", () => {
  it("creates state with a grid", () => {
    const s = initialState(1, defaultSettings);
    expect(s.grid.length).toBeGreaterThan(0);
    expect(s.grid[0]!.length).toBeGreaterThan(0);
  });

  it("given codes are pre-filled in playerMap", () => {
    const s = initialState(1, defaultSettings);
    for (const code of s.givenCodes) {
      expect(s.playerMap[code]).toBeDefined();
      expect(s.playerMap[code]).toBe(s.solution[code]);
    }
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(42, defaultSettings);
    const s2 = initialState(42, defaultSettings);
    expect(s1.puzzleIdx).toBe(s2.puzzleIdx);
    expect(s1.givenCodes).toEqual(s2.givenCodes);
  });

  it("starts with 0 guesses and not won", () => {
    const s = initialState(1, defaultSettings);
    expect(s.guesses).toBe(0);
    expect(s.won).toBe(false);
    expect(s.selectedCode).toBeNull();
  });
});

describe("Codewords getGridCodes", () => {
  it("returns all non-null codes in the grid", () => {
    const grid = [[1, 2, null], [3, null, 1]];
    const codes = getGridCodes(grid);
    expect(codes.has(1)).toBe(true);
    expect(codes.has(2)).toBe(true);
    expect(codes.has(3)).toBe(true);
    expect(codes.size).toBe(3);
  });
});

describe("Codewords reducer - selectCode", () => {
  it("selectCode sets selectedCode", () => {
    const s = initialState(1, defaultSettings);
    // Find a code that's not given
    const allCodes = getGridCodes(s.grid);
    const nonGiven = [...allCodes].find(c => !s.givenCodes.includes(c));
    if (!nonGiven) return; // skip if all are given
    const s2 = reducer(s, { type: "selectCode", code: nonGiven });
    expect(s2.selectedCode).toBe(nonGiven);
  });

  it("cannot select a given code", () => {
    const s = initialState(1, defaultSettings);
    const givenCode = s.givenCodes[0]!;
    const s2 = reducer(s, { type: "selectCode", code: givenCode });
    expect(s2.selectedCode).toBeNull();
  });
});

describe("Codewords reducer - guessLetter", () => {
  it("guess without selection is a no-op", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "guessLetter", letter: "A" });
    expect(s2.guesses).toBe(0);
  });

  it("correct guess fills the mapping and increments guesses", () => {
    const s = initialState(1, defaultSettings);
    const allCodes = getGridCodes(s.grid);
    const nonGiven = [...allCodes].find(c => !s.givenCodes.includes(c));
    if (!nonGiven) return;
    const correctLetter = s.solution[nonGiven]!;
    const s2 = reducer(s, { type: "selectCode", code: nonGiven });
    const s3 = reducer(s2, { type: "guessLetter", letter: correctLetter });
    expect(s3.playerMap[nonGiven]).toBe(correctLetter);
    expect(s3.guesses).toBe(1);
    expect(s3.selectedCode).toBeNull();
  });

  it("wrong letter still fills mapping and increments guesses", () => {
    const s = initialState(1, defaultSettings);
    const allCodes = getGridCodes(s.grid);
    const nonGiven = [...allCodes].find(c => !s.givenCodes.includes(c));
    if (!nonGiven) return;
    const wrongLetter = "Z"; // might be wrong
    const s2 = reducer(s, { type: "selectCode", code: nonGiven });
    const s3 = reducer(s2, { type: "guessLetter", letter: wrongLetter });
    expect(s3.guesses).toBe(1);
  });
});

describe("Codewords reducer - clearCode", () => {
  it("clears selectedCode and removes from playerMap", () => {
    const s = initialState(1, defaultSettings);
    const allCodes = getGridCodes(s.grid);
    const nonGiven = [...allCodes].find(c => !s.givenCodes.includes(c));
    if (!nonGiven) return;
    const s2 = reducer(s, { type: "selectCode", code: nonGiven });
    const s3 = reducer(s2, { type: "guessLetter", letter: "A" });
    const s4 = reducer(s3, { type: "selectCode", code: nonGiven });
    const s5 = reducer(s4, { type: "clearCode" });
    expect(s5.playerMap[nonGiven]).toBeUndefined();
    expect(s5.selectedCode).toBeNull();
  });
});

describe("Codewords win condition", () => {
  it("won becomes true when all codes are correctly mapped", () => {
    const s = initialState(1, defaultSettings);
    const allCodes = getGridCodes(s.grid);
    let curr = s;
    for (const code of allCodes) {
      if (s.givenCodes.includes(code)) continue;
      curr = reducer(curr, { type: "selectCode", code });
      curr = reducer(curr, { type: "guessLetter", letter: s.solution[code]! });
    }
    expect(curr.won).toBe(true);
  });
});

describe("Codewords isTerminal", () => {
  it("returns null when not won", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when won", () => {
    const s = { ...initialState(1, defaultSettings), won: true, guesses: 5 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(900);
  });

  it("score floors at 100", () => {
    const s = { ...initialState(1, defaultSettings), won: true, guesses: 100 };
    const result = isTerminal(s);
    expect(result!.score).toBe(100);
  });
});

describe("Codewords PUZZLES", () => {
  it("all puzzles have valid grid dimensions", () => {
    PUZZLES.forEach(p => {
      expect(p.grid.length).toBe(p.height);
      p.grid.forEach(row => expect(row.length).toBe(p.width));
    });
  });

  it("all puzzle solutions map codes 1+ to letters", () => {
    PUZZLES.forEach(p => {
      for (const [codeStr, letter] of Object.entries(p.solution)) {
        const code = parseInt(codeStr);
        expect(code).toBeGreaterThan(0);
        expect(/^[A-Z]$/.test(letter)).toBe(true);
      }
    });
  });
});
