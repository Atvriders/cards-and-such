import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TIMER_TICKS = 25;
export const LANES = 5;
export interface CircuitCapSettings { dummy: boolean; }
export interface Target { id:number; lane:number; ticksLeft:number; }
export interface CircuitCapState { rngSeed:number; targets:Target[]; nextId:number; ticksRemaining:number; score:number; popped:number; missed:number; phase:"playing"|"done"; }
export type CircuitCapAction = { type:"tick" } | { type:"pop"; id:number };
export function initialState(seed:number,_s:CircuitCapSettings):CircuitCapState { return { rngSeed:seed, targets:[], nextId:1, ticksRemaining:TIMER_TICKS, score:0, popped:0, missed:0, phase:"playing" }; }
export function reducer(state:CircuitCapState, action:CircuitCapAction):CircuitCapState {
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
export function isTerminal(state:CircuitCapState){ return state.phase==="done"?{score:state.score}:null; }
