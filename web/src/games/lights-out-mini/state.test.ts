import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isSolved } from "./state.js";
const S = { dummy: false };
describe("LightsOutMini", () => {
  it("starts in playing with 9 cells", () => { const s = initialState(1, S); expect(s.phase).toBe("playing"); expect(s.cells.length).toBe(9); });
  it("starts unsolved", () => { expect(isSolved(initialState(1, S).cells)).toBe(false); });
  it("tap toggles cell + neighbors", () => {
    const s = initialState(1, S);
    const before = [...s.cells];
    const s2 = reducer(s, { type:"tap", index: 4 });
    expect(s2.moves).toBe(1);
    // center + 4 neighbors flipped
    let diffs = 0;
    for (let i = 0; i < 9; i++) if (before[i] !== s2.cells[i]) diffs++;
    expect(diffs).toBeGreaterThanOrEqual(3);
  });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("reset clears moves", () => {
    let s = initialState(1, S);
    s = reducer(s, { type:"tap", index: 0 });
    s = reducer(s, { type:"reset" });
    expect(s.moves).toBe(0);
  });
});
