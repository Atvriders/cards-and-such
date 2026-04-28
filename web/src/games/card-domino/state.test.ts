import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_PLAYS } from "./state.js";
const S = { dummy: false };
describe("CardDomino", () => {
  it("starts in playing with hand", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.hand.length).toBeGreaterThanOrEqual(TOTAL_PLAYS);
  });
  it("first play always succeeds and increments played", () => {
    const s = initialState(1, S);
    const id = s.hand[0]!.id;
    const s2 = reducer(s, { type:"play", cardId: id });
    expect(s2.chain.length).toBe(1);
    expect(s2.played).toBe(1);
  });
  it("skip decrements score and increments played", () => {
    const s = reducer(initialState(1, S), { type:"skip" });
    expect(s.played).toBe(1);
  });
  it("game ends after TOTAL_PLAYS", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_PLAYS; i++) s = reducer(s, { type:"skip" });
    expect(s.phase).toBe("done");
  });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
