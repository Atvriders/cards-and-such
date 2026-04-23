import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, P0_PITS, P1_PITS, P0_STORE, P1_STORE, SEEDS_PER_PIT } from "./state.js";

describe("Sungka", () => {
  it("initial board: 7 seeds per pit, stores empty", () => {
    const s = initialState(0, {});
    expect(s.turn).toBe(0);
    expect(s.winner).toBeNull();
    for (const p of P0_PITS) expect(s.board[p]).toBe(SEEDS_PER_PIT);
    for (const p of P1_PITS) expect(s.board[p]).toBe(SEEDS_PER_PIT);
    expect(s.board[P0_STORE]).toBe(0);
    expect(s.board[P1_STORE]).toBe(0);
  });

  it("sow empties chosen pit", () => {
    const s = initialState(0, {});
    const next = reducer(s, { type: "sow", pit: 1 });
    expect(next.board[1]).toBe(0);
  });

  it("total seeds conserved (or captured into store)", () => {
    const s = initialState(42, {});
    const totalBefore = s.board.reduce((a,b)=>a+b,0);
    const next = reducer(s, { type: "sow", pit: 4 });
    const totalAfter = next.board.reduce((a,b)=>a+b,0);
    expect(totalAfter).toBeLessThanOrEqual(totalBefore);
  });

  it("ignores sow on empty pit", () => {
    const s = initialState(0, {});
    const empty = { ...s, board: s.board.map((v,i) => i===1 ? 0 : v) as number[] };
    const next = reducer(empty, { type: "sow", pit: 1 });
    expect(next).toBe(empty);
  });

  it("ignores sow on opponent pit", () => {
    const s = initialState(0, {});
    const next = reducer(s, { type: "sow", pit: P1_PITS[0]! });
    expect(next).toBe(s);
  });

  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(0,{}))).toBeNull();
  });

  it("isTerminal returns 100 for player win", () => {
    const s = { ...initialState(0,{}), winner: 0 as const };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });

  it("isTerminal returns draw score", () => {
    const s = { ...initialState(0,{}), winner: "draw" as const };
    expect(isTerminal(s)).toEqual({ score: 50 });
  });
});
