import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Target Grab: targets appear at random positions, click them before they disappear
export interface TargetGrabSettings { difficulty: "easy"|"hard" }
export interface Target { id:number; x:number; y:number; radius:number; timeLeft:number; maxTime:number; hit:boolean; }
export interface TargetGrabState {
  rngSeed: number; targets: Target[]; score: number; misses: number; maxMisses: number;
  tick: number; nextId: number; spawnCooldown: number;
  phase: "playing"|"gameover";
}
export type TargetGrabAction = { type:"click"; id:number } | { type:"tick" } | { type:"miss" };

const CONFIGS = {
  easy:   { radius:0.09, maxTime:80, spawnEvery:25, maxMisses:5 },
  hard:   { radius:0.065, maxTime:50, spawnEvery:18, maxMisses:3 },
};

function spawnTarget(seed: number, id: number, cfg: typeof CONFIGS.easy): { t: Target; nextSeed: number } {
  const rng=mulberry32(seed);
  const x=cfg.radius+rng()*(1-cfg.radius*2);
  const y=cfg.radius+rng()*(1-cfg.radius*2);
  const nextSeed=Math.floor(rng()*2**31);
  return { t:{ id, x, y, radius:cfg.radius, timeLeft:cfg.maxTime, maxTime:cfg.maxTime, hit:false }, nextSeed };
}

export function initialState(seed: number, settings: TargetGrabSettings): TargetGrabState {
  const cfg=CONFIGS[settings.difficulty];
  const { t, nextSeed }=spawnTarget(seed,0,cfg);
  return { rngSeed:nextSeed, targets:[t], score:0, misses:0, maxMisses:cfg.maxMisses, tick:0, nextId:1, spawnCooldown:cfg.spawnEvery, phase:"playing" };
}

export function reducer(state: TargetGrabState, action: TargetGrabAction): TargetGrabState {
  if(state.phase==="gameover") return state;
  switch(action.type){
    case "click": {
      const targets=state.targets.map(t=>t.id===action.id&&!t.hit?{...t,hit:true}:t);
      const target=state.targets.find(t=>t.id===action.id);
      const bonus=target?Math.floor((target.timeLeft/target.maxTime)*50):0;
      return {...state,targets,score:state.score+50+bonus};
    }
    case "tick": {
      let { targets, rngSeed, nextId, spawnCooldown, score, misses }=state;
      // age targets
      const newMissed: number[] = [];
      targets=targets.map(t=>{
        if(t.hit) return t;
        const tl=t.timeLeft-1;
        if(tl<=0){ newMissed.push(t.id); return {...t,timeLeft:0}; }
        return {...t,timeLeft:tl};
      }).filter(t=>t.timeLeft>0||t.hit);
      misses+=newMissed.length;
      if(misses>=state.maxMisses) return {...state,targets,misses,phase:"gameover"};
      // spawn
      spawnCooldown--;
      const cfg=CONFIGS["easy"];
      if(spawnCooldown<=0&&targets.filter(t=>!t.hit).length<4){
        const { t, nextSeed: ns }=spawnTarget(rngSeed,nextId,cfg);
        targets=[...targets.filter(t=>!t.hit||t.timeLeft>0),t];
        rngSeed=ns; nextId++; spawnCooldown=cfg.spawnEvery;
      }
      return {...state,targets,score,misses,rngSeed,nextId,spawnCooldown,tick:state.tick+1};
    }
    default: return state;
  }
}

export function isTerminal(state: TargetGrabState): { score:number }|null { return state.phase==="gameover"?{score:state.score}:null; }
