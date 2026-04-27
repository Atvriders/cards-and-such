import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_DRAWS, isEight } from "./state.js";
const S = { dummy: false };
describe("EightEaters", () => {
  it("starts at draw 1 with score 0", () => {
    const s = initialState(1, S);
    expect(s.draw).toBe(1); expect(s.score).toBe(0); expect(s.phase).toBe("drawing");
  });
  it("draw produces a card", () => {
    const s = reducer(initialState(1, S), { type:"draw" });
    expect(s.card).not.toBeNull();
    expect(s.score).toBeGreaterThanOrEqual(5);
  });
  it("score grows over rounds", () => {
    let s = initialState(2, S);
    for (let i = 0; i < TOTAL_DRAWS; i++) {
      s = reducer(s, { type:"draw" });
      if (s.phase !== "done") s = reducer(s, { type:"next" });
    }
    expect(s.score).toBeGreaterThanOrEqual(5 * TOTAL_DRAWS);
  });
  it("isTerminal null while drawing", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after TOTAL_DRAWS", () => {
    let s = initialState(3, S);
    for (let i = 0; i < TOTAL_DRAWS; i++) {
      s = reducer(s, { type:"draw" });
      if (s.phase !== "done") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
  });
  it("isEight matches rank index 6", () => { expect(isEight(6)).toBe(true); expect(isEight(7)).toBe(false); });
});
