import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, cfg } from "./state.js";

const S = {} as never;

describe("tower-london-soli", () => {
  it("deals the correct total card count", () => {
    const s = initialState(1, S);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52 * cfg.copies);
  });
  it("is deterministic under the same seed", () => {
    const a = initialState(7, S);
    const b = initialState(7, S);
    const ai = a.piles.map((p) => p.cards.map((c) => c.id)).flat().join(",");
    const bi = b.piles.map((p) => p.cards.map((c) => c.id)).flat().join(",");
    expect(ai).toBe(bi);
  });
  it("rejects illegal moves", () => {
    const s = initialState(3, S);
    // Try moving from a foundation to a tableau (always illegal at start).
    const next = reducer(s, { type: "move", fromPile: "f1", toPile: "t1", count: 1 });
    expect(next).toBe(s);
  });
  it("isTerminal returns null on a fresh deal", () => {
    const s = initialState(11, S);
    expect(isTerminal(s)).toBeNull();
  });
});
