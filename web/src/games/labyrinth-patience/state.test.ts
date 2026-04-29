import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, ROUNDS, HAND_SIZE, cardName } from "./state.js";
const S = { dummy: false };
describe("LabyrinthPatience", () => {
  it("starts in playing phase with a hand", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.hand.length).toBeGreaterThanOrEqual(1);
    expect(s.hand.length).toBeLessThanOrEqual(HAND_SIZE);
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
  it("keep advances round and never decreases score", () => {
    const s0 = initialState(7, S);
    const s1 = reducer(s0, { type: "keep" });
    expect(s1.round).toBeGreaterThanOrEqual(s0.round + 1);
    expect(s1.score).toBeGreaterThanOrEqual(s0.score);
  });
  it("discard advances round and gives at least 1 point", () => {
    const s0 = initialState(3, S);
    const s1 = reducer(s0, { type: "discard", index: 0 });
    expect(s1.round).toBeGreaterThanOrEqual(s0.round + 1);
    expect(s1.score).toBeGreaterThanOrEqual(s0.score + 1);
  });
  it("game ends after ROUNDS keeps", () => {
    let s = initialState(5, S);
    let safety = 0;
    while (s.phase === "playing" && safety++ < ROUNDS + 5) {
      s = reducer(s, { type: "keep" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
  it("cardName returns rank+suit string", () => {
    expect(cardName(0).length).toBeGreaterThanOrEqual(2);
  });
  it("swap exchanges card without ending round", () => {
    const s0 = initialState(11, S);
    const s1 = reducer(s0, { type: "swap", index: 0 });
    expect(s1.round).toBe(s0.round);
    expect(s1.hand.length).toBe(s0.hand.length);
  });
});
