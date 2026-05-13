import { describe, expect, it } from "vitest";
import {
  COLS,
  ROWS,
  chooseCpuMove,
  dropRow,
  findWinningLine,
  idx,
  initialState,
  isTerminal,
  reducer,
  type CFFState,
  type Cell,
} from "./state.js";

function fresh(difficulty: "easy" | "medium" | "hard" = "medium"): CFFState {
  return initialState(42, { difficulty });
}

describe("connect-four-full state", () => {
  it("initialState is deterministic by seed", () => {
    const a = initialState(42, { difficulty: "medium" });
    const b = initialState(42, { difficulty: "medium" });
    expect(a).toEqual(b);
    expect(a.board).toHaveLength(COLS * ROWS);
    expect(a.board.every((c) => c === null)).toBe(true);
    expect(a.turn).toBe(0);
    expect(a.winner).toBe(null);
    expect(a.phase).toBe("playing");
    expect(a.movesPlayed).toBe(0);
  });

  it("isTerminal is null on fresh state", () => {
    expect(isTerminal(fresh())).toBe(null);
  });

  it("drop places disc in lowest empty row and advances turn", () => {
    const s0 = fresh();
    const s1 = reducer(s0, { type: "drop", col: 3 });
    expect(s1).not.toBe(s0);
    expect(s1.board[idx(ROWS - 1, 3)]).toBe(0);
    expect(s1.turn).toBe(1);
    expect(s1.movesPlayed).toBe(1);
    expect(s1.phase).toBe("thinking");
  });

  it("drop on full column returns the same state reference", () => {
    let s = fresh();
    // Fill column 0 alternating players via cpuMove to bypass phase guards.
    for (let i = 0; i < ROWS; i++) {
      // Manually craft a state where it's player's turn and phase==="playing"
      // so we can drop into col 0.
      s = { ...s, turn: 0, phase: "playing" };
      const next = reducer(s, { type: "drop", col: 0 });
      // Toggle ownership manually so we don't hit a win.
      const b = next.board.slice();
      const r = ROWS - 1 - i;
      b[idx(r, 0)] = (i % 2) as Cell;
      s = { ...next, board: b, winner: null, winningLine: null };
    }
    s = { ...s, turn: 0, phase: "playing" };
    const same = reducer(s, { type: "drop", col: 0 });
    expect(same).toBe(s);
  });

  it("drop on out-of-range column returns the same state reference", () => {
    const s = fresh();
    expect(reducer(s, { type: "drop", col: -1 })).toBe(s);
    expect(reducer(s, { type: "drop", col: COLS })).toBe(s);
  });

  it("ignores drop when it isn't the human's turn", () => {
    const s0 = fresh();
    const s1 = reducer(s0, { type: "drop", col: 3 });
    expect(s1.phase).toBe("thinking");
    // Human tries to drop again while CPU is thinking.
    const s2 = reducer(s1, { type: "drop", col: 4 });
    expect(s2).toBe(s1);
  });

  it("detects horizontal four-in-a-row and ends the game", () => {
    let s = fresh();
    // Build human win at row 5, cols 0-3. We need to fake CPU moves between.
    const cpuFillCols = [0, 1, 2]; // CPU places into col 6 each time
    const sequence: Array<{ type: "drop"; col: number } | { type: "cpuMove"; col: number }> = [
      { type: "drop", col: 0 },
      { type: "cpuMove", col: 6 },
      { type: "drop", col: 1 },
      { type: "cpuMove", col: 6 },
      { type: "drop", col: 2 },
      { type: "cpuMove", col: 6 },
      { type: "drop", col: 3 },
    ];
    void cpuFillCols;
    for (const a of sequence) {
      s = reducer(s, a);
    }
    expect(s.winner).toBe(0);
    expect(s.winningLine).not.toBeNull();
    expect(s.winningLine!.length).toBe(4);
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThan(100); // includes speed bonus
  });

  it("findWinningLine detects vertical and diagonal wins", () => {
    const b: Cell[] = new Array(COLS * ROWS).fill(null);
    // Vertical: col 3, rows 2..5 all player 0.
    for (let r = 2; r <= 5; r++) b[idx(r, 3)] = 0;
    const v = findWinningLine(b, 5, 3);
    expect(v).not.toBeNull();
    expect(v!.length).toBe(4);

    // Diagonal down-right starting at (0,0) ... (3,3).
    const b2: Cell[] = new Array(COLS * ROWS).fill(null);
    for (let i = 0; i < 4; i++) b2[idx(i, i)] = 1;
    const d = findWinningLine(b2, 2, 2);
    expect(d).not.toBeNull();
    expect(d!.length).toBe(4);
  });

  it("dropRow returns -1 for full column and correct row otherwise", () => {
    const b: Cell[] = new Array(COLS * ROWS).fill(null);
    expect(dropRow(b, 0)).toBe(ROWS - 1);
    for (let r = 0; r < ROWS; r++) b[idx(r, 0)] = 0;
    expect(dropRow(b, 0)).toBe(-1);
  });

  it("chooseCpuMove takes an immediate win on hard", () => {
    // Set up: CPU (1) has three vertical in col 4 at rows 5,4,3. Empty above.
    const b: Cell[] = new Array(COLS * ROWS).fill(null);
    b[idx(5, 4)] = 1;
    b[idx(4, 4)] = 1;
    b[idx(3, 4)] = 1;
    const s: CFFState = {
      board: b,
      turn: 1,
      winner: null,
      winningLine: null,
      movesPlayed: 6,
      phase: "thinking",
      difficulty: "hard",
      lastMove: null,
      startedAt: 0,
    };
    expect(chooseCpuMove(s, "hard")).toBe(4);
  });

  it("chooseCpuMove blocks an obvious human win on medium", () => {
    // Human has three vertically in col 0, rows 3..5. CPU must drop in col 0
    // to block — this is the only way to prevent an immediate win.
    const b: Cell[] = new Array(COLS * ROWS).fill(null);
    b[idx(5, 0)] = 0;
    b[idx(4, 0)] = 0;
    b[idx(3, 0)] = 0;
    const s: CFFState = {
      board: b,
      turn: 1,
      winner: null,
      winningLine: null,
      movesPlayed: 5,
      phase: "thinking",
      difficulty: "medium",
      lastMove: null,
      startedAt: 0,
    };
    const c = chooseCpuMove(s, "medium");
    expect(c).toBe(0);
  });

  it("reset action restores a fresh state with same difficulty", () => {
    const s = fresh("hard");
    const s1 = reducer(s, { type: "drop", col: 3 });
    expect(s1.movesPlayed).toBe(1);
    const s2 = reducer(s1, { type: "reset" });
    expect(s2.movesPlayed).toBe(0);
    expect(s2.difficulty).toBe("hard");
    expect(s2.board.every((c) => c === null)).toBe(true);
  });

  it("score scales with difficulty on a win", () => {
    // Quickest possible human win: 7 moves → speedBonus = 50.
    let s = initialState(0, { difficulty: "easy" });
    s = reducer(s, { type: "drop", col: 0 });
    s = reducer(s, { type: "cpuMove", col: 6 });
    s = reducer(s, { type: "drop", col: 1 });
    s = reducer(s, { type: "cpuMove", col: 6 });
    s = reducer(s, { type: "drop", col: 2 });
    s = reducer(s, { type: "cpuMove", col: 6 });
    s = reducer(s, { type: "drop", col: 3 });
    const tEasy = isTerminal(s);
    expect(tEasy).not.toBeNull();
    expect(tEasy!.score).toBe(150); // (100+50) * 1.0

    let s2 = initialState(0, { difficulty: "hard" });
    s2 = reducer(s2, { type: "drop", col: 0 });
    s2 = reducer(s2, { type: "cpuMove", col: 6 });
    s2 = reducer(s2, { type: "drop", col: 1 });
    s2 = reducer(s2, { type: "cpuMove", col: 6 });
    s2 = reducer(s2, { type: "drop", col: 2 });
    s2 = reducer(s2, { type: "cpuMove", col: 6 });
    s2 = reducer(s2, { type: "drop", col: 3 });
    const tHard = isTerminal(s2);
    expect(tHard).not.toBeNull();
    expect(tHard!.score).toBe(225); // (100+50) * 1.5
  });
});
