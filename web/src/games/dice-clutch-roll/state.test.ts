import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { rounds: "10" as const };
describe("DiceClutchRoll", () => {
  it("starts in waiting phase with 0 score", () => { const s = initialState(1, S); expect(s.phase).toBe("waiting"); expect(s.score).toBe(0); });
  it("roll keeps 3 out of 4 dice", () => { const s = reducer(initialState(2, S), { type:"roll" }); expect(s.keptDice.length).toBe(3); expect(s.allDice.length).toBe(4); });
  it("kept dice are the highest 3", () => { const s = reducer(initialState(3, S), { type:"roll" }); const total = s.keptDice.reduce((a,v)=>a+v,0); expect(total).toBeGreaterThan(0); });
  it("isTerminal null while in progress", () => { expect(isTerminal(initialState(4, S))).toBeNull(); });
});
