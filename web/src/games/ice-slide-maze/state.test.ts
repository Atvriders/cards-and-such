import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, slide } from "./state.js";

const sml = { size: "small" as const };
const med = { size: "medium" as const };

describe("IceSlideMaze initialState", () => {
  it("creates 11x11 for small", () => {
    const s = initialState(0, sml);
    expect(s.rows).toBe(11);
    expect(s.cols).toBe(11);
  });

  it("creates 15x15 for medium", () => {
    const s = initialState(0, med);
    expect(s.rows).toBe(15);
    expect(s.cols).toBe(15);
  });

  it("player starts at (1,1)", () => {
    const s = initialState(0, sml);
    expect(s.playerRow).toBe(1);
    expect(s.playerCol).toBe(1);
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });

  it("exit is at (rows-2, cols-2)", () => {
    const s = initialState(0, sml);
    expect(s.exitRow).toBe(s.rows - 2);
    expect(s.exitCol).toBe(s.cols - 2);
  });
});

describe("IceSlideMaze slide", () => {
  it("stops at outer boundary", () => {
    const s = initialState(0, sml);
    // Going up from row 1 stops at row 1 (row 0 is a wall)
    const result = slide(s, "up");
    expect(result.row).toBeLessThanOrEqual(1);
  });

  it("never lands on a wall cell", () => {
    const s = initialState(0, sml);
    const dirs = ["up", "down", "left", "right"] as const;
    for (const d of dirs) {
      const r = slide(s, d);
      expect(s.walls[r.row * s.cols + r.col]).toBe(false);
    }
  });
});

describe("IceSlideMaze reducer", () => {
  it("does not move when already won", () => {
    const s = initialState(0, sml);
    const won = { ...s, won: true };
    const s2 = reducer(won, { type: "move", dir: "right" });
    expect(s2.moves).toBe(0);
  });

  it("increments moves when a valid slide occurs", () => {
    const s = initialState(0, sml);
    // Try each direction
    const dirs = ["up", "down", "left", "right"] as const;
    let moved = false;
    for (const dir of dirs) {
      const s2 = reducer(s, { type: "move", dir });
      if (s2.moves === 1) { moved = true; break; }
    }
    expect(moved).toBe(true);
  });
});

describe("IceSlideMaze isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(0, sml))).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(0, sml);
    const won = { ...s, won: true, moves: 8 };
    const t = isTerminal(won);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThan(0);
  });

  it("fewer moves = higher score", () => {
    const s = initialState(0, sml);
    const fast = isTerminal({ ...s, won: true, moves: 5 });
    const slow = isTerminal({ ...s, won: true, moves: 50 });
    expect(fast!.score).toBeGreaterThan(slow!.score);
  });
});
