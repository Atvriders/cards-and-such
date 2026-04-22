import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, cellIdx, MAZE_COLS } from "./state.js";
import type { MazeChaseState } from "./state.js";

const settings = { enemies: "1" as const, enemySpeed: "slow" as const };

describe("initialState", () => {
  it("creates cells array with correct length", () => {
    const s = initialState(42, settings);
    expect(s.cells).toHaveLength(15 * 15);
  });

  it("has dots to collect and score 0", () => {
    const s = initialState(42, settings);
    expect(s.dotsRemaining).toBeGreaterThan(0);
    expect(s.score).toBe(0);
  });

  it("player starts at a non-wall cell", () => {
    const s = initialState(42, settings);
    expect(s.cells[cellIdx(s.playerRow, s.playerCol)]).not.toBe("#");
  });

  it("enemies count matches settings", () => {
    const s = initialState(42, { enemies: "2" as const, enemySpeed: "medium" as const });
    expect(s.enemies).toHaveLength(2);
  });
});

describe("turn action", () => {
  it("queues a new direction", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "turn", dir: "right" });
    expect(after.nextDir).toBe("right");
  });
});

describe("dot collection", () => {
  it("collecting a dot decrements dotsRemaining and adds 10 to score", () => {
    const s = initialState(42, settings);
    // Player starts on a dot cell (position 'P' was replaced with '.')
    // Force player onto a dot cell manually
    const dotIdx = s.cells.findIndex((c) => c === ".");
    const dotRow = Math.floor(dotIdx / MAZE_COLS);
    const dotCol = dotIdx % MAZE_COLS;
    const modified: MazeChaseState = {
      ...s,
      playerRow: dotRow,
      playerCol: dotCol,
      playerMoveCooldown: 0,
    };
    // Tick once to collect
    const after = reducer(modified, { type: "tick" });
    expect(after.score).toBeGreaterThanOrEqual(10);
  });
});

describe("game over when caught", () => {
  it("sets over=true when enemy is at player position", () => {
    const s = initialState(42, settings);
    const modified: MazeChaseState = {
      ...s,
      enemies: [{ id: 0, row: s.playerRow, col: s.playerCol, moveCooldown: 100 }],
    };
    const after = reducer(modified, { type: "tick" });
    expect(after.over).toBe(true);
  });
});

describe("win condition", () => {
  it("sets won=true when dotsRemaining reaches 0", () => {
    const s = initialState(42, settings);
    // Zero out dots manually
    const noDotCells = s.cells.map((c) => (c === "." ? " " : c));
    const modified: MazeChaseState = {
      ...s,
      cells: noDotCells,
      dotsRemaining: 1,
      enemies: [], // no enemies
      playerMoveCooldown: 0,
    };
    // Place player on the one remaining dot cell we'll add
    const patchedCells = [...noDotCells];
    patchedCells[cellIdx(modified.playerRow, modified.playerCol)] = ".";
    const ready: MazeChaseState = { ...modified, cells: patchedCells };
    const after = reducer(ready, { type: "tick" });
    expect(after.won).toBe(true);
  });
});

describe("isTerminal", () => {
  it("returns null during active game", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score when over", () => {
    const s = { ...initialState(42, settings), over: true, score: 80 };
    expect(isTerminal(s)!.score).toBe(80);
  });

  it("returns score+500 when won", () => {
    const s = { ...initialState(42, settings), won: true, score: 200 };
    expect(isTerminal(s)!.score).toBe(700);
  });

  it("no-ops when game is already over", () => {
    const s = { ...initialState(42, settings), over: true };
    const after = reducer(s, { type: "tick" });
    expect(after).toBe(s);
  });
});
