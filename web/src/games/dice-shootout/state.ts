import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TARGET = 100;
export interface DiceShootoutSettings { dummy: boolean; }
export interface DiceShootoutState { rngSeed:number; player:number; ai:number; lastP:number|null; lastA:number|null; lastResult:""|"player"|"ai"|"tie"; phase:"playing"|"done"; winner:""|"player"|"ai"; }
export type DiceShootoutAction = { type:"roll" };
export function initialState(seed:number,_s:DiceShootoutSettings):DiceShootoutState {
  return { rngSeed:seed, player:0, ai:0, lastP:null, lastA:null, lastResult:"", phase:"playing", winner:"" };
}
export function reducer(state:DiceShootoutState, action:DiceShootoutAction):DiceShootoutState {
  if (state.phase==="done") return state;
  if (action.type==="roll") {
    const rng=mulberry32(state.rngSeed);
    const p=1+Math.floor(rng()*6);
    const a=1+Math.floor(rng()*6);
    const nextSeed=Math.floor(rng()*2**31);
    let player=state.player; let ai=state.ai;
    let result:"player"|"ai"|"tie"="tie";
    if (p>a) { player+=p; result="player"; }
    else if (a>p) { ai+=a; result="ai"; }
    let phase: "playing"|"done" = "playing"; let winner: ""|"player"|"ai" = "";
    if (player>=TARGET) { phase="done"; winner="player"; }
    else if (ai>=TARGET) { phase="done"; winner="ai"; }
    return { ...state, rngSeed:nextSeed, player, ai, lastP:p, lastA:a, lastResult:result, phase, winner };
  }
  return state;
}
export function isTerminal(state:DiceShootoutState):{score:number}|null { return state.phase==="done"?{score: state.winner==="player" ? 100 + state.player : state.player }:null; }
