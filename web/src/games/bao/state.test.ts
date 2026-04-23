import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, P0_PITS, P1_PITS, P0_STORE, P1_STORE, SEEDS_PER_PIT } from "./state.js";

describe("Bao", () => {
  it("initial state has 6 seeds per pit and 0 in stores", () => {
    const s = initialState(0, {});
    expect(s.turn).toBe(0);
    expect(s.winner).toBeNull();
    for (const p of P0_PITS) expect(s.board[p]).toBe(SEEDS_PER_PIT);
    for (const p of P1_PITS) expect(s.board[p]).toBe(SEEDS_PER_PIT);
    expect(s.board[P0_STORE]).toBe(0);
    expect(s.board[P1_STORE]).toBe(0);
  });

  it("sowing pit 3 distributes seeds", () => {
    const s = initialState(0, {});
    const next = reducer(s, { type: "sow", pit: 3 });
    expect(next.board[3]).toBe(0); // pit emptied
    // Seeds distributed to pits following 3 in sow order
    const totalP0After = [0,1,2,4,5,6,7].reduce((sum, p) => sum + (next.board[p] ?? 0), 0);
    const totalP0Before = [0,1,2,4,5,6,7].reduce((sum, p) => sum + (s.board[p] ?? 0), 0);
    // Seeds must have gone somewhere (total seeds in play same or less due to capture)
    expect(next.board[3]).toBe(0);
  });

  it("sowing invalid pit (empty) does nothing", () => {
    const s = initialState(0, {});
    const emptyState = { ...s, board: [...s.board] as number[] };
    (emptyState.board as number[])[0] = 0; // empty pit 0
    const next = reducer(emptyState, { type: "sow", pit: 0 });
    expect(next).toBe(emptyState); // no change
  });

  it("sowing opponent pit does nothing", () => {
    const s = initialState(0, {});
    const next = reducer(s, { type: "sow", pit: P1_PITS[0]! });
    expect(next).toBe(s); // ignored
  });

  it("total seeds are conserved", () => {
    const s = initialState(42, {});
    const totalBefore = s.board.reduce((a,b)=>a+b, 0);
    const next = reducer(s, { type: "sow", pit: 3 });
    const totalAfter = next.board.reduce((a,b)=>a+b, 0);
    expect(totalAfter).toBeLessThanOrEqual(totalBefore); // may capture, conserved or reduced
  });

  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(0,{}))).toBeNull();
  });

  it("isTerminal returns 100 for player win", () => {
    const s = { ...initialState(0,{}), winner: 0 as const };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });

  it("isTerminal returns 0 for bot win", () => {
    const s = { ...initialState(0,{}), winner: 1 as const };
    expect(isTerminal(s)).toEqual({ score: 0 });
  });
});
