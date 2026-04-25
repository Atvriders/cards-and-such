import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Ring Toss Pro: toss rings onto pegs. Aim for the center peg for max points.
export interface RingTossProSettings { rings: "5"|"10" }
export interface Peg { id:number; x:number; y:number; points:number; }
export interface RingTossProState {
  rngSeed: number; pegs: Peg[]; ringsLeft: number; score: number;
  lastLanded: number|null; phase: "aiming"|"gameover";
}
export type RingTossProAction = { type:"toss"; x:number; y:number };
const RING_RADIUS=0.065;
function mkPegs(): Peg[] {
  return [
    {id:0,x:0.5,y:0.5,points:500},  // center - jackpot
    {id:1,x:0.25,y:0.3,points:200},{id:2,x:0.75,y:0.3,points:200},
    {id:3,x:0.25,y:0.7,points:200},{id:4,x:0.75,y:0.7,points:200},
    {id:5,x:0.15,y:0.5,points:100},{id:6,x:0.85,y:0.5,points:100},
    {id:7,x:0.5,y:0.15,points:100},{id:8,x:0.5,y:0.85,points:100},
  ];
}
export function initialState(seed: number, settings: RingTossProSettings): RingTossProState {
  return { rngSeed:seed, pegs:mkPegs(), ringsLeft:parseInt(settings.rings,10), score:0, lastLanded:null, phase:"aiming" };
}
export function reducer(state: RingTossProState, action: RingTossProAction): RingTossProState {
  if(state.phase==="gameover") return state;
  if(action.type==="toss") {
    // add random jitter from rng
    const rng=mulberry32(state.rngSeed);
    const jx=(rng()-0.5)*0.08; const jy=(rng()-0.5)*0.08;
    const nx=Math.max(0,Math.min(1,action.x+jx));
    const ny=Math.max(0,Math.min(1,action.y+jy));
    const ns=Math.floor(rng()*2**31);
    // find best peg hit
    let best: Peg|null=null;let bestDist=Infinity;
    for(const peg of state.pegs){
      const d=Math.sqrt((nx-peg.x)**2+(ny-peg.y)**2);
      if(d<=RING_RADIUS&&d<bestDist){best=peg;bestDist=d;}
    }
    const ringsLeft=state.ringsLeft-1;
    return {...state,rngSeed:ns,score:state.score+(best?.points??0),lastLanded:best?.id??null,ringsLeft,phase:ringsLeft<=0?"gameover":"aiming"};
  }
  return state;
}
export function isTerminal(state: RingTossProState): { score:number }|null { return state.phase==="gameover"?{score:state.score}:null; }
