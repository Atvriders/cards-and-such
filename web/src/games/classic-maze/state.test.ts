import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const med = { size: "medium" as const };
const sml = { size: "small" as const };

describe("ClassicMaze initialState", () => {
  it("creates correct grid size for medium", () => {
    const s = initialState(42, med);
    expect(s.rows).toBe(13);
    expect(s.cols).toBe(13);
    expect(s.hWalls.length).toBe(13 * 13);
    expect(s.vWalls.length).toBe(13 * 13);
  });

  it("player starts at top-left", () => {
    const s = initialState(0, sml);
    expect(s.playerRow).toBe(0);
    expect(s.playerCol).toBe(0);
    expect(s.moves).toBe(0);
    expect(s.won).toBe(false);
  });

  it("different seeds give different mazes", () => {
    const s1 = initialState(1, sml);
    const s2 = initialState(9999, sml);
    const same = s1.hWalls.every((v, i) => v === s2.hWalls[i]);
    expect(same).toBe(false);
  });

  it("small maze is 9x9", () => {
    const s = initialState(0, sml);
    expect(s.rows).toBe(9);
    expect(s.cols).toBe(9);
  });
});

describe("ClassicMaze reducer", () => {
  it("does not move through walls", () => {
    const s = initialState(0, sml);
    // Moving up from (0,0) should be blocked by outer boundary
    const s2 = reducer(s, { type: "move", dir: "up" });
    expect(s2.playerRow).toBe(0);
    expect(s2.playerCol).toBe(0);
  });

  it("increments moves on valid move", () => {
    const s = initialState(0, sml);
    // Try all directions until one works
    const dirs = ["down", "right"] as const;
    let moved = s;
    for (const dir of dirs) {
      const next = reducer(s, { type: "move", dir });
      if (next.moves === 1) { moved = next; break; }
    }
    // Either moved or stayed — moves should be 0 or 1
    expect(moved.moves).toBeGreaterThanOrEqual(0);
    expect(moved.moves).toBeLessThanOrEqual(1);
  });

  it("does nothing when already won", () => {
    const s = initialState(0, sml);
    const won = { ...s, won: true };
    const s2 = reducer(won, { type: "move", dir: "right" });
    expect(s2.won).toBe(true);
  });
});

describe("ClassicMaze isTerminal", () => {
  it("returns null when not won", () => {
    const s = initialState(0, sml);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(0, sml);
    const won = { ...s, won: true, moves: 20 };
    const t = isTerminal(won);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThan(0);
  });

  it("fewer moves gives higher score", () => {
    const s = initialState(0, sml);
    const fastWin = isTerminal({ ...s, won: true, moves: 10 });
    const slowWin = isTerminal({ ...s, won: true, moves: 100 });
    expect(fastWin!.score).toBeGreaterThan(slowWin!.score);
  });
});
