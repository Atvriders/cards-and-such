import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, moveDests, initialBoard, applyJanggiMove, isInCheck } from "./state.js";
import type { JanggiBoard, JanggiPiece } from "./state.js";

const COLS = 9;
function idx(r: number, c: number) { return r * COLS + c; }
function emptyBoard(): JanggiBoard { return new Array(90).fill(null); }
function p(color: JanggiPiece["color"], type: JanggiPiece["type"]): JanggiPiece { return { color, type }; }

describe("Janggi", () => {
  it("initial board has generals in palaces", () => {
    const b = initialBoard();
    expect(b[idx(9,4)]).toEqual({ color:"blue", type:"general" });
    expect(b[idx(0,4)]).toEqual({ color:"red", type:"general" });
  });

  it("soldier moves forward and sideways", () => {
    const b = emptyBoard();
    b[idx(5,4)] = p("blue","soldier");
    const dests = moveDests(b, 5, 4);
    expect(dests).toContain(idx(4,4)); // forward
    expect(dests).toContain(idx(5,3)); // sideways
    expect(dests).toContain(idx(5,5)); // sideways
  });

  it("cannon cannot jump another cannon", () => {
    const b = emptyBoard();
    b[idx(9,4)] = p("blue","general");
    b[idx(0,4)] = p("red","general");
    b[idx(5,0)] = p("blue","cannon");
    b[idx(5,4)] = p("blue","cannon"); // another cannon
    // Blue cannon at col 0 tries to jump cannon at col 4 to capture something beyond
    const dests = moveDests(b, 5, 0);
    // Should not be able to jump the other cannon
    expect(dests.every(d => {
      const dc = d % COLS;
      return dc <= 3; // can't go beyond the cannon at col 4 via jumping it
    })).toBe(true);
  });

  it("isInCheck detects chariot attack", () => {
    const b = emptyBoard();
    b[idx(9,4)] = p("blue","general");
    b[idx(5,4)] = p("red","chariot");
    expect(isInCheck(b,"blue")).toBe(true);
  });

  it("chariot slides orthogonally", () => {
    const b = emptyBoard();
    b[idx(5,4)] = p("blue","chariot");
    const dests = moveDests(b, 5, 4);
    expect(dests).toContain(idx(0,4));
    expect(dests).toContain(idx(9,4));
    expect(dests).toContain(idx(5,0));
    expect(dests).toContain(idx(5,8));
  });

  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(0,{}))).toBeNull();
  });

  it("isTerminal returns 100 for blue win", () => {
    const s = { ...initialState(0,{}), winner:"blue" as const };
    expect(isTerminal(s)).toEqual({ score:100 });
  });

  it("select blue piece shows targets", () => {
    const s = initialState(0,{});
    const next = reducer(s, { type:"select", sq:idx(7,1) }); // blue cannon
    expect(next.selected).toBe(idx(7,1));
    expect(next.legalTargets.length).toBeGreaterThan(0);
  });
});
