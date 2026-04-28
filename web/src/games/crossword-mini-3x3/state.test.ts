import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { dummy: false };
describe("CrosswordMini3x3", () => {
  it("starts with 9 empty cells and 3 clues each direction", () => {
    const s = initialState(1, S);
    expect(s.cells.length).toBe(9);
    expect(s.acrossClues.length).toBe(3);
    expect(s.downClues.length).toBe(3);
  });
  it("input fills cell and advances cursor", () => {
    let s = initialState(1, S);
    s = reducer(s, { type:"select", index: 0 });
    s = reducer(s, { type:"input", letter: s.solution[0]! });
    expect(s.cells[0]).toBe(s.solution[0]);
    expect(s.selected).toBe(1);
  });
  it("filling solution and check ends game", () => {
    let s = initialState(1, S);
    for (let i = 0; i < 9; i++) {
      s = reducer(s, { type:"select", index: i });
      s = reducer(s, { type:"input", letter: s.solution[i]! });
    }
    s = reducer(s, { type:"check" });
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("check on incomplete leaves phase playing", () => {
    const s = reducer(initialState(1, S), { type:"check" });
    expect(s.phase).toBe("playing");
  });
});
