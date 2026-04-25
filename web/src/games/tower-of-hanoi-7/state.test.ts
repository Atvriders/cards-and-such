import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, MIN_MOVES } from "./state.js";
import type { TowerOfHanoi7Settings } from "./state.js";

const settings: TowerOfHanoi7Settings = { showHints: "no" };

describe("TowerOfHanoi7 initialState", () => {
  it("starts with 7 disks on peg 0", () => {
    const s = initialState(0, settings);
    expect(s.pegs[0]).toHaveLength(7);
    expect(s.pegs[1]).toHaveLength(0);
    expect(s.pegs[2]).toHaveLength(0);
  });

  it("disks are in descending order from bottom", () => {
    const s = initialState(0, settings);
    expect(s.pegs[0]).toEqual([7, 6, 5, 4, 3, 2, 1]);
  });

  it("starts with no selected peg and 0 moves", () => {
    const s = initialState(0, settings);
    expect(s.selectedPeg).toBeNull();
    expect(s.moves).toBe(0);
    expect(s.won).toBe(false);
  });

  it("MIN_MOVES is 127", () => {
    expect(MIN_MOVES).toBe(127);
  });
});

describe("TowerOfHanoi7 reducer", () => {
  it("select sets selectedPeg", () => {
    const s = initialState(0, settings);
    const s2 = reducer(s, { type: "select", peg: 0 });
    expect(s2.selectedPeg).toBe(0);
  });

  it("cannot select empty peg first", () => {
    const s = initialState(0, settings);
    const s2 = reducer(s, { type: "select", peg: 1 });
    expect(s2.selectedPeg).toBeNull();
  });

  it("legal move transfers top disk", () => {
    const s = initialState(0, settings);
    const s2 = reducer(s, { type: "select", peg: 0 });
    const s3 = reducer(s2, { type: "select", peg: 2 });
    expect(s3.pegs[2]).toHaveLength(1);
    expect(s3.pegs[0]).toHaveLength(6);
    expect(s3.moves).toBe(1);
  });

  it("illegal move (larger on smaller) is rejected", () => {
    let s = initialState(0, settings);
    // Move disk 1 to peg 1
    s = reducer(reducer(s, { type: "select", peg: 0 }), { type: "select", peg: 1 });
    // Now try to move top of peg 0 (disk 2) to peg 1 (has disk 1) — illegal
    s = reducer(reducer(s, { type: "select", peg: 0 }), { type: "select", peg: 1 });
    // peg 1 should still only have disk 1 (move rejected), selected cleared
    expect(s.pegs[1]).toHaveLength(1);
  });

  it("restart resets to initial state", () => {
    let s = initialState(0, settings);
    s = reducer(reducer(s, { type: "select", peg: 0 }), { type: "select", peg: 2 });
    const s2 = reducer(s, { type: "restart" });
    expect(s2.moves).toBe(0);
    expect(s2.pegs[0]).toHaveLength(7);
  });
});

describe("TowerOfHanoi7 isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(0, settings))).toBeNull();
  });

  it("returns score 100 when solved in exactly MIN_MOVES", () => {
    const s = { ...initialState(0, settings), won: true, moves: MIN_MOVES };
    expect(isTerminal(s)?.score).toBe(100);
  });

  it("score decreases with extra moves", () => {
    const s1 = { ...initialState(0, settings), won: true, moves: MIN_MOVES };
    const s2 = { ...initialState(0, settings), won: true, moves: MIN_MOVES + 10 };
    expect(isTerminal(s1)!.score).toBeGreaterThan(isTerminal(s2)!.score);
  });
});
