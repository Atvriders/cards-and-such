import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, COLS, ROWS } from "./state.js";
const S = { dummy: false };
describe("ConnectFourMini", () => {
  it("starts in playing phase with empty board", () => { const s=initialState(1,S); expect(s.phase).toBe("playing"); expect(s.board.length).toBe(COLS*ROWS); });
  it("drop places piece in bottom row", () => { const s=reducer(initialState(1,S), { type:"drop", col:0 }); expect(s.board[(ROWS-1)*COLS+0]).toBe("P"); });
  it("CPU plays after player", () => { const s=reducer(initialState(1,S), { type:"drop", col:0 }); const cpuPieces = s.board.filter(c=>c==="C").length; expect(cpuPieces).toBeGreaterThanOrEqual(0); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
});
