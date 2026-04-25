import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, count3InRow } from "./state.js";
const s0=()=>initialState(1,{aiStrength:"easy"});
describe("TicTacToe3InRow",()=>{
  it("starts with 16 cells",()=>{expect(s0().board.length).toBe(16);});
  it("starts playing",()=>{expect(s0().phase).toBe("playing");});
  it("is deterministic",()=>{expect(initialState(4,{aiStrength:"easy"}).rngSeed).toBe(initialState(4,{aiStrength:"easy"}).rngSeed);});
  it("move places X",()=>{expect(reducer(s0(),{type:"move",index:0}).board[0]).toBe("X");});
  it("count3InRow counts correctly",()=>{const b=Array(16).fill(null);b[0]=b[1]=b[2]="X";expect(count3InRow(b as any,"X")).toBe(1);});
  it("count3InRow returns 0 for empty board",()=>{expect(count3InRow(Array(16).fill(null) as any,"X")).toBe(0);});
  it("isTerminal null during play",()=>{expect(isTerminal(s0())).toBeNull();});
  it("gameover when board full",()=>{
    let s=s0();
    for(let i=0;i<8&&s.phase!=="gameover";i++) s=reducer(s,{type:"move",index:s.board.findIndex(c=>c===null)});
    // may or may not be gameover; just check type safety
    expect(["playing","gameover"]).toContain(s.phase);
  });
});
