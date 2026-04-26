import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { rounds: "10" as const };
describe("CardStackFlip", () => {
  it("starts in waiting phase with 0 score", () => { const s = initialState(1, S); expect(s.phase).toBe("waiting"); expect(s.score).toBe(0); });
  it("flip reveals 5 cards and adds score", () => { const s = reducer(initialState(2, S), { type:"flip" }); expect(s.flipped.length).toBe(5); expect(s.score).toBeGreaterThan(0); });
  it("phase becomes revealed after flip", () => { const s = reducer(initialState(3, S), { type:"flip" }); expect(s.phase).toBe("revealed"); });
  it("isTerminal null when in progress", () => { expect(isTerminal(initialState(4, S))).toBeNull(); });
});
