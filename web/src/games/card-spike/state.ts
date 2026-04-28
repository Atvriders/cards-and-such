import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 12;
export interface CardSpikeSettings { dummy: boolean; }
export interface CardSpikeState { rngSeed:number; round:number; targetRank:number; card:number|null; score:number; phase:"draw"|"result"|"done"; lastWin:boolean; }
export type CardSpikeAction = { type:"draw" } | { type:"next" };
export function cardName(c:number):string { const r=["2","3","4","5","6","7","8","9","10","J","Q","K","A"]; const s=["♠","♥","♦","♣"]; return r[c%13]!+s[Math.floor(c/13)]!; }
export function isRed(c:number):boolean { const s=Math.floor(c/13); return s===1||s===2; }
export function rankOf(c:number):number { return c%13; }
export function rankName(r:number):string { return ["2","3","4","5","6","7","8","9","10","J","Q","K","A"][r]!; }
export function initialState(seed:number,_s:CardSpikeSettings):CardSpikeState { const rng=mulberry32(seed); const tr=Math.floor(rng()*13); return { rngSeed:Math.floor(rng()*2**31), round:1, targetRank:tr, card:null, score:0, phase:"draw", lastWin:false }; }
export function reducer(state:CardSpikeState, action:CardSpikeAction):CardSpikeState {
  if(state.phase==="done")return state;
  if(action.type==="draw"){
    if(state.phase!=="draw")return state;
    const rng=mulberry32(state.rngSeed);
    const card=Math.floor(rng()*52);
    const ns=Math.floor(rng()*2**31);
    const win=rankOf(card)===state.targetRank;
    const last=state.round>=TOTAL_ROUNDS;
    return { ...state, rngSeed:ns, card, score:state.score+(win?25:0), lastWin:win, phase:last?"done":"result" };
  }
  if(action.type==="next"){ if(state.phase!=="result")return state; const rng=mulberry32(state.rngSeed); const tr=Math.floor(rng()*13); return { ...state, rngSeed:Math.floor(rng()*2**31), round:state.round+1, targetRank:tr, card:null, phase:"draw", lastWin:false }; }
  return state;
}
export function isTerminal(state:CardSpikeState){ return state.phase==="done"?{score:state.score}:null; }
