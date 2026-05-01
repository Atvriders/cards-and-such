import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, cfg } from "./state.js";

const S = {} as never;

describe("addiction-soli", () => {
  it("starts with the grid populated", () => {
    const s = initialState(1, S);
    const cards = s.grid.flat().filter((c) => c.card).length;
    const total = 52 * cfg.copies;
    // Aces are removed -> 4 gaps per deck.
    expect(cards).toBe(total - 4 * cfg.copies);
  });
  it("is deterministic under the same seed", () => {
    const a = initialState(7, S);
    const b = initialState(7, S);
    const ai = a.grid.map((row) => row.map((c) => c.card?.id ?? "_").join(",")).join("|");
    const bi = b.grid.map((row) => row.map((c) => c.card?.id ?? "_").join(",")).join("|");
    expect(ai).toBe(bi);
  });
  it("redeal decrements remaining count", () => {
    const s0 = initialState(2, S);
    const s1 = reducer(s0, { type: "redeal" });
    expect(s1.redealsRemaining).toBe(s0.redealsRemaining - 1);
  });
  it("isTerminal is null on a fresh deal", () => {
    const s = initialState(3, S);
    expect(isTerminal(s)).toBeNull();
  });
});
