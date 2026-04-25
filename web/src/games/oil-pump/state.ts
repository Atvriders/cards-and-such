import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface OilPumpSettings { rounds: "5" | "10" | "15"; }
export interface OilPumpState { settings:OilPumpSettings; rng:()=>number; target:number; current:number; score:number; round:number; totalRounds:number; feedback:string; phase:"playing"|"gameover"; }
export type OilPumpAction = { type:"tap" };
export function initialState(seed:number, settings:OilPumpSettings):OilPumpState {
  const rng=mulberry32(seed); const target=Math.floor(rng()*6)+3;
  return { settings,rng,target,current:0,score:0,round:1,totalRounds:parseInt(settings.rounds,10),feedback:"",phase:"playing" };
}
export function reducer(state:OilPumpState, action:OilPumpAction):OilPumpState {
  if(state.phase==="gameover") return state;
  if(action.type!=="tap") return state;
  const current=state.current+1;
  if(current<state.target) return {...state,current,feedback:`${current}/${state.target}`};
  const pts=10;
  const nextRound=state.round+1;
  const rng=state.rng; const target=Math.floor(rng()*6)+3;
  if(nextRound>state.totalRounds) return {...state,score:state.score+pts,phase:"gameover",feedback:"Done!"};
  return {...state,rng,target,current:0,score:state.score+pts,round:nextRound,feedback:`+${pts}`};
}
export function isTerminal(s:OilPumpState):{score:number}|null { return s.phase==="gameover"?{score:s.score}:null; }
