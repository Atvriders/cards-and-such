import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("DicePinball", () => {
  it("starts in idle round 1", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("idle");
    expect(s.round).toBe(1);
  });
  it("launch produces dice and result phase", () => {
    const s = reducer(initialState(1, S), { type:"launch" });
    expect(s.phase).toBe("result");
    expect(s.dice).not.toBeNull();
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
  it("next advances to next round", () => {
    let s = initialState(1, S);
    s = reducer(s, { type:"launch" });
    s = reducer(s, { type:"next" });
    expect(s.round).toBeGreaterThanOrEqual(2);
  });
  it("finishes after TOTAL_ROUNDS", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type:"launch" });
      s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
  });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
