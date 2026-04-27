import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS, HAND_SIZE } from "./state.js";
const S = { dummy: false };
describe("CardDownstairs", () => {
  it("starts in dealing", () => { const s = initialState(1, S); expect(s.phase).toBe("dealing"); expect(s.round).toBe(1); });
  it("deal produces hand and scored or done", () => {
    const s = reducer(initialState(1, S), { type:"deal" });
    expect(s.hand.length).toBe(HAND_SIZE);
    expect(["scored","done"]).toContain(s.phase);
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after TOTAL_ROUNDS", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS + 1; i++) {
      if (s.phase === "dealing") s = reducer(s, { type:"deal" });
      if (s.phase === "scored") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
  });
});
