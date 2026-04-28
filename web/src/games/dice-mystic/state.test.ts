import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("DiceMystic", () => {
  it("starts in choose", () => { expect(initialState(1,S).phase).toBe("choose"); });
  it("choose rolls 2 dice", () => { const s=reducer(initialState(1,S),{type:"choose",mult:1}); expect(s.dice).not.toBeNull(); });
  it("score non-negative", () => { const s=reducer(initialState(1,S),{type:"choose",mult:1}); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("result phase after choose", () => { const s=reducer(initialState(1,S),{type:"choose",mult:2}); expect(["result","done"]).toContain(s.phase); });
  it("isTerminal null start", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
});
