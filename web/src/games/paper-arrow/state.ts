import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Paper Arrow: click to launch paper arrows at moving targets on a line
export interface PaperArrowSettings { arrows: "10"|"20" }
export interface PaperArrowState {
  rngSeed: number; targetX: number; targetVX: number;
  arrowsLeft: number; score: number; hits: number; throws: number;
  phase: "aiming"|"gameover"; lastHit: boolean;
}
export type PaperArrowAction = { type:"shoot"; x:number };
function nextTarget(seed: number): { x:number; vx:number; ns:number } {
  const rng=mulberry32(seed);
  const x=0.15+rng()*0.7;
  const vx=(rng()>0.5?1:-1)*(0.008+rng()*0.012);
  return { x, vx, ns:Math.floor(rng()*2**31) };
}
export function initialState(seed: number, settings: PaperArrowSettings): PaperArrowState {
  const { x, vx, ns }=nextTarget(seed);
  return { rngSeed:ns, targetX:x, targetVX:vx, arrowsLeft:parseInt(settings.arrows,10), score:0, hits:0, throws:0, phase:"aiming", lastHit:false };
}
export function reducer(state: PaperArrowState, action: PaperArrowAction): PaperArrowState {
  if(state.phase==="gameover") return state;
  if(action.type==="shoot") {
    const hit=Math.abs(action.x-state.targetX)<0.06;
    const pts=hit?100+Math.floor((1-Math.abs(action.x-state.targetX)/0.06)*50):0;
    const arrowsLeft=state.arrowsLeft-1;
    const { x, vx, ns }=nextTarget(state.rngSeed);
    return {...state,rngSeed:ns,targetX:x,targetVX:vx,arrowsLeft,score:state.score+pts,hits:state.hits+(hit?1:0),throws:state.throws+1,lastHit:hit,phase:arrowsLeft<=0?"gameover":"aiming"};
  }
  return state;
}
export function isTerminal(state: PaperArrowState): { score:number }|null { return state.phase==="gameover"?{score:state.score}:null; }
