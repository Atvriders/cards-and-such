import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS, DIE_COUNT } from "./state.js";
const S = { dummy: false };
describe("DiceBowling", () => {
  it("starts in rolling phase round 1", () => { const s = initialState(1, S); expect(s.phase).toBe("rolling"); expect(s.round).toBe(1); });
  it("roll produces dice and rolled or done", () => {
    const s = reducer(initialState(1, S), { type:"roll" });
    expect(s.dice).not.toBeNull();
    expect(s.dice!.length).toBe(DIE_COUNT);
    expect(["rolled","done"]).toContain(s.phase);
  });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after TOTAL_ROUNDS rolls", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS + 2; i++) {
      if (s.phase === "rolling") s = reducer(s, { type:"roll" });
      if (s.phase === "rolled") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
  });
});
