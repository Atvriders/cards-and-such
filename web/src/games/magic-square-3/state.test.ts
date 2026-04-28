import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isMagic, TARGET } from "./state.js";
const S = { dummy: false };
describe("MagicSquare3", () => {
  it("starts with empty grid and full pool", () => {
    const s = initialState(1, S);
    expect(s.cells.every(v => v === 0)).toBe(true);
    expect(s.pool.length).toBe(9);
  });
  it("pick + place moves number to grid", () => {
    let s = initialState(1, S);
    s = reducer(s, { type:"pick", value: 5 });
    s = reducer(s, { type:"place", index: 4 });
    expect(s.cells[4]).toBe(5);
    expect(s.pool).not.toContain(5);
    expect(s.moves).toBe(1);
  });
  it("isMagic detects a valid 15-sum square", () => {
    // standard Lo Shu square
    const valid = [2,7,6,9,5,1,4,3,8];
    expect(isMagic(valid)).toBe(true);
    expect(TARGET).toBe(15);
  });
  it("placing the Lo Shu solution ends game", () => {
    let s = initialState(1, S);
    const layout: [number, number][] = [[0,2],[1,7],[2,6],[3,9],[4,5],[5,1],[6,4],[7,3],[8,8]];
    for (const [idx, val] of layout) {
      s = reducer(s, { type:"pick", value: val });
      s = reducer(s, { type:"place", index: idx });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
