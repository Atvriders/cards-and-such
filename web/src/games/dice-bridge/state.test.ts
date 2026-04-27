import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, SEGMENTS, MAX_ROLLS } from "./state.js";
const S = { dummy: false };
describe("DiceBridge", () => {
  it("starts in rolling with 0 segments", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("rolling");
    expect(s.segments).toBe(0);
  });
  it("roll updates state", () => {
    const s = reducer(initialState(1, S), { type: "roll" });
    expect(s.dice).not.toBeNull();
    expect(s.rollsUsed).toBe(1);
  });
  it("bank ends the game", () => {
    const s = reducer(initialState(1, S), { type: "bank" });
    expect(s.phase).toBe("done");
  });
  it("game ends after MAX_ROLLS", () => {
    let s = initialState(1, S);
    for (let i = 0; i < MAX_ROLLS; i++) s = reducer(s, { type: "roll" });
    expect(s.phase).toBe("done");
  });
  it("SEGMENTS is 6", () => { expect(SEGMENTS).toBe(6); });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});
