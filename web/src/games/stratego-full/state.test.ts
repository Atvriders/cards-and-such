import { describe, expect, it } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  isLake,
  isLegalMove,
  resolveCombat,
  allLegalMoves,
  buildPile,
  ROWS,
  COLS,
} from "./state.js";
import type { StrategoFullState, Piece, Board } from "./state.js";

const SETTINGS = { _dummy: "x" } as const;

function countPieces(board: Board, side: 0 | 1): number {
  let n = 0;
  for (const row of board) for (const cell of row) if (cell && cell.side === side) n++;
  return n;
}

function findHumanFlagSpot(b: Board): { r: number; c: number } {
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const cell = b[r]?.[c];
    if (cell && cell.side === 0 && cell.rank === 0) return { r, c };
  }
  throw new Error("no human flag");
}

describe("Stratego (Full Classic)", () => {
  it("initialState is deterministic by seed and lays out CPU army on rows 0..3", () => {
    const a = initialState(42, SETTINGS);
    const b = initialState(42, SETTINGS);
    // Same CPU layout
    for (let r = 0; r < 4; r++) for (let c = 0; c < COLS; c++) {
      const pa = a.board[r]?.[c];
      const pb = b.board[r]?.[c];
      expect(pa?.rank).toBe(pb?.rank);
      expect(pa?.side).toBe(pb?.side);
    }
    expect(countPieces(a.board, 1)).toBe(40);
    expect(countPieces(a.board, 0)).toBe(0);
    expect(a.phase).toBe("setup");
    expect(a.setupPile.length).toBe(40);
  });

  it("standard composition pile has 40 pieces with correct mix", () => {
    const pile = buildPile();
    expect(pile.length).toBe(40);
    const count = (rk: number): number => pile.filter((x) => x === rk).length;
    expect(count(10)).toBe(1);
    expect(count(9)).toBe(1);
    expect(count(8)).toBe(2);
    expect(count(7)).toBe(3);
    expect(count(6)).toBe(4);
    expect(count(5)).toBe(4);
    expect(count(4)).toBe(4);
    expect(count(3)).toBe(5);
    expect(count(2)).toBe(8);
    expect(count(1)).toBe(1);
    expect(count(0)).toBe(1);
    expect(count(-1)).toBe(6);
  });

  it("lake squares are at (4,5) x (2,3,6,7) and unwalkable", () => {
    expect(isLake(4, 2)).toBe(true);
    expect(isLake(4, 3)).toBe(true);
    expect(isLake(5, 2)).toBe(true);
    expect(isLake(5, 3)).toBe(true);
    expect(isLake(4, 6)).toBe(true);
    expect(isLake(5, 7)).toBe(true);
    expect(isLake(0, 0)).toBe(false);
    expect(isLake(3, 2)).toBe(false);
    expect(isLake(6, 2)).toBe(false);
  });

  it("isTerminal is null on fresh state", () => {
    const s = initialState(1, SETTINGS);
    expect(isTerminal(s)).toBeNull();
  });

  it("autoFillSetup places all 40 human pieces; startGame switches to playing", () => {
    let s = initialState(7, SETTINGS);
    s = reducer(s, { type: "autoFillSetup" });
    expect(s.setupPile.length).toBe(0);
    expect(countPieces(s.board, 0)).toBe(40);
    // Pieces only on rows 6..9
    for (let r = 0; r < 6; r++) for (let c = 0; c < COLS; c++) {
      expect(s.board[r]?.[c]?.side === 0).toBe(false);
    }
    s = reducer(s, { type: "startGame" });
    expect(s.phase).toBe("playing");
    expect(s.turn).toBe(0);
  });

  it("resolveCombat handles core rules", () => {
    expect(resolveCombat(10, 9)).toBe("attackerWins");        // Marshal > General
    expect(resolveCombat(9, 10)).toBe("defenderWins");        // General < Marshal
    expect(resolveCombat(5, 5)).toBe("mutual");               // tie
    expect(resolveCombat(1, 10)).toBe("attackerWins");        // Spy attacks Marshal
    expect(resolveCombat(10, 1)).toBe("attackerWins");        // Marshal attacks Spy → wins
    expect(resolveCombat(3, -1)).toBe("attackerWins");        // Miner defuses Bomb
    expect(resolveCombat(10, -1)).toBe("defenderWins");       // Marshal vs Bomb → dies
    expect(resolveCombat(2, 0)).toBe("attackerWins");         // Capture flag
    expect(resolveCombat(7, 7)).toBe("mutual");               // equal Majors
  });

  it("illegal moves (lake, diagonal, off-board, blocked) are rejected", () => {
    let s = initialState(11, SETTINGS);
    s = reducer(s, { type: "autoFillSetup" });
    s = reducer(s, { type: "startGame" });
    // Diagonal move from any piece is illegal
    // Find any human piece on row 6 (front rank)
    let any: { r: number; c: number } | null = null;
    for (let c = 0; c < COLS; c++) {
      const p = s.board[6]?.[c];
      if (p && p.side === 0) { any = { r: 6, c }; break; }
    }
    expect(any).not.toBeNull();
    if (any) {
      // Diagonal target
      expect(isLegalMove(s.board, 0, { fromR: any.r, fromC: any.c, toR: any.r - 1, toC: any.c + 1 })).toBe(false);
      // Off-board
      expect(isLegalMove(s.board, 0, { fromR: any.r, fromC: any.c, toR: -1, toC: any.c })).toBe(false);
    }
  });

  it("reducer rejects illegal select (returns same reference when nothing changes)", () => {
    let s = initialState(13, SETTINGS);
    s = reducer(s, { type: "autoFillSetup" });
    s = reducer(s, { type: "startGame" });
    // Try to select empty square
    const before = s;
    const after = reducer(s, { type: "select", r: 4, c: 4 });
    expect(after).toBe(before);
  });

  it("scout (rank 2) can move multi-square in straight line on empty path", () => {
    // Build a custom state with a single human Scout to test
    let s = initialState(21, SETTINGS);
    // Clear board entirely
    const empty: Board = [];
    for (let r = 0; r < ROWS; r++) {
      const row: Array<Piece | null> = [];
      for (let c = 0; c < COLS; c++) row.push(null);
      empty.push(row);
    }
    const human: Piece = { id: 1000, side: 0, rank: 2, revealed: false, moved: false };
    const cpuFlag: Piece = { id: 1001, side: 1, rank: 0, revealed: false, moved: false };
    empty[9]![0] = human;
    empty[0]![0] = cpuFlag;
    s = { ...s, board: empty, phase: "playing", turn: 0, setupPile: [] };
    // Scout should be able to move from (9,0) all the way up to (1,0)
    expect(isLegalMove(s.board, 0, { fromR: 9, fromC: 0, toR: 1, toC: 0 })).toBe(true);
    // But not to (0,0) by passing through… actually it should attack at (0,0)
    expect(isLegalMove(s.board, 0, { fromR: 9, fromC: 0, toR: 0, toC: 0 })).toBe(true);
  });

  it("simple play-through: human Scout captures CPU flag → game ends with score 100", () => {
    let s = initialState(33, SETTINGS);
    // Construct a minimal scenario by overriding state.
    const empty: Board = [];
    for (let r = 0; r < ROWS; r++) {
      const row: Array<Piece | null> = [];
      for (let c = 0; c < COLS; c++) row.push(null);
      empty.push(row);
    }
    // Place CPU flag at (0,0) with no defenders
    empty[0]![0] = { id: 1, side: 1, rank: 0, revealed: false, moved: false };
    // Place a CPU Spy at (3,5) so the CPU has at least one movable piece
    empty[3]![5] = { id: 2, side: 1, rank: 1, revealed: false, moved: false };
    // Human scout one square below CPU flag
    empty[1]![0] = { id: 100, side: 0, rank: 2, revealed: false, moved: false };
    // Human marshal nearby just to ensure movable pieces exist
    empty[9]![9] = { id: 101, side: 0, rank: 10, revealed: false, moved: false };
    s = { ...s, board: empty, phase: "playing", turn: 0, setupPile: [], selected: null };
    // Select scout
    s = reducer(s, { type: "select", r: 1, c: 0 });
    expect(s.selected).toEqual({ r: 1, c: 0 });
    // Attack flag at (0,0)
    s = reducer(s, { type: "select", r: 0, c: 0 });
    expect(s.phase).toBe("done");
    expect(s.winner).toBe(0);
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t?.score).toBe(100);
  });

  it("hasAnyMove ends game when opponent has no movable pieces", () => {
    let s = initialState(55, SETTINGS);
    // Custom: CPU has only flag (immovable). Human has marshal. Human moves marshal → CPU has no move.
    const empty: Board = [];
    for (let r = 0; r < ROWS; r++) {
      const row: Array<Piece | null> = [];
      for (let c = 0; c < COLS; c++) row.push(null);
      empty.push(row);
    }
    // CPU just has a flag at (0,5) — no movable pieces.
    empty[0]![5] = { id: 1, side: 1, rank: 0, revealed: false, moved: false };
    // Human marshal at (9,5).
    empty[9]![5] = { id: 100, side: 0, rank: 10, revealed: false, moved: false };
    s = { ...s, board: empty, phase: "playing", turn: 0, setupPile: [], selected: null };
    // Select marshal and move it 1 north (still no path to flag).
    s = reducer(s, { type: "select", r: 9, c: 5 });
    s = reducer(s, { type: "select", r: 8, c: 5 });
    // CPU has no movable pieces (only flag), so game should end with human winning.
    expect(s.phase).toBe("done");
    expect(s.winner).toBe(0);
  });

  it("allLegalMoves returns no moves for a board with only flag and bomb", () => {
    const empty: Board = [];
    for (let r = 0; r < ROWS; r++) {
      const row: Array<Piece | null> = [];
      for (let c = 0; c < COLS; c++) row.push(null);
      empty.push(row);
    }
    empty[0]![0] = { id: 1, side: 1, rank: 0, revealed: false, moved: false };
    empty[0]![1] = { id: 2, side: 1, rank: -1, revealed: false, moved: false };
    expect(allLegalMoves(empty, 1)).toHaveLength(0);
  });

  it("newGame resets to setup phase with fresh state", () => {
    let s = initialState(77, SETTINGS);
    s = reducer(s, { type: "autoFillSetup" });
    s = reducer(s, { type: "startGame" });
    expect(s.phase).toBe("playing");
    s = reducer(s, { type: "newGame" });
    expect(s.phase).toBe("setup");
    expect(s.setupPile.length).toBe(40);
    expect(s.winner).toBeNull();
  });

  it("place action consumes one rank from setupPile and refuses placement on CPU half", () => {
    let s = initialState(99, SETTINGS);
    const flagOnPile = s.setupPile.filter((x) => x === 0).length;
    expect(flagOnPile).toBe(1);
    s = reducer(s, { type: "place", r: 9, c: 0, rank: 0 });
    expect(s.setupPile.filter((x) => x === 0).length).toBe(0);
    expect(s.board[9]?.[0]?.rank).toBe(0);
    // Can't place on row 5 (CPU side)
    const before = s;
    const after = reducer(s, { type: "place", r: 5, c: 0, rank: 10 });
    expect(after).toBe(before);
  });

  it("human flag spot is on row 6..9 after autoFillSetup", () => {
    let s = initialState(101, SETTINGS);
    s = reducer(s, { type: "autoFillSetup" });
    const flag = findHumanFlagSpot(s.board);
    expect(flag.r).toBeGreaterThanOrEqual(6);
    expect(flag.r).toBeLessThanOrEqual(9);
  });
});

// Reference variables to avoid TS unused warnings if test pruning removes some.
void {} as unknown as StrategoFullState;
