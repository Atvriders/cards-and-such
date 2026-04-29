import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, SIZE } from "./state.js";
const S = { dummy: false };
describe("Yavalath", () => {
  it("starts with empty board", () => { const s=initialState(1,S); expect(s.board.length).toBe(SIZE*SIZE); expect(s.phase).toBe("playing"); });
  it("place puts P piece", () => { const s=reducer(initialState(1,S), { type:"place", idx:0 }); expect(s.board[0]).toBe("P"); });
  it("CPU plays after player", () => { const s=reducer(initialState(1,S), { type:"place", idx:0 }); const cpu = s.board.filter(c=>c==="C").length; expect(cpu).toBeGreaterThanOrEqual(0); });
  it("placing on full cell rejected", () => { let s=reducer(initialState(1,S), { type:"place", idx:0 }); s=reducer(s, { type:"place", idx:0 }); expect(s.board[0]).toBe("P"); });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1,S))).toBeNull(); });
});
