import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { rounds: "10" as const };
describe("CardLowPick", () => {
  it("starts in picking phase with 4 cards", () => { const s = initialState(1, S); expect(s.phase).toBe("picking"); expect(s.hand.length).toBe(4); });
  it("picking a card transitions phase", () => { const s = reducer(initialState(2, S), { type:"pick", index:0 }); expect(["result","gameover"]).toContain(s.phase); });
  it("score is non-negative after pick", () => { const s = reducer(initialState(3, S), { type:"pick", index:1 }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null while in progress", () => { expect(isTerminal(initialState(4, S))).toBeNull(); });
});
