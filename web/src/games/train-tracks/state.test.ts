import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWon, computeRowCounts, computeColCounts, ALL_TILES } from "./state.js";
import { PUZZLES_EASY } from "./puzzles.js";

const easy = { difficulty: "easy" as const };
const medium = { difficulty: "medium" as const };

describe("Train Tracks initialState", () => {
  it("starts with revealed tiles set and others undefined", () => {
    const s = initialState(1, easy);
    for (let i = 0; i < s.puzzle.size * s.puzzle.size; i++) {
      if (s.puzzle.revealed[i] !== undefined) {
        expect(s.tiles[i]).toBe(s.puzzle.revealed[i]);
      } else {
        expect(s.tiles[i]).toBeUndefined();
      }
    }
  });

  it("is deterministic with same seed", () => {
    expect(initialState(3, easy).puzzle).toBe(initialState(3, easy).puzzle);
  });

  it("starts not won", () => {
    expect(initialState(1, easy).won).toBe(false);
  });

  it("has 6 tile types", () => {
    expect(ALL_TILES).toHaveLength(6);
  });
});

describe("Train Tracks computeRowCounts / computeColCounts", () => {
  it("matches solution clues", () => {
    const puzzle = PUZZLES_EASY[0]!;
    const sol = puzzle.solution as (import("./puzzles.js").TrackTile | null | undefined)[];
    const rowCounts = computeRowCounts(puzzle.size, sol);
    const colCounts = computeColCounts(puzzle.size, sol);
    expect(rowCounts).toEqual(puzzle.rowClues);
    expect(colCounts).toEqual(puzzle.colClues);
  });

  it("empty grid has all-zero counts", () => {
    const s = initialState(1, easy);
    const empty = new Array(s.puzzle.size * s.puzzle.size).fill(undefined);
    expect(computeRowCounts(s.puzzle.size, empty)).toEqual(new Array(s.puzzle.size).fill(0));
  });
});

describe("Train Tracks checkWon", () => {
  it("returns false for empty tiles", () => {
    const puzzle = PUZZLES_EASY[0]!;
    expect(checkWon(puzzle, new Array(puzzle.size * puzzle.size).fill(undefined))).toBe(false);
  });

  it("returns true for correct solutions", () => {
    for (const puzzle of PUZZLES_EASY) {
      const sol = puzzle.solution as (import("./puzzles.js").TrackTile | null | undefined)[];
      expect(checkWon(puzzle, sol)).toBe(true);
    }
  });
});

describe("Train Tracks reducer", () => {
  it("placeTile places selected tile", () => {
    const s = initialState(1, easy);
    const idx = s.puzzle.revealed.findIndex(v => v === undefined);
    const s2 = reducer(s, { type: "placeTile", idx });
    expect(s2.tiles[idx]).toBe(s.selectedTile);
    expect(s2.moves).toBe(1);
  });

  it("selectTile changes selected tile", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "selectTile", tile: "V" });
    expect(s2.selectedTile).toBe("V");
  });

  it("clearTile removes a tile", () => {
    const s = initialState(1, easy);
    const idx = s.puzzle.revealed.findIndex(v => v === undefined);
    const s2 = reducer(s, { type: "placeTile", idx });
    const s3 = reducer(s2, { type: "clearTile", idx });
    expect(s3.tiles[idx]).toBeUndefined();
  });

  it("cannot place on revealed cell", () => {
    const s = initialState(1, easy);
    const revIdx = s.puzzle.revealed.findIndex(v => v !== undefined);
    if (revIdx >= 0) {
      const orig = s.tiles[revIdx];
      const s2 = reducer(s, { type: "placeTile", idx: revIdx });
      expect(s2.tiles[revIdx]).toBe(orig);
    }
  });

  it("reset restores initial state", () => {
    const s = initialState(1, easy);
    const idx = s.puzzle.revealed.findIndex(v => v === undefined);
    const s2 = reducer(reducer(s, { type: "placeTile", idx }), { type: "reset" });
    expect(s2.tiles[idx]).toBeUndefined();
    expect(s2.moves).toBe(0);
  });
});

describe("Train Tracks isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(1, easy))).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(1, easy);
    const r = isTerminal({ ...s, won: true, moves: 5 });
    expect(r).not.toBeNull();
    expect(r!.score).toBeGreaterThan(0);
  });

  it("score has floor of 100", () => {
    const s = initialState(1, easy);
    expect(isTerminal({ ...s, won: true, moves: 99999 })!.score).toBe(100);
  });
});
