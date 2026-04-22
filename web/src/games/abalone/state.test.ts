import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, tryMove, hexKey, onBoard, HEX_DIRS } from "./state.js";
import type { AbaloneState } from "./state.js";

describe("Abalone", () => {
  it("starts with 14 black and 14 white marbles, human to move", () => {
    const s = initialState(0, { startPosition: "standard" });
    expect(s.turn).toBe(0);
    expect(s.winner).toBeNull();
    let black = 0;
    let white = 0;
    for (const v of s.board.values()) {
      if (v === 0) black++;
      else if (v === 1) white++;
    }
    expect(black).toBe(14);
    expect(white).toBe(14);
    expect(s.pushed).toEqual([0, 0]);
  });

  it("onBoard returns true for valid hex coords and false for out-of-range", () => {
    expect(onBoard(0, 0)).toBe(true);
    expect(onBoard(4, 0)).toBe(true);
    expect(onBoard(-4, 0)).toBe(true);
    expect(onBoard(4, 4)).toBe(false); // |q+r|=8 > 4
    expect(onBoard(5, 0)).toBe(false);
  });

  it("selecting a black marble adds it to selected", () => {
    const s = initialState(0, { startPosition: "standard" });
    // Find a black marble
    let bq = 0, br = 0;
    for (const [key, v] of s.board.entries()) {
      if (v === 0) {
        const parts = key.split(",").map(Number);
        bq = parts[0]!;
        br = parts[1]!;
        break;
      }
    }
    const s1 = reducer(s, { type: "select", coord: { q: bq, r: br } });
    expect(s1.selected).toHaveLength(1);
    expect(s1.selected[0]).toEqual({ q: bq, r: br });
  });

  it("tryMove allows single marble inline move to empty cell", () => {
    const s = initialState(0, { startPosition: "standard" });
    // Find a black marble that has an empty neighbor
    for (const [key, v] of s.board.entries()) {
      if (v !== 0) continue;
      const [q, r] = key.split(",").map(Number);
      for (let dir = 0; dir < 6; dir++) {
        const d = HEX_DIRS[dir]!;
        const nq = q! + d.q;
        const nr = r! + d.r;
        if (!onBoard(nq, nr)) continue;
        const neighborCell = s.board.get(hexKey(nq, nr));
        if (neighborCell === null) {
          const result = tryMove(s.board, [{ q: q!, r: r! }], dir, 0);
          expect(result.ok).toBe(true);
          expect(result.newBoard?.get(hexKey(nq, nr))).toBe(0);
          expect(result.newBoard?.get(hexKey(q!, r!))).toBeNull();
          return;
        }
      }
    }
  });

  it("push attempt: 2 vs 1 is legal", () => {
    // Set up: two black marbles pushing one white marble off
    const s = initialState(0, { startPosition: "standard" });
    // Manually create a simple scenario
    const board = new Map<string, 0 | 1 | null>();
    for (let q = -4; q <= 4; q++) {
      for (let r = -4; r <= 4; r++) {
        if (onBoard(q, r)) board.set(hexKey(q, r), null);
      }
    }
    board.set(hexKey(0, 0), 0); // black 1
    board.set(hexKey(1, 0), 0); // black 2
    board.set(hexKey(2, 0), 1); // white marble
    // Push direction: dir 0 = q+1
    const result = tryMove(board, [{ q: 0, r: 0 }, { q: 1, r: 0 }], 0, 0);
    expect(result.ok).toBe(true);
  });

  it("isTerminal null mid-game, correct scores on win/loss", () => {
    const s = initialState(0, { startPosition: "standard" });
    expect(isTerminal(s)).toBeNull();
    const won: AbaloneState = { ...s, winner: 0 };
    expect(isTerminal(won)).toEqual({ score: 100 });
    const lost: AbaloneState = { ...s, winner: 1 };
    expect(isTerminal(lost)).toEqual({ score: 0 });
  });
});
