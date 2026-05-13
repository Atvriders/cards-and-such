import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  BOARD_SIZE,
  RACK_SIZE,
  validateAndScore,
  PREMIUM_GRID,
  CENTER,
  buildPremiumGrid,
} from "./state.js";
import type { ScrabbleSettings, Tile } from "./state.js";
import { isWord } from "./words.js";

const S: ScrabbleSettings = { difficulty: "medium" };

describe("scrabble-full", () => {
  it("initialState is deterministic by seed", () => {
    const a = initialState(42, S);
    const b = initialState(42, S);
    expect(a.humanRack.map((t) => t.letter)).toEqual(b.humanRack.map((t) => t.letter));
    expect(a.cpuRack.map((t) => t.letter)).toEqual(b.cpuRack.map((t) => t.letter));
    expect(a.bag.length).toBe(b.bag.length);
  });

  it("initialState produces 15x15 empty board and 7-tile racks", () => {
    const s = initialState(1, S);
    expect(s.board.length).toBe(BOARD_SIZE);
    expect(s.board[0]!.length).toBe(BOARD_SIZE);
    expect(s.board.every((row) => row.every((c) => c === null))).toBe(true);
    expect(s.humanRack.length).toBe(RACK_SIZE);
    expect(s.cpuRack.length).toBe(RACK_SIZE);
    // 100 tiles total: 7 + 7 = 14 dealt, 86 remain in bag
    expect(s.bag.length).toBe(100 - RACK_SIZE * 2);
  });

  it("isTerminal returns null on fresh state", () => {
    const s = initialState(1, S);
    expect(isTerminal(s)).toBeNull();
  });

  it("premium grid has center DW and corner TWs", () => {
    const g = buildPremiumGrid();
    expect(g[CENTER]![CENTER]).toBe("dw");
    expect(g[0]![0]).toBe("tw");
    expect(g[0]![14]).toBe("tw");
    expect(g[14]![0]).toBe("tw");
    expect(g[14]![14]).toBe("tw");
    // Reference equality with exported PREMIUM_GRID
    expect(PREMIUM_GRID[0]![0]).toBe("tw");
  });

  it("selectRack updates selectedRackIdx; out-of-range is ignored", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "selectRack", idx: 0 });
    expect(s2.selectedRackIdx).toBe(0);
    // Out of range returns same state reference
    const s3 = reducer(s2, { type: "selectRack", idx: 99 });
    expect(s3).toBe(s2);
  });

  it("placeTile without selection is ignored (returns same state reference)", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "placeTile", r: 7, c: 7 });
    expect(s2).toBe(s);
  });

  it("placeTile + recallAll round-trips back to empty pending", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "selectRack", idx: 0 });
    s = reducer(s, { type: "placeTile", r: 7, c: 7 });
    expect(s.pending.length).toBe(1);
    s = reducer(s, { type: "recallAll" });
    expect(s.pending.length).toBe(0);
    expect(s.selectedRackIdx).toBeNull();
  });

  it("validateAndScore rejects placement that doesn't cover center on first move", () => {
    const board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
    const pending = [
      { r: 0, c: 0, tile: { letter: "c", isBlank: false } as Tile },
      { r: 0, c: 1, tile: { letter: "a", isBlank: false } as Tile },
      { r: 0, c: 2, tile: { letter: "t", isBlank: false } as Tile },
    ];
    const res = validateAndScore(board, pending, true);
    expect(res.ok).toBe(false);
  });

  it("validateAndScore accepts a real word covering the center on first move and scores it", () => {
    const board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
    // "CAT" placed horizontally at row 7, cols 6,7,8 — covers center (7,7)
    const pending = [
      { r: 7, c: 6, tile: { letter: "c", isBlank: false } as Tile },
      { r: 7, c: 7, tile: { letter: "a", isBlank: false } as Tile },
      { r: 7, c: 8, tile: { letter: "t", isBlank: false } as Tile },
    ];
    // Confirm CAT is in dictionary (it is — it's in our common list)
    expect(isWord("cat")).toBe(true);
    const res = validateAndScore(board, pending, true);
    expect(res.ok).toBe(true);
    if (res.ok) {
      // C(3) + A(1) + T(1) = 5, doubled by center DW = 10
      expect(res.score).toBe(10);
      expect(res.words).toContain("CAT");
    }
  });

  it("validateAndScore rejects a non-word", () => {
    const board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
    const pending = [
      { r: 7, c: 6, tile: { letter: "z", isBlank: false } as Tile },
      { r: 7, c: 7, tile: { letter: "z", isBlank: false } as Tile },
      { r: 7, c: 8, tile: { letter: "z", isBlank: false } as Tile },
    ];
    const res = validateAndScore(board, pending, true);
    expect(res.ok).toBe(false);
  });

  it("pass switches turn and increments consecutivePasses", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "pass" });
    expect(s2.turn).toBe("cpu");
    expect(s2.consecutivePasses).toBe(1);
  });

  it("six consecutive passes ends the game", () => {
    let s = initialState(1, S);
    // Alternate passes: human pass moves to cpu, we manually reset turn back
    // to human while preserving the pass counter to simulate the cpu also passing.
    for (let i = 0; i < 6; i++) {
      s = reducer(s, { type: "pass" });
      if (s.phase === "done") break;
      // Simulate CPU passing (it would also call pass via cpuTurn but cleaner to flip)
      s = { ...s, turn: "human" };
    }
    expect(s.phase).toBe("done");
    const t = isTerminal(s);
    expect(t).not.toBeNull();
  });

  it("submit on empty pending is a no-op (same state)", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "submit" });
    expect(s2).toBe(s);
  });

  it("words.ts dictionary contains common words", () => {
    expect(isWord("cat")).toBe(true);
    expect(isWord("the")).toBe(true);
    expect(isWord("hello")).toBe(false); // 5 letters but ensure case handling
    // 'hello' is not in our curated short-word list; this asserts dictionary is bounded
    expect(isWord("CAT")).toBe(true); // case-insensitive
  });

  it("isTerminal score is non-negative", () => {
    let s = initialState(1, S);
    s = { ...s, phase: "done", humanScore: 50, cpuScore: 100 };
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(0);
    // Loss => 0
    expect(t!.score).toBe(0);
  });
});
