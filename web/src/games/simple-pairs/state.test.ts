import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, cfg } from "./state.js";

const S = {} as never;

describe("simple-pairs", () => {
  it("starts with grid populated", () => {
    const s = initialState(1, S);
    const cards = s.grid.flat().filter((c) => c.card).length;
    expect(cards).toBeGreaterThan(0);
    expect(cards).toBeLessThanOrEqual(cfg.rows * cfg.cols);
  });
  it("is deterministic under the same seed", () => {
    const a = initialState(7, S);
    const b = initialState(7, S);
    expect(a.grid[0]?.[0]?.card?.id).toBe(b.grid[0]?.[0]?.card?.id);
  });
  it("first select highlights a cell", () => {
    const s0 = initialState(2, S);
    const s1 = reducer(s0, { type: "select", r: 0, c: 0 });
    expect(s1.selected).not.toBeNull();
  });
  it("isTerminal is null on a fresh deal", () => {
    const s = initialState(3, S);
    expect(isTerminal(s)).toBeNull();
  });
});
