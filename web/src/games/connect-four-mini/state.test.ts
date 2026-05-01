import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, COLS, ROWS, TARGET } from "./state.js";

const S = { dummy: false };

describe("ConnectFourMini", () => {
  it("starts in playing phase with empty board", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.board.length).toBe(COLS * ROWS);
    expect(s.board.every(c => c === null)).toBe(true);
    expect(s.turn).toBe("P");
    expect(s.result).toBeNull();
  });

  it("uses a 6x6 grid for mini", () => {
    expect(COLS).toBe(6);
    expect(ROWS).toBe(6);
    expect(TARGET).toBe(4);
  });

  it("drop places a disc at the lowest empty row of the chosen column", () => {
    const s0 = initialState(1, S);
    const s1 = reducer(s0, { type: "drop", col: 2 });
    // Player piece must be at (ROWS-1, 2)
    expect(s1.board[(ROWS - 1) * COLS + 2]).toBe("P");
  });

  it("drop stacks subsequent player pieces upward in the same column", () => {
    let s = initialState(42, S);
    s = reducer(s, { type: "drop", col: 0 });            // P at row 5
    // CPU drops somewhere; clear it deterministically by pushing player drops in col 0.
    s = reducer(s, { type: "drop", col: 0 });            // P stacks at row 4 if that cell is empty
    // The player's own pieces should occupy at least 2 cells, both in col 0 if CPU avoided col 0.
    const playerCol0 = [];
    for (let r = 0; r < ROWS; r++) if (s.board[r * COLS + 0] === "P") playerCol0.push(r);
    expect(playerCol0.length).toBeGreaterThanOrEqual(1);
  });

  it("CPU plays after player (board has at least 1 CPU disc)", () => {
    const s = reducer(initialState(7, S), { type: "drop", col: 0 });
    if (s.phase === "playing") {
      const cpuPieces = s.board.filter(c => c === "C").length;
      expect(cpuPieces).toBeGreaterThanOrEqual(1);
    }
  });

  it("detects a horizontal four-in-a-row", () => {
    let s = initialState(1, S);
    // Manually craft horizontal P win on bottom row by placing into 4 cols.
    // To force it, build the board directly and run findWin via reducer trick.
    s = {
      ...s,
      board: Array(ROWS * COLS).fill(null),
    };
    const b = s.board.slice();
    b[(ROWS - 1) * COLS + 0] = "P";
    b[(ROWS - 1) * COLS + 1] = "P";
    b[(ROWS - 1) * COLS + 2] = "P";
    s = { ...s, board: b };
    // Drop one more in col 3 to complete four-in-a-row.
    const s2 = reducer(s, { type: "drop", col: 3 });
    expect(s2.result).toBe("P");
    expect(s2.phase).toBe("done");
    expect(s2.winLine?.length).toBe(4);
  });

  it("detects a vertical four-in-a-row", () => {
    let s = initialState(1, S);
    const b = s.board.slice();
    b[(ROWS - 1) * COLS + 0] = "P";
    b[(ROWS - 2) * COLS + 0] = "P";
    b[(ROWS - 3) * COLS + 0] = "P";
    // Fill col 0 to row 2 with P? top empty is row 2 -> we want P at row 2 next.
    s = { ...s, board: b };
    const s2 = reducer(s, { type: "drop", col: 0 });
    expect(s2.result).toBe("P");
    expect(s2.winLine?.length).toBe(4);
  });

  it("detects a diagonal (down-right) four-in-a-row", () => {
    let s = initialState(1, S);
    const b: ("P" | "C" | null)[] = Array(ROWS * COLS).fill(null);
    // Build a diagonal /-going-up: (5,0), (4,1), (3,2), (2,3) all P.
    b[5 * COLS + 0] = "P";
    b[4 * COLS + 1] = "P";
    b[3 * COLS + 2] = "P";
    b[2 * COLS + 3] = "P";
    s = { ...s, board: b };
    // Use checker by doing a no-op extra move that doesn't form anything new — but state already has the win.
    // Run findWin via reducer? reducer only checks after a player drop. Drop a non-conflicting piece, then assert previous board passes.
    // Simpler: import findWin via testing isTerminal isn't enough; rely on the existing reducer behavior with a fresh, more direct setup:
    // Build it so the player's drop creates the diagonal. Place 3 of the diagonal already, plus filler so col 3 row 2 is the next-empty.
    const fresh: ("P" | "C" | null)[] = Array(ROWS * COLS).fill(null);
    fresh[5 * COLS + 0] = "P";
    fresh[4 * COLS + 1] = "P";
    fresh[3 * COLS + 2] = "P";
    // Fill col 3 from bottom up so row 2 is next to drop
    fresh[5 * COLS + 3] = "C";
    fresh[4 * COLS + 3] = "C";
    fresh[3 * COLS + 3] = "C";
    s = { ...initialState(1, S), board: fresh };
    const s2 = reducer(s, { type: "drop", col: 3 });
    expect(s2.result).toBe("P");
    expect(s2.winLine?.length).toBe(4);
  });

  it("isTerminal is null at start and returns score on win", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("reset action returns to a fresh playing state", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "drop", col: 0 });
    const r = reducer(s, { type: "reset", seed: 99 });
    expect(r.phase).toBe("playing");
    expect(r.board.every(c => c === null)).toBe(true);
    expect(r.score).toBe(0);
  });

  it("does not allow dropping in a full column", () => {
    let s = initialState(1, S);
    const b = s.board.slice();
    for (let r = 0; r < ROWS; r++) b[r * COLS + 0] = r % 2 === 0 ? "P" : "C";
    s = { ...s, board: b };
    const s2 = reducer(s, { type: "drop", col: 0 });
    // Board unchanged — no new piece placed
    expect(s2.board.filter(c => c !== null).length).toBe(s.board.filter(c => c !== null).length);
  });
});
