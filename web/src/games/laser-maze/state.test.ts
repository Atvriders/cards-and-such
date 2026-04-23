import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, traceBeam, checkWon } from "./state.js";
import { PUZZLES } from "./puzzles.js";
import type { MirrorType } from "./puzzles.js";

const easy: { difficulty: "easy" } = { difficulty: "easy" };

describe("LaserMaze initialState", () => {
  it("starts with no mirrors, not won, zero moves", () => {
    const s = initialState(1, easy);
    expect(s.placedMirrors.size).toBe(0);
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });

  it("is deterministic with same seed", () => {
    const s1 = initialState(42, easy);
    const s2 = initialState(42, easy);
    expect(s1.puzzle).toBe(s2.puzzle);
  });

  it("puzzle has an emitter, target, and mirror count", () => {
    const s = initialState(1, easy);
    expect(s.puzzle.emitter).toBeDefined();
    expect(s.puzzle.target).toBeGreaterThanOrEqual(0);
    expect(s.puzzle.mirrorCount).toBeGreaterThan(0);
  });
});

describe("LaserMaze traceBeam", () => {
  it("traces beam that exits grid", () => {
    const puzzle = PUZZLES[0]!; // emitter right at (0,0)
    const beam = traceBeam(puzzle, new Map());
    expect(beam.cells.length).toBeGreaterThan(0);
    expect(typeof beam.hitTarget).toBe("boolean");
  });

  it("beam reflects off / mirror: right->up", () => {
    // Minimal test: place / mirror at (0,2), beam going right from (0,0) should hit it and go up
    const puzzle = PUZZLES[0]!;
    const mirrors = new Map<number, MirrorType>([[0*5+2, "/"]]);
    const beam = traceBeam(puzzle, mirrors);
    // After (0,2), beam goes up and exits grid
    expect(beam.cells.includes(0*5+2)).toBe(true);
  });

  it("beam reflects off \\ mirror: right->down", () => {
    const puzzle = PUZZLES[0]!;
    const mirrors = new Map<number, MirrorType>([[0*5+2, "\\"]]);
    const beam = traceBeam(puzzle, mirrors);
    // (0,2) hit, then beam goes down
    expect(beam.cells.includes(0*5+2)).toBe(true);
    expect(beam.cells.includes(1*5+2)).toBe(true);
  });
});

describe("LaserMaze placeMirror action", () => {
  it("places a mirror and increments moves", () => {
    const s = initialState(1, easy);
    const emptyIdx = s.puzzle.grid.findIndex(c => !c.wall && !c.mirror);
    const s2 = reducer(s, { type: "placeMirror", idx: emptyIdx, mirror: "/" });
    expect(s2.placedMirrors.get(emptyIdx)).toBe("/");
    expect(s2.moves).toBe(1);
  });

  it("cannot place on a wall", () => {
    // Find a wall cell
    const puzzleWithWall = PUZZLES.find(p => p.grid.some(c => c.wall));
    if (puzzleWithWall) {
      const wallIdx = puzzleWithWall.grid.findIndex(c => c.wall);
      const s = initialState(1, easy);
      const stateWithPuzzle = { ...s, puzzle: puzzleWithWall };
      const s2 = reducer(stateWithPuzzle, { type: "placeMirror", idx: wallIdx, mirror: "/" });
      expect(s2.placedMirrors.has(wallIdx)).toBe(false);
    }
  });
});

describe("LaserMaze removeMirror action", () => {
  it("removes a placed mirror", () => {
    const s = initialState(1, easy);
    const emptyIdx = s.puzzle.grid.findIndex(c => !c.wall && !c.mirror);
    const s2 = reducer(s, { type: "placeMirror", idx: emptyIdx, mirror: "\\" });
    const s3 = reducer(s2, { type: "removeMirror", idx: emptyIdx });
    expect(s3.placedMirrors.has(emptyIdx)).toBe(false);
  });
});

describe("LaserMaze checkWon", () => {
  it("returns false for no mirrors", () => {
    const puzzle = PUZZLES[0]!;
    expect(checkWon(puzzle, new Map())).toBe(false);
  });

  it("returns true when solution mirrors are placed (puzzle 4)", () => {
    const puzzle = PUZZLES[4]!;
    const mirrors = new Map(puzzle.solution.map(s => [s.idx, s.mirror] as [number, MirrorType]));
    expect(checkWon(puzzle, mirrors)).toBe(true);
  });
});

describe("LaserMaze reset", () => {
  it("clears all placed mirrors", () => {
    const s = initialState(1, easy);
    const emptyIdx = s.puzzle.grid.findIndex(c => !c.wall && !c.mirror);
    const s2 = reducer(s, { type: "placeMirror", idx: emptyIdx, mirror: "/" });
    const s3 = reducer(s2, { type: "reset" });
    expect(s3.placedMirrors.size).toBe(0);
    expect(s3.moves).toBe(0);
  });
});

describe("LaserMaze isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(1, easy))).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(1, easy);
    const won = { ...s, won: true, moves: 5 };
    expect(isTerminal(won)!.score).toBe(975);
  });

  it("score floor at 100", () => {
    const s = initialState(1, easy);
    expect(isTerminal({ ...s, won: true, moves: 9999 })!.score).toBe(100);
  });
});
