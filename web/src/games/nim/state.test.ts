import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { NimSettings, NimState } from "./state.js";

const stdSettings: NimSettings = { piles: "3", rule: "standard" };
const misereSettings: NimSettings = { piles: "3", rule: "misere" };

describe("Nim initialState", () => {
  it("creates the correct number of piles", () => {
    const s = initialState(1, stdSettings);
    expect(s.piles).toHaveLength(3);
    expect(initialState(1, { piles: "5", rule: "standard" }).piles).toHaveLength(5);
  });

  it("all piles have stones between 3 and 9", () => {
    const s = initialState(7, stdSettings);
    for (const p of s.piles) {
      expect(p).toBeGreaterThanOrEqual(3);
      expect(p).toBeLessThanOrEqual(9);
    }
  });

  it("starts with player turn and no game over", () => {
    const s = initialState(1, stdSettings);
    expect(s.turn).toBe("player");
    expect(s.gameOver).toBe(false);
    expect(s.winner).toBeNull();
  });
});

describe("Nim reducer", () => {
  it("removes stones from a pile on player move", () => {
    const s = initialState(1, stdSettings);
    const pile0 = s.piles[0]!;
    const s2 = reducer(s, { type: "remove", pile: 0, count: 1 });
    // After player removes, bot may also have moved
    const removed = pile0 - s2.piles[0]!;
    // player removed 1, bot might have also removed from pile 0
    expect(removed).toBeGreaterThanOrEqual(1);
  });

  it("rejects invalid remove (count > pile size)", () => {
    const s = initialState(1, stdSettings);
    const before = [...s.piles];
    const s2 = reducer(s, { type: "remove", pile: 0, count: 100 });
    expect(s2.piles).toEqual(before);
  });

  it("rejects remove count of 0", () => {
    const s = initialState(1, stdSettings);
    const before = [...s.piles];
    const s2 = reducer(s, { type: "remove", pile: 0, count: 0 });
    expect(s2.piles).toEqual(before);
  });

  it("game ends when all piles are empty", () => {
    // Create a state with only 1 stone in pile 0
    const base = initialState(1, stdSettings);
    const s: NimState = { ...base, piles: [1, 0, 0] };
    const s2 = reducer(s, { type: "remove", pile: 0, count: 1 });
    expect(s2.gameOver).toBe(true);
    expect(s2.winner).not.toBeNull();
  });

  it("standard rule: player who takes last stone wins", () => {
    const base = initialState(1, stdSettings);
    const s: NimState = { ...base, piles: [1, 0, 0] };
    const s2 = reducer(s, { type: "remove", pile: 0, count: 1 });
    expect(s2.winner).toBe("player");
  });

  it("misere rule: player who takes last stone loses", () => {
    const base = initialState(1, misereSettings);
    const s: NimState = { ...base, piles: [1, 0, 0] };
    const s2 = reducer(s, { type: "remove", pile: 0, count: 1 });
    expect(s2.winner).toBe("bot");
  });

  it("restart creates a fresh state", () => {
    let s = initialState(1, stdSettings);
    s = reducer(s, { type: "remove", pile: 0, count: 1 });
    const s2 = reducer(s, { type: "restart" });
    expect(s2.gameOver).toBe(false);
    expect(s2.winner).toBeNull();
  });
});

describe("Nim isTerminal", () => {
  it("returns null when not over", () => {
    expect(isTerminal(initialState(1, stdSettings))).toBeNull();
  });

  it("returns score 100 on player win", () => {
    const base = initialState(1, stdSettings);
    const s: NimState = { ...base, piles: [1, 0, 0] };
    const s2 = reducer(s, { type: "remove", pile: 0, count: 1 });
    expect(isTerminal(s2)?.score).toBe(100);
  });

  it("returns score 0 on bot win", () => {
    const base = initialState(1, misereSettings);
    const s: NimState = { ...base, piles: [1, 0, 0] };
    const s2 = reducer(s, { type: "remove", pile: 0, count: 1 });
    expect(isTerminal(s2)?.score).toBe(0);
  });
});
