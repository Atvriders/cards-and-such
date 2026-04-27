import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("DiceDomino", () => {
  it("starts in ready with target", () => { const s = initialState(1, S); expect(s.phase).toBe("ready"); expect(s.target.length).toBe(2); });
  it("roll yields rolled and result", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(s.rolled).not.toBeNull(); expect(["rolled","done"]).toContain(s.phase); });
  it("score is non-negative", () => { const s = reducer(initialState(7, S), { type:"roll" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("ends after TOTAL_ROUNDS", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type:"roll" });
      if (s.phase === "rolled") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
  });
});
