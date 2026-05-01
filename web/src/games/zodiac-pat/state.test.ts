import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = {} as never;

describe("zodiac-pat", () => {
  it("starts with rings populated", () => {
    const s = initialState(1, S);
    expect(s.rings.length).toBeGreaterThan(0);
  });
  it("is deterministic under the same seed", () => {
    const a = initialState(7, S);
    const b = initialState(7, S);
    expect(a.held?.id).toBe(b.held?.id);
  });
  it("tick advances the game", () => {
    const s0 = initialState(2, S);
    if (!s0.held) return;
    const s1 = reducer(s0, { type: "tick" });
    expect(s1.movesMade).toBe(s0.movesMade + 1);
  });
  it("isTerminal is null on a fresh deal", () => {
    const s = initialState(3, S);
    expect(isTerminal(s)).toBeNull();
  });
});
