import { describe, expect, it } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  sowMove,
  P0_PITS,
  P1_PITS,
  P0_STORE,
  P1_STORE,
} from "./state.js";

describe("Mancala (Full Kalah, Match Play)", () => {
  it("initialState is deterministic by seed", () => {
    const a = initialState(123, {});
    const b = initialState(123, {});
    expect(a).toEqual(b);
  });

  it("starts with 4 seeds in each pit and 0 in stores (24+24=48 total)", () => {
    const s = initialState(1, {});
    for (const p of P0_PITS) expect(s.board[p]).toBe(4);
    for (const p of P1_PITS) expect(s.board[p]).toBe(4);
    expect(s.board[P0_STORE]).toBe(0);
    expect(s.board[P1_STORE]).toBe(0);
    expect(s.board.reduce((a, b) => a + b, 0)).toBe(48);
    expect(s.turn).toBe(0);
    expect(s.roundWinner).toBeNull();
    expect(s.matchWinner).toBeNull();
    expect(s.matchScore).toEqual({ p0: 0, p1: 0 });
  });

  it("isTerminal returns null until the match ends", () => {
    const s = initialState(0, {});
    expect(isTerminal(s)).toBeNull();
    // Mid-round, mid-match still null.
    const mid = { ...s, roundWinner: 0 as const, matchScore: { p0: 1, p1: 0 } };
    expect(isTerminal(mid)).toBeNull();
    // Match over — non-null.
    const won = { ...s, matchWinner: 0 as const, matchScore: { p0: 5, p1: 2 } };
    expect(isTerminal(won)).toEqual({ score: 500 });
    const lost = { ...s, matchWinner: 1 as const, matchScore: { p0: 2, p1: 5 } };
    expect(isTerminal(lost)).toEqual({ score: 0 });
  });

  it("rejects sow from CPU pit or empty pit (returns same reference)", () => {
    const s = initialState(0, {});
    expect(reducer(s, { type: "sow", pit: 7 })).toBe(s);
    const board = [...s.board];
    board[3] = 0;
    const s2 = { ...s, board };
    expect(reducer(s2, { type: "sow", pit: 3 })).toBe(s2);
  });

  it("sowMove conserves seeds and skips opponent's home", () => {
    const s = initialState(0, {});
    // Loading 11 seeds into pit 2 — sowing will pass full CCW once.
    const board = [...s.board];
    board[2] = 11;
    const { board: nb } = sowMove(board, 2, 0);
    // Should never deposit into opponent's home.
    expect(nb[P1_STORE]).toBe(s.board[P1_STORE]);
    // Total seeds preserved (just moved around).
    const sum = (arr: readonly number[]) => arr.reduce((a, b) => a + b, 0);
    expect(sum(nb)).toBe(sum(board));
  });

  it("free turn when last seed lands in own home (pit 2 has exactly 4 seeds)", () => {
    const s = initialState(0, {});
    // From fresh state, pit 2 has 4 seeds. Sowing them lands one each in 3, 4,
    // 5, and 6 (own home) — so we get a free turn.
    const { board: nb, extraTurn, capturePit } = sowMove(s.board, 2, 0);
    expect(extraTurn).toBe(true);
    expect(capturePit).toBeNull();
    expect(nb[P0_STORE]).toBe(1);
    expect(nb[3]).toBe(5);
    expect(nb[4]).toBe(5);
    expect(nb[5]).toBe(5);
  });

  it("empty-side capture grabs both the landing seed and the opposite pit", () => {
    // Set up: P0 pit 0 is empty, opposite pit (12) holds 6 seeds. P0 pit 5
    // holds 1 seed, sowing it from pit 5 (last seed) lands... wait — easier
    // construction: put 1 seed in pit 4 with pit 5 empty and pit 7 (opposite
    // of pit 5) holding seeds. Sowing pit 4's single seed lands in pit 5
    // (empty), capturing the opposite pit 7.
    const empty = new Array<number>(14).fill(0);
    empty[4] = 1;     // sow source — single seed
    empty[5] = 0;     // own empty pit
    empty[7] = 6;     // opposite of pit 5
    empty[P0_STORE] = 0;
    const { board: nb, capturePit, extraTurn } = sowMove(empty, 4, 0);
    expect(extraTurn).toBe(false);
    expect(capturePit).toBe(5);
    expect(nb[5]).toBe(0);
    expect(nb[7]).toBe(0);
    // Captured 1 (the landing seed) + 6 (opposite) = 7 into home.
    expect(nb[P0_STORE]).toBe(7);
  });

  it("round ends when one side empties; remaining seeds sweep to the other home", () => {
    // Set up a near-end state: all P1 pits empty except a single 1 in pit 0;
    // P0's pits have seeds; sowing pit 0 (1 seed) lands in pit 1, which leaves
    // P0 still not empty but P1 still empty -> round should end and P0 sweeps
    // remaining into its home.
    const board = new Array<number>(14).fill(0);
    board[0] = 1;
    board[1] = 2;
    board[3] = 3;
    board[P0_STORE] = 10;
    // P1 already all-empty
    board[P1_STORE] = 8;
    const before = initialState(0, {});
    const s = { ...before, board };
    const next = reducer(s, { type: "sow", pit: 0 });
    // After sow + sweep, P0 pits should all be 0 and P0's home should hold
    // its prior 10 + the swept 6 (1 + 2 + 3) = 16.
    for (const p of P0_PITS) expect(next.board[p]).toBe(0);
    for (const p of P1_PITS) expect(next.board[p]).toBe(0);
    expect(next.board[P0_STORE]).toBe(16);
    expect(next.board[P1_STORE]).toBe(8);
    expect(next.roundWinner).toBe(0);
    expect(next.roundsPlayed).toBe(1);
    expect(next.matchScore).toEqual({ p0: 1, p1: 0 });
  });

  it("match ends when one side reaches 5 round-wins (best-of-9)", () => {
    let s = initialState(7, {});
    // Force-step the round bookkeeping by simulating 5 P0 wins via the round
    // resolution path. We do this by repeatedly creating a near-finished
    // board (P1 already empty) and sowing one pit to trigger sweep.
    for (let i = 0; i < 5; i++) {
      const board = new Array<number>(14).fill(0);
      board[0] = 1;
      board[P0_STORE] = 25; // anything > 0 to ensure P0 wins
      board[P1_STORE] = 0;
      // Snap the board into state, keeping the running match score.
      s = { ...s, board, turn: 0, roundWinner: null };
      s = reducer(s, { type: "sow", pit: 0 });
      expect(s.roundWinner).toBe(0);
      // Advance to next round unless match already over.
      if (s.matchWinner === null) {
        s = reducer(s, { type: "nextRound" });
      }
    }
    expect(s.matchWinner).toBe(0);
    expect(s.matchScore.p0).toBe(5);
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBe(500);
  });

  it("nextRound is a no-op while round is still being played", () => {
    const s = initialState(0, {});
    expect(reducer(s, { type: "nextRound" })).toBe(s);
  });
});
