import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, DEAL_COUNT, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("CardMeteor", () => {
  it("starts in picking", () => { const s = initialState(1, S); expect(s.phase).toBe("picking"); expect(s.cards.length).toBeGreaterThanOrEqual(DEAL_COUNT); });
  it("pick advances to scored or done", () => { const s = reducer(initialState(1, S), { type:"pick", index:0 }); expect(["scored","done"]).toContain(s.phase); });
  it("score is non-negative after pick", () => { const s = reducer(initialState(1, S), { type:"pick", index:0 }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after TOTAL_ROUNDS picks", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type:"pick", index:0 });
      if (s.phase === "scored") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
  });
});
