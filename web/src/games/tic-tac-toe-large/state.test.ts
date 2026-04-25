import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWinner } from "./state.js";
const s0=()=>initialState(1,{aiStrength:"easy"});
describe("TicTacToeLarge",()=>{
  it("starts with empty 25-cell board",()=>{const s=s0();expect(s.board.length).toBe(25);expect(s.board.every(c=>c===null)).toBe(true);});
  it("starts in playing phase",()=>{expect(s0().phase).toBe("playing");});
  it("is deterministic",()=>{expect(initialState(5,{aiStrength:"easy"}).board).toEqual(initialState(5,{aiStrength:"easy"}).board);});
  it("move places X and AI responds",()=>{const s=reducer(s0(),{type:"move",index:0});expect(s.board[0]).toBe("X");expect(s.board.filter(c=>c==="O").length).toBe(1);});
  it("checkWinner detects 4-in-a-row",()=>{const b=Array(25).fill(null);b[0]=b[1]=b[2]=b[3]="X";expect(checkWinner(b as any)).toBe("X");});
  it("checkWinner returns null for no winner",()=>{expect(checkWinner(Array(25).fill(null) as any)).toBeNull();});
  it("isTerminal null during play",()=>{expect(isTerminal(s0())).toBeNull();});
  it("isTerminal scores win at 100",()=>{
    const s={...s0(),winner:"X" as const,phase:"gameover" as const};
    expect(isTerminal(s)!.score).toBe(100);
  });
});
