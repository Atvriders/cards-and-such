import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("Nonogram3x3", () => {
  it("starts with 9 empty cells and clue arrays of length 3", () => {
    const s = initialState(1, S);
    expect(s.cells.length).toBe(9);
    expect(s.rowClues.length).toBe(3);
    expect(s.colClues.length).toBe(3);
    expect(s.cells.every(c => !c)).toBe(true);
  });
  it("toggle flips cell and increments moves", () => {
    const s = reducer(initialState(1, S), { type:"toggle", index: 4 });
    expect(s.cells[4]).toBe(true);
    expect(s.moves).toBe(1);
  });
  it("check on incomplete leaves phase playing", () => {
    const s = reducer(initialState(1, S), { type:"check" });
    expect(s.phase).toBe("playing");
  });
  it("solve via toggling solution and check ends game", () => {
    let s = initialState(1, S);
    for (let i = 0; i < 9; i++) if (s.solution[i]) s = reducer(s, { type:"toggle", index: i });
    s = reducer(s, { type:"check" });
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
