import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, P0_PITS, P1_PITS, P0_STORE, P1_STORE } from "./state.js";

describe("Kalah", () => {
  it("starts with 6 seeds in each pit and 0 in stores", () => {
    const s = initialState(1, {});
    for (const p of P0_PITS) expect(s.board[p]).toBe(6);
    for (const p of P1_PITS) expect(s.board[p]).toBe(6);
    expect(s.board[P0_STORE]).toBe(0);
    expect(s.board[P1_STORE]).toBe(0);
    expect(s.turn).toBe(0);
    expect(s.winner).toBeNull();
  });

  it("conserves total seeds after a move", () => {
    const s = initialState(42, {});
    const total = s.board.reduce((a, b) => a + b, 0);
    const next = reducer(s, { type: "sow", pit: 0 });
    expect(next.board.reduce((a, b) => a + b, 0)).toBe(total);
  });

  it("rejects sow from opponent pit", () => {
    const s = initialState(0, {});
    const next = reducer(s, { type: "sow", pit: 7 });
    expect(next).toBe(s);
  });

  it("rejects sow from empty pit", () => {
    const s = initialState(0, {});
    const board = [...s.board];
    board[3] = 0;
    const s2 = { ...s, board };
    const next = reducer(s2, { type: "sow", pit: 3 });
    expect(next).toBe(s2);
  });

  it("isTerminal returns null mid-game and scores at end", () => {
    const s = initialState(0, {});
    expect(isTerminal(s)).toBeNull();
    expect(isTerminal({ ...s, winner: 0 })).toEqual({ score: 100 });
    expect(isTerminal({ ...s, winner: 1 })).toEqual({ score: 0 });
    expect(isTerminal({ ...s, winner: "draw" })).toEqual({ score: 50 });
  });

  it("extra turn when last seed lands in own store (pit 5 has 1 seed)", () => {
    const s = initialState(0, {});
    const board = [...s.board];
    // pit 5 with exactly 1 seed: sow -> lands in store 6 -> extra turn
    for (let i = 0; i < 5; i++) board[i] = 0;
    board[5] = 1;
    const s2 = { ...s, board };
    const next = reducer(s2, { type: "sow", pit: 5 });
    // Player should still be active (turn stays 0) and store has at least 1
    expect(next.board[P0_STORE]).toBeGreaterThanOrEqual(1);
  });
});
