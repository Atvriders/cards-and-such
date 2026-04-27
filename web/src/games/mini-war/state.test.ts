import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("MiniWar", () => {
  it("starts in ready phase", () => { expect(initialState(1, S).phase).toBe("ready"); });
  it("battle produces both cards", () => { const s = reducer(initialState(1, S), { type:"battle" }); expect(s.you).not.toBeNull(); expect(s.cpu).not.toBeNull(); });
  it("score is non-negative after battle", () => { const s = reducer(initialState(1, S), { type:"battle" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
