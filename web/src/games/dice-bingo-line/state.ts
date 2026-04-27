import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROLLS = 25;
export const LINE_SIZE = 5;
export interface DiceBingoLineSettings { dummy: boolean; }
export interface DiceBingoLineState { rngSeed:number; rolls:number; line:boolean[]; lastRoll:number|null; score:number; phase:"playing"|"done"; bingo:boolean; }
export type DiceBingoLineAction = { type:"roll" };
export function initialState(seed:number,_s:DiceBingoLineSettings):DiceBingoLineState {
  return { rngSeed:seed, rolls:0, line:[false,false,false,false,false], lastRoll:null, score:0, phase:"playing", bingo:false };
}
export function reducer(state:DiceBingoLineState, action:DiceBingoLineAction):DiceBingoLineState {
  if (state.phase==="done") return state;
  if (action.type==="roll") {
    const rng=mulberry32(state.rngSeed);
    const d=1+Math.floor(rng()*6); // 1..6
    const nextSeed=Math.floor(rng()*2**31);
    const newLine=[...state.line];
    let pts=0;
    if (d>=1 && d<=5 && !newLine[d-1]) { newLine[d-1]=true; pts=10; }
    const filled=newLine.every(Boolean);
    let bingo=state.bingo;
    if (filled && !bingo) { bingo=true; pts+=100; }
    const rolls=state.rolls+1;
    const phase: "playing"|"done" = (rolls>=TOTAL_ROLLS||bingo)?"done":"playing";
    return { ...state, rngSeed:nextSeed, rolls, line:newLine, lastRoll:d, score:state.score+pts, phase, bingo };
  }
  return state;
}
export function isTerminal(state:DiceBingoLineState):{score:number}|null { return state.phase==="done"?{score:state.score}:null; }
