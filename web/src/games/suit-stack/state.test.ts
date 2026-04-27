import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("SuitStack", () => {
  it("starts in drawing, no cards drawn", () => { const s = initialState(1, S); expect(s.phase).toBe("drawing"); expect(s.drawn).toEqual([]); });
  it("draw adds 1 card", () => { const s = reducer(initialState(1, S), { type:"draw" }); expect(s.drawn.length).toBe(1); });
  it("score is non-negative after multiple draws", () => {
    let s = initialState(1, S);
    for (let i = 0; i < 8; i++) s = reducer(s, { type:"draw" });
    expect(s.score).toBeGreaterThanOrEqual(0);
    expect(s.phase).toBe("done");
  });
  it("isTerminal returns score when done", () => {
    let s = initialState(1, S);
    for (let i = 0; i < 8; i++) s = reducer(s, { type:"draw" });
    expect(isTerminal(s)).not.toBeNull();
  });
});
