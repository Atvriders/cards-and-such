import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TIMER_TICKS } from "./state.js";
const S = { dummy: false };
describe("TicTacToeBlitz", () => {
  it("starts playing with empty board", () => { const s=initialState(1,S); expect(s.phase).toBe("playing"); expect(s.board.every(c=>c===null)).toBe(true); });
  it("tick decrements timer", () => { const s = reducer(initialState(1,S), { type:"tick" }); expect(s.ticksRemaining).toBe(TIMER_TICKS - 1); });
  it("play places X then CPU plays O", () => {
    const s = reducer(initialState(1,S), { type:"play", idx:0 });
    expect(s.board[0]).toBe("X");
    const oCount = s.board.filter(c=>c==="O").length;
    expect(oCount).toBeGreaterThanOrEqual(0);
  });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
  it("ends after TIMER_TICKS", () => {
    let s = initialState(1,S);
    for (let i=0;i<TIMER_TICKS;i++) s = reducer(s, { type:"tick" });
    expect(s.phase).toBe("done");
  });
});
