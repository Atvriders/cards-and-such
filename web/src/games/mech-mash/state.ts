import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TIMER_TICKS = 30;
export const LANES = 5;
export interface MechMashSettings { dummy: boolean; }
export interface Target { id:number; lane:number; ticksLeft:number; }
export interface MechMashState { rngSeed:number; targets:Target[]; nextId:number; ticksRemaining:number; score:number; popped:number; missed:number; phase:"playing"|"done"; }
export type MechMashAction = { type:"tick" } | { type:"pop"; id:number };
export function initialState(seed:number,_s:MechMashSettings):MechMashState { return { rngSeed:seed, targets:[], nextId:1, ticksRemaining:TIMER_TICKS, score:0, popped:0, missed:0, phase:"playing" }; }
export function reducer(state:MechMashState, action:MechMashAction):MechMashState {
  if(state.phase==="done")return state;
  if(action.type==="pop"){
    const tg=state.targets.find(p=>p.id===action.id);
    if(!tg)return state;
    return { ...state, targets:state.targets.filter(p=>p.id!==action.id), score:state.score+12, popped:state.popped+1 };
  }
  if(action.type==="tick"){
    const rng=mulberry32(state.rngSeed);
    const ns=Math.floor(rng()*2**31);
    const aged=state.targets.map(p=>({...p,ticksLeft:p.ticksLeft-1}));
    const surv=aged.filter(p=>p.ticksLeft>0);
    const expired=aged.length-surv.length;
    const sc=1+Math.floor(rng()*2);
    let nid=state.nextId; const newTs:Target[]=[];
    for(let i=0;i<sc;i++) newTs.push({id:nid++, lane:Math.floor(rng()*LANES), ticksLeft:3+Math.floor(rng()*3)});
    const tr=state.ticksRemaining-1;
    const phase=tr<=0?"done":"playing";
    return { ...state, rngSeed:ns, targets:[...surv,...newTs], nextId:nid, ticksRemaining:tr, missed:state.missed+expired, phase };
  }
  return state;
}
export function isTerminal(state:MechMashState){ return state.phase==="done"?{score:state.score}:null; }
