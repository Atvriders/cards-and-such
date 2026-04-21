import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, getLineCells } from "./state.js";
import type { WordSearchState } from "./state.js";

describe("WordSearch initialState", () => {
  it("creates a grid with correct size", () => {
    const s = initialState(1, { size: "8", wordCount: "5" });
    expect(s.size).toBe(8);
    expect(s.grid.length).toBe(64);
  });

  it("creates 12x12 grid", () => {
    const s = initialState(1, { size: "12", wordCount: "5" });
    expect(s.grid.length).toBe(144);
  });

  it("all cells are uppercase letters", () => {
    const s = initialState(42, { size: "8", wordCount: "5" });
    expect(s.grid.every((ch) => /^[A-Z]$/.test(ch))).toBe(true);
  });

  it("is deterministic", () => {
    const s1 = initialState(7, { size: "8", wordCount: "5" });
    const s2 = initialState(7, { size: "8", wordCount: "5" });
    expect(Array.from(s1.grid)).toEqual(Array.from(s2.grid));
  });

  it("placed words exist in grid at correct position", () => {
    const s = initialState(1, { size: "12", wordCount: "5" });
    for (const pw of s.placedWords) {
      let built = "";
      for (let i = 0; i < pw.word.length; i++) {
        built += s.grid[(pw.row + pw.dr * i) * s.size + (pw.col + pw.dc * i)];
      }
      expect(built).toBe(pw.word);
    }
  });

  it("starts with no words found", () => {
    const s = initialState(1, { size: "8", wordCount: "5" });
    expect(s.placedWords.every((w) => !w.found)).toBe(true);
  });
});

describe("WordSearch getLineCells", () => {
  it("horizontal line", () => {
    const line = getLineCells(0, 0, 0, 3);
    expect(line).not.toBeNull();
    expect(line!.length).toBe(4);
    expect(line!.dr).toBe(0);
    expect(line!.dc).toBe(1);
  });

  it("vertical line", () => {
    const line = getLineCells(0, 2, 4, 2);
    expect(line).not.toBeNull();
    expect(line!.length).toBe(5);
    expect(line!.dr).toBe(1);
    expect(line!.dc).toBe(0);
  });

  it("diagonal line", () => {
    const line = getLineCells(0, 0, 3, 3);
    expect(line).not.toBeNull();
    expect(line!.length).toBe(4);
    expect(line!.dr).toBe(1);
    expect(line!.dc).toBe(1);
  });

  it("non-straight line returns null", () => {
    const line = getLineCells(0, 0, 2, 3);
    expect(line).toBeNull();
  });

  it("same cell returns length 1", () => {
    const line = getLineCells(3, 3, 3, 3);
    expect(line!.length).toBe(1);
  });
});

describe("WordSearch reducer", () => {
  it("startSelect sets selecting", () => {
    const s = initialState(1, { size: "12", wordCount: "5" });
    const s2 = reducer(s, { type: "startSelect", row: 0, col: 0 });
    expect(s2.selecting).toEqual({ startRow: 0, startCol: 0 });
  });

  it("cancelSelect clears selecting", () => {
    const s = initialState(1, { size: "12", wordCount: "5" });
    let s2 = reducer(s, { type: "startSelect", row: 0, col: 0 });
    s2 = reducer(s2, { type: "cancelSelect" });
    expect(s2.selecting).toBeNull();
  });

  it("correct word selection marks it as found", () => {
    const s = initialState(1, { size: "12", wordCount: "5" });
    // Find first placed word and simulate selecting it
    const pw = s.placedWords[0]!;
    const endRow = pw.row + pw.dr * (pw.word.length - 1);
    const endCol = pw.col + pw.dc * (pw.word.length - 1);
    let s2 = reducer(s, { type: "startSelect", row: pw.row, col: pw.col });
    s2 = reducer(s2, { type: "endSelect", row: endRow, col: endCol });
    const found = s2.placedWords.find((w) => w.word === pw.word);
    expect(found?.found).toBe(true);
  });

  it("wrong selection does not mark anything found", () => {
    const s = initialState(1, { size: "12", wordCount: "5" });
    // Select a 1-cell area (unlikely to match any word)
    let s2 = reducer(s, { type: "startSelect", row: 0, col: 0 });
    s2 = reducer(s2, { type: "endSelect", row: 0, col: 0 });
    expect(s2.placedWords.every((w) => !w.found)).toBe(true);
  });
});

describe("WordSearch isTerminal", () => {
  it("returns null when not won", () => {
    const s = initialState(1, { size: "8", wordCount: "5" });
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(1, { size: "8", wordCount: "5" });
    const wonState: WordSearchState = { ...s, won: true, movesMade: 5 };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(950);
  });

  it("score floors at 100", () => {
    const s = initialState(1, { size: "8", wordCount: "5" });
    const wonState: WordSearchState = { ...s, won: true, movesMade: 9999 };
    expect(isTerminal(wonState)!.score).toBe(100);
  });
});
