import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("DiceSpin", () => {
  it("starts in betting", () => { const s = initialState(1, S); expect(s.phase).toBe("betting"); });
  it("bet produces dice and result", () => { const s = reducer(initialState(1, S), { type:"bet", choice:"over" }); expect(s.dice).not.toBeNull(); expect(["result","done"]).toContain(s.phase); });
  it("score is 0, 10, or 30", () => { const s = reducer(initialState(1, S), { type:"bet", choice:"equal" }); expect([0,10,30]).toContain(s.score); });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("ends after TOTAL_ROUNDS", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type:"bet", choice:"under" });
      if (s.phase === "result") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
  });
});
