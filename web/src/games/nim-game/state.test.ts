import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, START_STICKS } from "./state.js";
const S = { dummy: false };
describe("NimGame", () => {
  it("starts with 21 sticks", () => { expect(initialState(1,S).sticks).toBe(START_STICKS); });
  it("take subtracts player and CPU sticks", () => { const s=reducer(initialState(1,S), { type:"take", n:2 }); expect(s.sticks).toBeLessThan(START_STICKS); expect(s.sticks).toBeGreaterThanOrEqual(START_STICKS - 5); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
  it("invalid take ignored", () => { const s=reducer(initialState(1,S), { type:"take", n:9 }); expect(s.sticks).toBeLessThanOrEqual(START_STICKS); });
});
