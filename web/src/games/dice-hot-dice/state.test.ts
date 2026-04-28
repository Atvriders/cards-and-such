import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("DiceHotDice", () => {
  it("starts in rolling round 1", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("rolling");
    expect(s.round).toBe(1);
  });
  it("roll updates current or busts", () => {
    const s = reducer(initialState(1, S), { type:"roll" });
    expect(s.lastDie).not.toBeNull();
    expect(s.current).toBeGreaterThanOrEqual(0);
  });
  it("bank transfers current to banked", () => {
    let s = initialState(1, S);
    s = { ...s, current: 25, streak: 3 };
    s = reducer(s, { type:"bank" });
    expect(s.banked).toBe(25);
    expect(s.current).toBe(0);
  });
  it("banking through all rounds ends game", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) s = reducer(s, { type:"bank" });
    expect(s.phase).toBe("done");
  });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
