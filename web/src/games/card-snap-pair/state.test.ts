import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { rounds: "10" as const };
describe("CardSnapPair", () => {
  it("starts in waiting phase with 0 score", () => { const s = initialState(1, S); expect(s.phase).toBe("waiting"); expect(s.score).toBe(0); });
  it("snap reveals two cards", () => { const s = reducer(initialState(2, S), { type:"snap" }); expect(s.card1).not.toBeNull(); expect(s.card2).not.toBeNull(); });
  it("score increases after snap", () => { const s = reducer(initialState(3, S), { type:"snap" }); expect(s.score).toBeGreaterThan(0); });
  it("isTerminal null while in progress", () => { expect(isTerminal(initialState(4, S))).toBeNull(); });
});
