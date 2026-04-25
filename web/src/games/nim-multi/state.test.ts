import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { NimMultiSettings, NimMultiState } from "./state.js";

const settings: NimMultiSettings = { piles: "5" };

describe("NimMulti initialState", () => {
  it("creates correct number of piles", () => {
    const s = initialState(1, settings);
    expect(s.piles).toHaveLength(5);
  });

  it("all piles >= 2", () => {
    const s = initialState(99, settings);
    for (const p of s.piles) expect(p).toBeGreaterThanOrEqual(2);
  });

  it("starts on player turn", () => {
    const s = initialState(1, settings);
    expect(s.turn).toBe("player");
    expect(s.gameOver).toBe(false);
  });

  it("9-pile variant has 9 piles", () => {
    const s = initialState(1, { piles: "9" });
    expect(s.piles).toHaveLength(9);
  });
});

describe("NimMulti reducer", () => {
  it("select sets selected pile and count", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "select", pile: 0, count: 1 });
    expect(s2.selected).toEqual({ pile: 0, count: 1 });
  });

  it("take without selection is a no-op", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "take" });
    expect(s2).toBe(s);
  });

  it("take removes stones and bot responds", () => {
    const s = initialState(1, settings);
    const pile0Before = s.piles[0]!;
    let s2 = reducer(s, { type: "select", pile: 0, count: 1 });
    s2 = reducer(s2, { type: "take" });
    // Player removed 1 from pile 0; bot also moved, so total removed >= 1
    expect(s2.piles[0]!).toBeLessThanOrEqual(pile0Before - 1);
  });

  it("game ends when player takes last stone", () => {
    const base = initialState(1, settings);
    const s: NimMultiState = { ...base, piles: [1, 0, 0, 0, 0], selected: null };
    let s2 = reducer(s, { type: "select", pile: 0, count: 1 });
    s2 = reducer(s2, { type: "take" });
    expect(s2.gameOver).toBe(true);
    expect(s2.winner).toBe("player");
  });

  it("restart resets game", () => {
    let s = initialState(1, settings);
    s = reducer(s, { type: "select", pile: 0, count: 1 });
    s = reducer(s, { type: "take" });
    const s2 = reducer(s, { type: "restart" });
    expect(s2.gameOver).toBe(false);
    expect(s2.selected).toBeNull();
  });
});

describe("NimMulti isTerminal", () => {
  it("returns null when not over", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score 100 on player win", () => {
    const base = initialState(1, settings);
    const s: NimMultiState = { ...base, piles: [1, 0, 0, 0, 0], selected: null };
    let s2 = reducer(s, { type: "select", pile: 0, count: 1 });
    s2 = reducer(s2, { type: "take" });
    expect(isTerminal(s2)?.score).toBe(100);
  });
});
