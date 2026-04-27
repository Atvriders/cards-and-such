import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, GRID_SIZE } from "./state.js";
const S = { dummy: false };
describe("Numlinks", () => {
  it("starts in playing with 16 cells", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.cells.length).toBe(GRID_SIZE);
    expect(s.next).toBe(1);
  });
  it("clicking the next number scores", () => {
    const s = initialState(1, S);
    const idx = s.cells.indexOf(1);
    const s2 = reducer(s, { type: "click", index: idx });
    expect(s2.score).toBeGreaterThanOrEqual(10);
    expect(s2.next).toBe(2);
  });
  it("wrong click finishes puzzle", () => {
    const s = initialState(1, S);
    const wrongIdx = s.cells.indexOf(5); // not 1
    const s2 = reducer(s, { type: "click", index: wrongIdx });
    expect(s2.phase).toBe("finished");
  });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});
