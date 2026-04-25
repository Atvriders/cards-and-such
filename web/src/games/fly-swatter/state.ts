import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Fly Swatter: flies move around, click them to swat. Miss = lose a life.
export interface FlySwatterSettings { difficulty: "easy"|"hard" }
export interface Fly { id:number; x:number; y:number; vx:number; vy:number; alive:boolean; }
export interface FlySwatterState {
  rngSeed: number; flies: Fly[]; score: number; lives: number; maxLives: number;
  tick: number; nextId: number; phase: "playing"|"gameover";
  swatted: number; // total swatted
}
export type FlySwatterAction = { type:"swat"; id:number } | { type:"tick" };
const CFGS={ easy:{speed:0.006,maxFlies:3,lives:5}, hard:{speed:0.012,maxFlies:5,lives:3} };
function mkFly(seed: number, id: number, speed: number): { f:Fly; ns:number } {
  const rng=mulberry32(seed);
  const x=0.1+rng()*0.8;const y=0.1+rng()*0.8;
  const angle=rng()*Math.PI*2;
  const vx=Math.cos(angle)*speed;const vy=Math.sin(angle)*speed;
  return { f:{id,x,y,vx,vy,alive:true}, ns:Math.floor(rng()*2**31) };
}
export function initialState(seed: number, settings: FlySwatterSettings): FlySwatterState {
  const cfg=CFGS[settings.difficulty];
  const { f, ns }=mkFly(seed,0,cfg.speed);
  return { rngSeed:ns, flies:[f], score:0, lives:cfg.lives, maxLives:cfg.lives, tick:0, nextId:1, phase:"playing", swatted:0 };
}
export function reducer(state: FlySwatterState, action: FlySwatterAction): FlySwatterState {
  if(state.phase==="gameover") return state;
  switch(action.type){
    case "swat": {
      const flies=state.flies.map(f=>f.id===action.id?{...f,alive:false}:f);
      return {...state,flies,score:state.score+100,swatted:state.swatted+1};
    }
    case "tick": {
      let { flies, rngSeed, nextId }=state;
      const cfg=CFGS["easy"];
      // move flies
      flies=flies.filter(f=>f.alive).map(f=>{
        let x=f.x+f.vx; let y=f.y+f.vy;
        let vx=f.vx; let vy=f.vy;
        if(x<0.05||x>0.95){vx=-vx;x=Math.max(0.05,Math.min(0.95,x));}
        if(y<0.05||y>0.95){vy=-vy;y=Math.max(0.05,Math.min(0.95,y));}
        return {...f,x,y,vx,vy};
      });
      // spawn up to max
      while(flies.length<cfg.maxFlies){
        const { f, ns }=mkFly(rngSeed,nextId,cfg.speed);
        flies=[...flies,f];rngSeed=ns;nextId++;
      }
      return {...state,flies,rngSeed,nextId,tick:state.tick+1};
    }
    default: return state;
  }
}
export function isTerminal(state: FlySwatterState): { score:number }|null {
  // End after 50 swats or game over
  if(state.phase==="gameover") return {score:state.score};
  if(state.swatted>=50) return {score:state.score};
  return null;
}
