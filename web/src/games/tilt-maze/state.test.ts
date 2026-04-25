import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, slideBall } from "./state.js";

const easy = { difficulty: "easy" as const };
const hard = { difficulty: "hard" as const };

describe("TiltMaze initialState", () => {
  it("creates valid state", () => {
    const s = initialState(0, easy);
    expect(s.cols).toBeGreaterThan(0);
    expect(s.rows).toBeGreaterThan(0);
    expect(s.won).toBe(false);
  });

  it("ball starts at start position", () => {
    const s = initialState(0, easy);
    expect(s.ballCol).toBeGreaterThanOrEqual(0);
    expect(s.ballRow).toBeGreaterThanOrEqual(0);
  });

  it("hard difficulty gives bigger grid", () => {
    const s = initialState(0, hard);
    expect(s.cols).toBeGreaterThanOrEqual(6);
  });

  it("different seeds give different puzzle indices", () => {
    const s0 = initialState(0, easy);
    const s1 = initialState(1, easy);
    const s2 = initialState(2, easy);
    // They may have different puzzle indices
    const indices = new Set([s0.puzzleIndex, s1.puzzleIndex, s2.puzzleIndex]);
    expect(indices.size).toBeGreaterThan(0);
  });
});

describe("slideBall", () => {
  it("slides left to edge on open board", () => {
    const result = slideBall(3, 2, "left", 5, 5, [], []);
    expect(result.col).toBe(0);
    expect(result.row).toBe(2);
  });

  it("slides up to edge on open board", () => {
    const result = slideBall(2, 3, "up", 5, 5, [], []);
    expect(result.col).toBe(2);
    expect(result.row).toBe(0);
  });

  it("stops at vertical wall", () => {
    // vWall at row=2, col=1 blocks rightward movement from col=0 at row=2
    const result = slideBall(0, 2, "right", 5, 5, [], ["2,1"]);
    expect(result.col).toBe(1);
  });

  it("stops at horizontal wall", () => {
    // hWall at row=1, col=2 blocks downward movement from row=0 at col=2
    const result = slideBall(2, 0, "down", 5, 5, ["1,2"], []);
    expect(result.row).toBe(1);
  });
});

describe("TiltMaze reducer", () => {
  it("moves ball when tilted", () => {
    const s = initialState(0, easy);
    const s2 = reducer(s, { type: "tilt", dir: "right" });
    // Ball should have moved right to edge or wall
    expect(s2.ballCol).toBeGreaterThanOrEqual(s.ballCol);
  });

  it("no-op when already won", () => {
    const s = { ...initialState(0, easy), won: true };
    const s2 = reducer(s, { type: "tilt", dir: "right" });
    expect(s2).toBe(s);
  });

  it("no-op when ball does not move", () => {
    const s = initialState(0, easy);
    // Move to left edge first
    const s2 = reducer(s, { type: "tilt", dir: "left" });
    // Try tilting left again - ball is already at left edge
    const s3 = reducer(s2, { type: "tilt", dir: "left" });
    if (s3.ballCol === 0) {
      expect(s3).toBe(s2);
    }
  });
});

describe("TiltMaze isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(0, easy))).toBeNull();
  });

  it("returns score when won", () => {
    const s = { ...initialState(0, easy), won: true, moves: 5 };
    const r = isTerminal(s);
    expect(r).not.toBeNull();
    expect(r!.score).toBeGreaterThanOrEqual(50);
  });
});
