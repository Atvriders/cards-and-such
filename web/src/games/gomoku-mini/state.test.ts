import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, check5 } from "./state.js";
const s0=()=>initialState(1,{aiStrength:"easy"});
describe("GomokuMini",()=>{
  it("starts with 81 cells",()=>{expect(s0().board.length).toBe(81);});
  it("starts playing",()=>{expect(s0().phase).toBe("playing");});
  it("is deterministic",()=>{expect(initialState(9,{aiStrength:"easy"}).rngSeed).toBe(initialState(9,{aiStrength:"easy"}).rngSeed);});
  it("move places X",()=>{expect(reducer(s0(),{type:"move",index:0}).board[0]).toBe("X");});
  it("check5 detects 5-in-a-row",()=>{const b=Array(81).fill(null);b[0]=b[1]=b[2]=b[3]=b[4]="X";expect(check5(b as any)).toBe("X");});
  it("check5 null for 4-in-a-row",()=>{const b=Array(81).fill(null);b[0]=b[1]=b[2]=b[3]="X";expect(check5(b as any)).toBeNull();});
  it("isTerminal null during play",()=>{expect(isTerminal(s0())).toBeNull();});
  it("win scores 100",()=>{const s={...s0(),winner:"X" as const,phase:"gameover" as const};expect(isTerminal(s)!.score).toBe(100);});
});
