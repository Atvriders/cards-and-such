import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, COLS, ROWS } from "./state.js";
import type { IceBlocksState } from "./state.js";

// ─── 1. Initial state ─────────────────────────────────────────────────────────
describe("initialState", () => {
  it("has correct grid size, player at top-left, 3 lives", () => {
    const s = initialState(42);
    expect(s.grid.length).toBe(COLS * ROWS);
    expect(s.playerCol).toBe(1);
    expect(s.playerRow).toBe(1);
    expect(s.lives).toBe(3);
    expect(s.score).toBe(0);
    expect(s.lost).toBe(false);
    expect(s.won).toBe(false);
    expect(s.foes.every((f) => f.alive)).toBe(true);
  });
});

// ─── 2. Determinism ───────────────────────────────────────────────────────────
describe("determinism", () => {
  it("same seed same state", () => {
    expect(initialState(7)).toEqual(initialState(7));
  });
});

// ─── 3. Move into empty cell ─────────────────────────────────────────────────
describe("move", () => {
  it("moves right into empty cell", () => {
    const s = initialState(42);
    const after = reducer(s, { type: "move", dir: "right" });
    expect(after.playerCol).toBe(2);
    expect(after.playerRow).toBe(1);
  });

  it("does not move into wall", () => {
    // Player at col=1,row=1. Move up goes to row=0 which is a wall.
    const s = initialState(42);
    const modS: IceBlocksState = { ...s, playerRow: 1, playerCol: 1 };
    const after = reducer(modS, { type: "move", dir: "up" });
    expect(after.playerRow).toBe(1); // still row=1 (wall at row=0)
  });
});

// ─── 4. Push block slides it ─────────────────────────────────────────────────
describe("push", () => {
  it("pushing a block clears original cell", () => {
    const s = initialState(42);
    // Place a block at (2,1) — one cell right of player (1,1)
    const grid = [...s.grid];
    grid[1 * COLS + 2] = "block";
    const modS: IceBlocksState = { ...s, grid, playerDir: "right", playerCol: 1, playerRow: 1 };
    const after = reducer(modS, { type: "push" });
    expect(after.grid[1 * COLS + 2]).toBe("empty");
  });
});

// ─── 5. isTerminal ───────────────────────────────────────────────────────────
describe("isTerminal", () => {
  it("null while in progress", () => {
    expect(isTerminal(initialState(42))).toBeNull();
  });

  it("score on lost", () => {
    const s: IceBlocksState = { ...initialState(42), lost: true, score: 800 };
    expect(isTerminal(s)?.score).toBe(800);
  });

  it("score + lives bonus on won", () => {
    const s: IceBlocksState = { ...initialState(42), won: true, score: 1200, lives: 2 };
    expect(isTerminal(s)?.score).toBe(2200);
  });
});

// ─── 6. Tick thaws frozen foes ───────────────────────────────────────────────
describe("frozen foe thawing", () => {
  it("frozen foe thaws after timer runs out", () => {
    const s = initialState(42);
    const modS: IceBlocksState = {
      ...s,
      foes: [{ id: 0, col: 5, row: 5, alive: true, frozen: true, frozenTimer: 0.01 }],
    };
    const after = reducer(modS, { type: "tick", dt: 0.1 });
    expect(after.foes[0]!.frozen).toBe(false);
  });
});
