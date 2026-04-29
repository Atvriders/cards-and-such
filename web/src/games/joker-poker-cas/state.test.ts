import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("Joker Poker (Casino)", () => {
  it("starts in ready phase", () => { expect(initialState(1, S).phase).toBe("ready"); });
  it("starts with score >= 0", () => { expect(initialState(1, S).score).toBeGreaterThanOrEqual(0); });
  it("play deals cards", () => { const s = reducer(initialState(7, S), { type: "play" }); expect(s.cardA !== null && s.cardB !== null && s.cardC !== null).toBe(true); });
  it("score non-negative after play", () => { const s = reducer(initialState(7, S), { type: "play" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("plays full game", () => {
    let s = initialState(11, S);
    for (let i = 0; i < TOTAL_ROUNDS && !isTerminal(s); i++) { s = reducer(s, { type: "play" }); if (s.phase === "scored") s = reducer(s, { type: "next" }); }
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
});
