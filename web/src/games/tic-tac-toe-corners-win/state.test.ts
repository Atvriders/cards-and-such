import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkCornersWinner } from "./state.js";
const s0=()=>initialState(1,{aiStrength:"easy"});
describe("TicTacToeCornersWin",()=>{
  it("starts with 9 empty cells",()=>{expect(s0().board.every(c=>c===null)).toBe(true);});
  it("starts playing",()=>{expect(s0().phase).toBe("playing");});
  it("is deterministic",()=>{expect(initialState(3,{aiStrength:"easy"}).rngSeed).toBe(initialState(3,{aiStrength:"easy"}).rngSeed);});
  it("move places X",()=>{expect(reducer(s0(),{type:"move",index:0}).board[0]).toBe("X");});
  it("checkCornersWinner detects 3 corners",()=>{const b=Array(9).fill(null);b[0]=b[2]=b[6]="X";expect(checkCornersWinner(b as any)).toBe("X");});
  it("checkCornersWinner returns null with 2 corners",()=>{const b=Array(9).fill(null);b[0]=b[2]="X";expect(checkCornersWinner(b as any)).toBeNull();});
  it("isTerminal null during play",()=>{expect(isTerminal(s0())).toBeNull();});
  it("win scores 100",()=>{const s={...s0(),winner:"X" as const,phase:"gameover" as const};expect(isTerminal(s)!.score).toBe(100);});
});
