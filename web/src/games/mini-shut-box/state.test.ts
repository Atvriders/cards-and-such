import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("MiniShutBox", () => {
  it("starts with all 9 tiles open", () => { const s = initialState(1, S); expect(s.open.every(o=>o)).toBe(true); });
  it("starts in rolling phase", () => { expect(initialState(1, S).phase).toBe("rolling"); });
  it("roll produces dice", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(s.dice).not.toBeNull(); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
