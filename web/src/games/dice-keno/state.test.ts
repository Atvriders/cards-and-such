import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS, PICK_COUNT } from "./state.js";
const S = { dummy: false };
describe("DiceKeno", () => {
  it("starts in picking", () => { const s = initialState(1, S); expect(s.phase).toBe("picking"); expect(s.picksTotal).toBe(0); });
  it("pick increments count", () => { let s = initialState(1, S); s = reducer(s, { type:"pick", face:3 }); expect(s.picks[2]).toBe(1); expect(s.picksTotal).toBe(1); });
  it("can't roll without 5 picks", () => { let s = initialState(1, S); s = reducer(s, { type:"pick", face:1 }); s = reducer(s, { type:"roll" }); expect(s.rolls).toBeNull(); });
  it("rolling with 5 picks transitions phase", () => {
    let s = initialState(1, S);
    for (let i = 0; i < PICK_COUNT; i++) s = reducer(s, { type:"pick", face: 6 });
    s = reducer(s, { type:"roll" });
    expect(["result","done"]).toContain(s.phase);
    expect(s.matches).toBeGreaterThanOrEqual(0);
  });
  it("game ends after rounds", () => {
    let s = initialState(1, S);
    for (let r = 0; r < TOTAL_ROUNDS; r++) {
      for (let i = 0; i < PICK_COUNT; i++) s = reducer(s, { type:"pick", face:1 });
      s = reducer(s, { type:"roll" });
      if (s.phase === "result") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
  });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
