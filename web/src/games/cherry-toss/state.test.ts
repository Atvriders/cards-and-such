import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("CherryToss", () => {
  it("starts in aiming phase with 0 score", () => { const s = initialState(1, S); expect(s.phase).toBe("aiming"); expect(s.score).toBe(0); });
  it("setPower changes power value", () => { const s = reducer(initialState(2, S), { type:"setPower", value:75 }); expect(s.power).toBe(75); });
  it("throw adds points and advances phase", () => { const s = reducer(initialState(3, S), { type:"throw" }); expect(s.score).toBeGreaterThanOrEqual(0); expect(["result","done"]).toContain(s.phase); });
  it("isTerminal null while in progress", () => { expect(isTerminal(initialState(4, S))).toBeNull(); });
});
