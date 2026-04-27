import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("DiceBaccarat", () => {
  it("starts in betting", () => { const s = initialState(1, S); expect(s.phase).toBe("betting"); });
  it("bet rolls 4 dice and produces result", () => { const s = reducer(initialState(1, S), { type:"bet", choice:"player" }); expect(s.player).not.toBeNull(); expect(s.banker).not.toBeNull(); expect(["player","banker","tie"]).toContain(s.result); });
  it("score is 0, 10, or 30", () => { const s = reducer(initialState(1, S), { type:"bet", choice:"banker" }); expect([0,10,30]).toContain(s.score); });
  it("game ends after 10 rounds", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) { s = reducer(s, { type:"bet", choice:"player" }); if (s.phase === "result") s = reducer(s, { type:"next" }); }
    expect(s.phase).toBe("done");
  });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
