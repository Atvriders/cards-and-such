import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, CHOICES } from "./state.js";
const S = { dummy: false };
describe("CardTowerFall", () => {
  it("starts in predict phase", () => { expect(initialState(1,S).phase).toBe("predict"); });
  it("go produces result or done", () => { const s = reducer(initialState(1,S), { type:"go", choice: CHOICES[0]! }); expect(["result","done"]).toContain(s.phase); });
  it("score is non-negative after one round", () => { const s = reducer(initialState(1,S), { type:"go", choice: CHOICES[0]! }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
  it("display is set after a round resolves", () => { const s = reducer(initialState(1,S), { type:"go", choice: CHOICES[0]! }); expect(s.display.length).toBeGreaterThanOrEqual(1); });
});
