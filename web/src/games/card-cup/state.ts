import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 12;
export interface CardCupSettings { dummy: boolean; }
export interface CardCupState { rngSeed:number; round:number; card:number|null; pick:"low"|"mid"|"high"|null; score:number; phase:"choose"|"result"|"done"; lastWin:boolean; }
export type CardCupAction = { type:"pick"; cup:"low"|"mid"|"high" } | { type:"next" };
export function cardName(c:number):string { const r=["2","3","4","5","6","7","8","9","10","J","Q","K","A"]; const s=["♠","♥","♦","♣"]; return r[c%13]!+s[Math.floor(c/13)]!; }
export function isRed(c:number):boolean { const s=Math.floor(c/13); return s===1||s===2; }
export function rankOf(c:number):number { return c%13; }
export function initialState(seed:number,_s:CardCupSettings):CardCupState { return { rngSeed:seed, round:1, card:null, pick:null, score:0, phase:"choose", lastWin:false }; }
export function reducer(state:CardCupState, action:CardCupAction):CardCupState {
  if(state.phase==="done")return state;
  if(action.type==="pick"){
    if(state.phase!=="choose")return state;
    const rng=mulberry32(state.rngSeed);
    const card=Math.floor(rng()*52);
    const ns=Math.floor(rng()*2**31);
    const r=rankOf(card);
    const cup=r<=3?"low":r<=8?"mid":"high";
    const win=action.cup===cup;
    const last=state.round>=TOTAL_ROUNDS;
    return { ...state, rngSeed:ns, card, pick:action.cup, score:state.score+(win?20:0), lastWin:win, phase:last?"done":"result" };
  }
  if(action.type==="next"){ if(state.phase!=="result")return state; return { ...state, round:state.round+1, card:null, pick:null, phase:"choose", lastWin:false }; }
  return state;
}
export function isTerminal(state:CardCupState){ return state.phase==="done"?{score:state.score}:null; }
