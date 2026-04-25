import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Balloon Darts: balloons at random positions, throw darts at them (click-aim game)
export interface BalloonDartsSettings { darts: "5"|"10" }
export interface Balloon { id:number; x:number; y:number; radius:number; popped:boolean; }
export interface BalloonDartsState {
  rngSeed: number; balloons: Balloon[];
  dartsLeft: number; maxDarts: number; score: number;
  phase: "aiming"|"gameover";
}
export type BalloonDartsAction = { type:"throw"; x:number; y:number };

function mkBalloons(seed: number, count: number): { balloons: Balloon[]; nextSeed: number } {
  const rng=mulberry32(seed);
  const balloons: Balloon[]=[];
  for(let i=0;i<count;i++){
    balloons.push({ id:i, x:0.1+rng()*0.8, y:0.1+rng()*0.75, radius:0.06+rng()*0.04, popped:false });
  }
  return { balloons, nextSeed:Math.floor(rng()*2**31) };
}

export function initialState(seed: number, settings: BalloonDartsSettings): BalloonDartsState {
  const maxDarts=parseInt(settings.darts,10);
  const { balloons, nextSeed }=mkBalloons(seed,12);
  return { rngSeed:nextSeed, balloons, dartsLeft:maxDarts, maxDarts, score:0, phase:"aiming" };
}

export function reducer(state: BalloonDartsState, action: BalloonDartsAction): BalloonDartsState {
  if(state.phase==="gameover") return state;
  if(action.type==="throw") {
    const { x, y }=action;
    let scoreAdd=0;
    const balloons=state.balloons.map(b=>{
      if(b.popped) return b;
      const dx=x-b.x;const dy=y-b.y;
      const dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<=b.radius){ scoreAdd+=100+Math.floor((1-dist/b.radius)*50); return {...b,popped:true}; }
      return b;
    });
    const dartsLeft=state.dartsLeft-1;
    const over=dartsLeft<=0||balloons.every(b=>b.popped);
    return {...state,balloons,score:state.score+scoreAdd,dartsLeft,phase:over?"gameover":"aiming"};
  }
  return state;
}

export function isTerminal(state: BalloonDartsState): { score:number }|null { return state.phase==="gameover"?{score:state.score}:null; }
