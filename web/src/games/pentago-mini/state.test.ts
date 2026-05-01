import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, rotateQuadrant, checkWin, SIZE } from "./state.js";

const S = { botStrength: "easy" as const };

describe("pentago-mini", () => {
  it("starts with empty 4×4 board, place phase", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("place");
    expect(s.board.length).toBe(SIZE * SIZE);
    expect(s.winner).toBeNull();
  });

  it("placing transitions to rotate phase", () => {
    const s0 = initialState(1, S);
    const s1 = reducer(s0, { type: "place", pos: 0 });
    expect(s1.phase).toBe("rotate");
    expect(s1.board[0]).toBe(0);
    expect(s1.lastPlaced).toBe(0);
  });

  it("rotateQuadrant rotates correctly (CW)", () => {
    const b = new Array(SIZE * SIZE).fill(null);
    b[0] = 0; // (0,0)
    b[1] = 1; // (0,1)
    // CW rotation of TL quadrant: (0,0)→(0,1); (0,1)→(1,1); (1,1)→(1,0); (1,0)→(0,0)
    const r = rotateQuadrant(b, 0, "cw");
    expect(r[1]).toBe(0); // 0,0 -> 0,1
    expect(r[1 * SIZE + 1]).toBe(1); // 0,1 -> 1,1
  });

  it("checkWin detects 4-in-a-row on row 0", () => {
    const b = new Array(SIZE * SIZE).fill(null);
    for (let c = 0; c < 4; c++) b[c] = 0;
    expect(checkWin(b)).toBe(0);
  });

  it("isTerminal null while in progress", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});
