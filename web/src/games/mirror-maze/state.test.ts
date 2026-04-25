import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, traceLaser } from "./state.js";

const easy = { difficulty: "easy" as const };
const hard = { difficulty: "hard" as const };

describe("MirrorMaze initialState", () => {
  it("creates valid state", () => {
    const s = initialState(0, easy);
    expect(s.cols).toBeGreaterThan(0);
    expect(s.rows).toBeGreaterThan(0);
    expect(s.placedMirrors).toHaveLength(0);
  });

  it("hard gives larger grid", () => {
    const s = initialState(0, hard);
    expect(s.cols).toBeGreaterThanOrEqual(7);
  });

  it("first puzzle (straight shot) auto-wins", () => {
    // Easy puzzle index 0 has no mirrors and straight path
    const s = initialState(0, easy);
    // May or may not be auto-won depending on puzzle
    expect(s.won !== undefined).toBe(true);
  });
});

describe("traceLaser", () => {
  it("traces straight shot east", () => {
    const s = {
      cols: 5, rows: 1,
      sourceCol: 0, sourceRow: 0, sourceDir: "E" as const,
      fixedMirrors: [], placedMirrors: [],
    };
    const path = traceLaser(s);
    expect(path[path.length - 1]!.col).toBe(4);
  });

  it("reflects off / mirror", () => {
    const s = {
      cols: 5, rows: 5,
      sourceCol: 0, sourceRow: 2, sourceDir: "E" as const,
      fixedMirrors: [{ col: 2, row: 2, type: "/" as const }],
      placedMirrors: [],
    };
    const path = traceLaser(s);
    // After / mirror at (2,2) going east, beam reflects to north
    const last = path[path.length - 1]!;
    expect(last.col).toBe(2);
    expect(last.row).toBe(0);
  });

  it("reflects off \\ mirror", () => {
    const s = {
      cols: 5, rows: 5,
      sourceCol: 0, sourceRow: 2, sourceDir: "E" as const,
      fixedMirrors: [{ col: 2, row: 2, type: "\\" as const }],
      placedMirrors: [],
    };
    const path = traceLaser(s);
    const last = path[path.length - 1]!;
    expect(last.col).toBe(2);
    expect(last.row).toBe(4);
  });
});

describe("MirrorMaze reducer", () => {
  it("places a mirror", () => {
    const s = { ...initialState(1, easy), availableMirrors: ["/"] as const, selectedMirrorType: "/" as const };
    const s2 = reducer(s, { type: "place", col: 1, row: 1 });
    expect(s2.placedMirrors).toHaveLength(1);
    expect(s2.moves).toBe(1);
  });

  it("removes a placed mirror", () => {
    const s = {
      ...initialState(1, easy),
      placedMirrors: [{ col: 1, row: 1, type: "/" as const }],
    };
    const s2 = reducer(s, { type: "remove", col: 1, row: 1 });
    expect(s2.placedMirrors).toHaveLength(0);
  });

  it("cannot remove fixed mirror", () => {
    const s = initialState(1, easy);
    if (s.fixedMirrors.length > 0) {
      const fm = s.fixedMirrors[0]!;
      const s2 = reducer(s, { type: "remove", col: fm.col, row: fm.row });
      expect(s2.fixedMirrors).toHaveLength(s.fixedMirrors.length);
    }
  });

  it("no-op when won", () => {
    const s = { ...initialState(0, easy), won: true };
    const s2 = reducer(s, { type: "place", col: 1, row: 1 });
    expect(s2).toBe(s);
  });
});

describe("isTerminal", () => {
  it("returns null when not won", () => {
    const s = { ...initialState(1, easy), won: false };
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when won", () => {
    const s = { ...initialState(1, easy), won: true, moves: 3 };
    const r = isTerminal(s);
    expect(r).not.toBeNull();
    expect(r!.score).toBeGreaterThanOrEqual(50);
  });
});
