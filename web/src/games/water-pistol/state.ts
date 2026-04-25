import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Water Pistol: moving targets, spray them by clicking. Time-limited game.
export interface WaterPistolSettings { duration: "30"|"60" }
export interface WaterTarget { id:number; x:number; y:number; soaked:boolean; }
export interface WaterPistolState {
  rngSeed: number; targets: WaterTarget[];
  score: number; shots: number; timeLeft: number; maxTime: number;
  nextId: number; phase: "playing"|"gameover";
}
export type WaterPistolAction = { type:"spray"; x:number; y:number } | { type:"tick" };
function mkTargets(seed: number, count: number): { targets: WaterTarget[]; ns: number } {
  const rng=mulberry32(seed);
  const targets=Array.from({length:count},(_,i)=>({id:i,x:0.1+rng()*0.8,y:0.1+rng()*0.8,soaked:false}));
  return { targets, ns:Math.floor(rng()*2**31) };
}
export function initialState(seed: number, settings: WaterPistolSettings): WaterPistolState {
  const maxTime=parseInt(settings.duration,10)*10; // ticks
  const { targets, ns }=mkTargets(seed,8);
  return { rngSeed:ns, targets, score:0, shots:0, timeLeft:maxTime, maxTime, nextId:8, phase:"playing" };
}
export function reducer(state: WaterPistolState, action: WaterPistolAction): WaterPistolState {
  if(state.phase==="gameover") return state;
  switch(action.type){
    case "spray": {
      const { x, y }=action;
      let scoreAdd=0;
      const targets=state.targets.map(t=>{
        if(t.soaked) return t;
        const dx=x-t.x;const dy=y-t.y;
        if(Math.sqrt(dx*dx+dy*dy)<0.08){scoreAdd+=50;return {...t,soaked:true};}
        return t;
      });
      // respawn soaked targets
      const rng=mulberry32(state.rngSeed);
      const newTargets=targets.map(t=>{
        if(!t.soaked) return t;
        return {id:t.id,x:0.1+rng()*0.8,y:0.1+rng()*0.8,soaked:false};
      });
      const ns=Math.floor(rng()*2**31);
      return {...state,rngSeed:ns,targets:newTargets,score:state.score+scoreAdd,shots:state.shots+1};
    }
    case "tick": {
      const timeLeft=state.timeLeft-1;
      if(timeLeft<=0) return {...state,timeLeft:0,phase:"gameover"};
      return {...state,timeLeft};
    }
    default: return state;
  }
}
export function isTerminal(state: WaterPistolState): { score:number }|null { return state.phase==="gameover"?{score:state.score}:null; }
