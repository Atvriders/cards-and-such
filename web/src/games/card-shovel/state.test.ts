import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_CARDS } from "./state.js";
const S = { dummy: false };
describe("CardShovel", () => {
  it("starts in playing with first card", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.current).not.toBeNull();
    expect(s.deck.length).toBe(TOTAL_CARDS - 1);
  });
  it("correct placement awards score", () => {
    const s = initialState(1, S);
    const suit = s.current!.suit;
    const s2 = reducer(s, { type:"place", suit });
    expect(s2.score).toBeGreaterThanOrEqual(10);
    expect(s2.played).toBe(1);
  });
  it("wrong placement deducts score", () => {
    const s = initialState(1, S);
    const wrong = (["S","H","D","C"] as const).find(x => x !== s.current!.suit)!;
    const s2 = reducer(s, { type:"place", suit: wrong });
    expect(s2.errors).toBeGreaterThanOrEqual(1);
  });
  it("game ends after all cards placed", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_CARDS; i++) s = reducer(s, { type:"place", suit: "S" });
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
