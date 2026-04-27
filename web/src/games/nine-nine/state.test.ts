import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_DRAWS, isNine } from "./state.js";
const S = { dummy: false };
describe("NineNine", () => {
  it("starts at draw 1 with score 0", () => {
    const s = initialState(1, S);
    expect(s.draw).toBe(1);
    expect(s.score).toBe(0);
    expect(s.phase).toBe("drawing");
  });
  it("draw advances to scored phase with a card", () => {
    const s = reducer(initialState(1, S), { type:"draw" });
    expect(s.phase === "scored" || s.phase === "done").toBe(true);
    expect(s.card).not.toBeNull();
  });
  it("score gains at least 5 per draw", () => {
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
  it("isNine matches rank index 7", () => { expect(isNine(7)).toBe(true); expect(isNine(0)).toBe(false); });
});
