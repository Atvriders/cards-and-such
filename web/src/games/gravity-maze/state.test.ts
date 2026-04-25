import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, applyGravity } from "./state.js";

const p1 = { puzzle: "1" as const };
const p2 = { puzzle: "2" as const };

describe("GravityMaze initialState", () => {
  it("creates valid grid for puzzle 1", () => {
    const s = initialState(0, p1);
    expect(s.rows).toBe(6);
    expect(s.cols).toBe(6);
    expect(s.walls.length).toBe(36);
  });

  it("gravity starts down", () => {
    const s = initialState(0, p1);
    expect(s.gravity).toBe("down");
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });

  it("player starts at S position", () => {
    const s = initialState(0, p1);
    expect(s.playerRow).toBeGreaterThanOrEqual(0);
    expect(s.playerCol).toBeGreaterThanOrEqual(0);
  });

  it("different puzzles have different sizes", () => {
    const s1 = initialState(0, p1);
    const s2 = initialState(0, p2);
    expect(s2.rows).toBeGreaterThanOrEqual(s1.rows);
  });
});

describe("GravityMaze applyGravity", () => {
  it("ball falls until hitting wall", () => {
    const s = initialState(0, p1);
    // gravity is down; ball should be at lowest open row in its column
    const { row, col } = applyGravity(s);
    const idx = (r: number, c: number) => r * s.cols + c;
    // cell below should be a wall or boundary
    if (row + 1 < s.rows) {
      expect(s.walls[idx(row + 1, col)]).toBe(true);
    }
  });

  it("ball does not land on wall", () => {
    const s = initialState(0, p1);
    const { row, col } = applyGravity(s);
    const idx = (r: number, c: number) => r * s.cols + c;
    expect(s.walls[idx(row, col)]).toBe(false);
  });
});

describe("GravityMaze reducer", () => {
  it("rotate-cw changes gravity", () => {
    const s = initialState(0, p1);
    // Apply gravity first so ball is stable, then rotate
    const stable = { ...s, playerRow: applyGravity(s).row, playerCol: applyGravity(s).col };
    const s2 = reducer(stable, { type: "rotate-cw" });
    expect(s2.gravity).not.toBe("down");
    expect(s2.moves).toBe(1);
  });

  it("rotate-ccw changes gravity the other way", () => {
    const s = initialState(0, p1);
    const s2 = reducer(s, { type: "rotate-ccw" });
    expect(s2.gravity).toBe("right");
  });

  it("does nothing when won", () => {
    const s = initialState(0, p1);
    const won = { ...s, won: true };
    const s2 = reducer(won, { type: "rotate-cw" });
    expect(s2.moves).toBe(0);
  });
});

describe("GravityMaze isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(0, p1))).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(0, p1);
    const t = isTerminal({ ...s, won: true, moves: 5 });
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThan(0);
  });
});
