import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Dunk Tank: target moves left-right, throw balls to hit it and dunk the person
export interface DunkTankSettings { balls: "5"|"10" }
export interface DunkTankState {
  rngSeed: number; targetX: number; targetVX: number; targetY: number;
  ballsLeft: number; score: number; dunks: number; throws: number;
  phase: "aiming"|"gameover";
}
export type DunkTankAction = { type:"throw"; x:number } | { type:"tick" };
const TARGET_W=0.12;
function nextTarget(seed: number): { x:number; vx:number; ns:number } {
  const rng=mulberry32(seed);
  const x=0.2+rng()*0.6;
  const vx=(rng()>0.5?1:-1)*(0.005+rng()*0.01);
  return { x, vx, ns:Math.floor(rng()*2**31) };
}
export function initialState(seed: number, settings: DunkTankSettings): DunkTankState {
  const { x, vx, ns }=nextTarget(seed);
  return { rngSeed:ns, targetX:x, targetVX:vx, targetY:0.3, ballsLeft:parseInt(settings.balls,10), score:0, dunks:0, throws:0, phase:"aiming" };
}
export function reducer(state: DunkTankState, action: DunkTankAction): DunkTankState {
  if(state.phase==="gameover") return state;
  switch(action.type){
    case "tick": {
      let x=state.targetX+state.targetVX;
      let vx=state.targetVX;
      if(x<0.1||x>0.9){vx=-vx;x=Math.max(0.1,Math.min(0.9,x));}
      return {...state,targetX:x,targetVX:vx};
    }
    case "throw": {
      const hit=Math.abs(action.x-state.targetX)<=TARGET_W/2;
      const dunks=state.dunks+(hit?1:0);
      const score=state.score+(hit?100+Math.floor((1-Math.abs(action.x-state.targetX)/(TARGET_W/2))*50):0);
      const ballsLeft=state.ballsLeft-1;
      if(ballsLeft<=0) return {...state,dunks,score,ballsLeft:0,throws:state.throws+1,phase:"gameover"};
      const { x, vx, ns }=nextTarget(state.rngSeed);
      return {...state,rngSeed:ns,targetX:x,targetVX:vx,dunks,score,ballsLeft,throws:state.throws+1};
    }
    default: return state;
  }
}
export function isTerminal(state: DunkTankState): { score:number }|null { return state.phase==="gameover"?{score:state.score}:null; }
