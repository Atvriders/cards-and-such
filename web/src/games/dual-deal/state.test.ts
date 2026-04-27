import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("DualDeal", () => {
  it("starts in betting phase", () => { const s = initialState(1, S); expect(s.phase).toBe("betting"); });
  it("bet produces 2 cards and result", () => { const s = reducer(initialState(1, S), { type:"bet", choice:"left" }); expect(s.cards).not.toBeNull(); expect(["result","done"]).toContain(s.phase); });
  it("score is 0 or 10 after one round", () => { const s = reducer(initialState(1, S), { type:"bet", choice:"left" }); expect([0,10]).toContain(s.score); });
  it("game ends after 12 rounds", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) { s = reducer(s, { type:"bet", choice:"left" }); if (s.phase === "result") s = reducer(s, { type:"next" }); }
    expect(s.phase).toBe("done");
  });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
