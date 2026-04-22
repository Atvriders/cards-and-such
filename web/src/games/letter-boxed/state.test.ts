import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import { PUZZLES, getSide, getAllLetters, isValidWordForBox } from "./puzzles.js";

const defaultSettings = { difficulty: "medium" as const };

describe("LetterBoxed initialState", () => {
  it("creates a state with 4 sides", () => {
    const s = initialState(1, defaultSettings);
    expect(s.sides.length).toBe(4);
    expect(s.sides.every(side => side.length === 3)).toBe(true);
  });

  it("starts with no words and empty input", () => {
    const s = initialState(1, defaultSettings);
    expect(s.words).toEqual([]);
    expect(s.currentInput).toBe("");
    expect(s.won).toBe(false);
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(42, defaultSettings);
    const s2 = initialState(42, defaultSettings);
    expect(s1.sides).toEqual(s2.sides);
    expect(s1.puzzleIdx).toBe(s2.puzzleIdx);
  });

  it("pre-computes all 12 letters", () => {
    const s = initialState(1, defaultSettings);
    expect(s.allLetters.length).toBe(12);
  });
});

describe("LetterBoxed PUZZLES", () => {
  it("each puzzle has exactly 12 unique letters across 4 sides", () => {
    PUZZLES.forEach(p => {
      const letters = getAllLetters(p.sides);
      expect(letters.size).toBe(12);
      // Each side has exactly 3 letters
      p.sides.forEach(side => {
        expect(side.length).toBe(3);
      });
    });
  });

  it("each puzzle has a valid difficulty", () => {
    PUZZLES.forEach(p => {
      expect(["easy", "medium", "hard"]).toContain(p.difficulty);
    });
  });
});

describe("getSide", () => {
  it("returns correct side index", () => {
    const sides: [string, string, string, string] = ["ABC", "DEF", "GHI", "JKL"];
    expect(getSide("A", sides)).toBe(0);
    expect(getSide("D", sides)).toBe(1);
    expect(getSide("G", sides)).toBe(2);
    expect(getSide("J", sides)).toBe(3);
  });

  it("returns -1 for unknown letter", () => {
    const sides: [string, string, string, string] = ["ABC", "DEF", "GHI", "JKL"];
    expect(getSide("Z", sides)).toBe(-1);
  });
});

describe("isValidWordForBox", () => {
  const sides: [string, string, string, string] = ["ABC", "DEF", "GHI", "JKL"];

  it("rejects word shorter than 3 letters", () => {
    const result = isValidWordForBox("AD", sides, null);
    expect(result.valid).toBe(false);
  });

  it("rejects word with letter not in box", () => {
    const result = isValidWordForBox("AZD", sides, null);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("Z");
  });

  it("rejects consecutive letters from same side", () => {
    // A and B are both on side 0
    const result = isValidWordForBox("ABD", sides, null);
    expect(result.valid).toBe(false);
  });

  it("accepts valid cross-side word", () => {
    // A(side0) D(side1) G(side2) J(side3) — all different sides
    const result = isValidWordForBox("ADGJ", sides, null);
    expect(result.valid).toBe(true);
  });

  it("rejects word that doesn't start with lastLetter", () => {
    const result = isValidWordForBox("ADG", sides, "B");
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("B");
  });
});

describe("LetterBoxed reducer - typeChar", () => {
  it("adds uppercase letter to input", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "typeChar", char: "a" });
    // Only valid if 'a' is in the box
    const inBox = s.allLetters.includes("A");
    if (inBox) {
      expect(s2.currentInput).toBe("A");
    }
  });

  it("backspace removes last character", () => {
    const s = initialState(1, defaultSettings);
    const letter = s.allLetters[0]!;
    const s2 = reducer(s, { type: "typeChar", char: letter });
    const s3 = reducer(s2, { type: "backspace" });
    expect(s3.currentInput).toBe("");
  });

  it("clearInput empties input", () => {
    const s = initialState(1, defaultSettings);
    const letter = s.allLetters[0]!;
    const s2 = reducer(s, { type: "typeChar", char: letter });
    const s3 = reducer(s2, { type: "clearInput" });
    expect(s3.currentInput).toBe("");
  });
});

describe("LetterBoxed isTerminal", () => {
  it("returns null when not won", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when won", () => {
    const s = { ...initialState(1, defaultSettings), won: true, score: 300 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(300);
  });
});
