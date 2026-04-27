import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 8;
export type Category = "ones"|"twos"|"threes"|"fours"|"fives"|"sixes"|"highest"|"sumAll";
const ORDER: Category[] = ["ones","twos","threes","fours","fives","sixes","highest","sumAll"];
export interface DiceTallySettings { dummy: boolean; }
export interface DiceTallyState { rngSeed:number; round:number; dice:number[]; category:Category|null; lastPts:number; score:number; phase:"rolling"|"scored"|"done"; }
export type DiceTallyAction = { type:"roll" } | { type:"score" } | { type:"next" };
function categoryFor(round:number): Category { return ORDER[Math.min(ORDER.length-1, round-1)]!; }
function scoreFor(dice:number[], cat:Category): number {
  if (cat==="ones") return dice.filter(d=>d===1).reduce((a,b)=>a+b,0);
  if (cat==="twos") return dice.filter(d=>d===2).reduce((a,b)=>a+b,0);
  if (cat==="threes") return dice.filter(d=>d===3).reduce((a,b)=>a+b,0);
  if (cat==="fours") return dice.filter(d=>d===4).reduce((a,b)=>a+b,0);
  if (cat==="fives") return dice.filter(d=>d===5).reduce((a,b)=>a+b,0);
  if (cat==="sixes") return dice.filter(d=>d===6).reduce((a,b)=>a+b,0);
  if (cat==="highest") return Math.max(...dice);
  return dice.reduce((a,b)=>a+b,0);
}
export function initialState(seed:number,_s:DiceTallySettings):DiceTallyState {
  return { rngSeed:seed, round:1, dice:[], category:null, lastPts:0, score:0, phase:"rolling" };
}
export function reducer(state:DiceTallyState, action:DiceTallyAction):DiceTallyState {
  if (state.phase==="done") return state;
  if (action.type==="roll") {
    if (state.phase!=="rolling") return state;
    const rng=mulberry32(state.rngSeed);
    const dice=[0,0,0,0,0].map(()=>1+Math.floor(rng()*6));
    const nextSeed=Math.floor(rng()*2**31);
    const cat=categoryFor(state.round);
    const pts=scoreFor(dice,cat);
    return { ...state, rngSeed:nextSeed, dice, category:cat, lastPts:pts, score:state.score+pts, phase:"scored" };
  }
  if (action.type==="next" || action.type==="score") {
    if (state.phase!=="scored") return state;
    const isLast=state.round>=TOTAL_ROUNDS;
    if (isLast) return { ...state, phase:"done" };
    return { ...state, round:state.round+1, dice:[], category:null, lastPts:0, phase:"rolling" };
  }
  return state;
}
export function isTerminal(state:DiceTallyState):{score:number}|null { return state.phase==="done"?{score:state.score}:null; }
