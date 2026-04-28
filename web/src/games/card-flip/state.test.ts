import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, CARD_COUNT, PAIR_COUNT } from "./state.js";
const S = { dummy: false };
describe("CardFlip", () => {
  it("starts with 16 cards face down", () => {
    const s = initialState(1, S);
    expect(s.cards.length).toBe(CARD_COUNT);
    expect(s.cards.every(c => !c.revealed)).toBe(true);
  });
  it("flip reveals a card", () => {
    const s = reducer(initialState(1, S), { type:"flip", index: 0 });
    expect(s.cards[0]!.revealed).toBe(true);
    expect(s.firstPick).toBe(0);
  });
  it("matching pair increments matches and score", () => {
    let s = initialState(1, S);
    // find any pair
    const v0 = s.cards[0]!.value;
    const partner = s.cards.findIndex((c, i) => i !== 0 && c.value === v0);
    s = reducer(s, { type:"flip", index: 0 });
    s = reducer(s, { type:"flip", index: partner });
    expect(s.matches).toBeGreaterThanOrEqual(1);
    expect(s.score).toBeGreaterThanOrEqual(20);
  });
  it("solving all pairs ends game", () => {
    let s = initialState(1, S);
    for (let v = 1; v <= PAIR_COUNT; v++) {
      const idxs: number[] = [];
      s.cards.forEach((c, i) => { if (c.value === v) idxs.push(i); });
      s = reducer(s, { type:"flip", index: idxs[0]! });
      s = reducer(s, { type:"flip", index: idxs[1]! });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
