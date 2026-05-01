import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TURNS = 12;

export interface DiceCastleSettings { dummy: boolean; }

export interface Resources { wood: number; stone: number; gold: number; }

export interface DiceCastleState {
  rngSeed: number;
  turn: number;
  res: Resources;
  built: { walls: number; tower: boolean; keep: boolean; throne: boolean };
  rolls: number[] | null;
  score: number;
  phase: "roll" | "build" | "done";
  log: string;
}

export type DiceCastleAction = { type: "roll" } | { type: "build"; what: "wall" | "tower" | "keep" | "throne" } | { type: "skip" };

const COSTS = {
  wall: { wood: 1, stone: 2, gold: 0, score: 6 },
  tower: { wood: 0, stone: 4, gold: 1, score: 18 },
  keep: { wood: 3, stone: 4, gold: 2, score: 32 },
  throne: { wood: 0, stone: 0, gold: 6, score: 50 },
};

export function initialState(seed: number, _settings: DiceCastleSettings): DiceCastleState {
  return { rngSeed: seed, turn: 1, res: { wood: 0, stone: 0, gold: 0 }, built: { walls: 0, tower: false, keep: false, throne: false }, rolls: null, score: 0, phase: "roll", log: "" };
}

export function reducer(state: DiceCastleState, action: DiceCastleAction): DiceCastleState {
  if (state.phase === "done") return state;
  if (action.type === "roll" && state.phase === "roll") {
    const rng = mulberry32(state.rngSeed);
    const r = [1+Math.floor(rng()*6), 1+Math.floor(rng()*6), 1+Math.floor(rng()*6)];
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let wood = 0, stone = 0, gold = 0;
    r.forEach(d => {
      if (d <= 2) wood++;
      else if (d <= 4) stone++;
      else if (d === 5) stone++;
      else gold++; // 6 -> gold
    });
    return { ...state, rngSeed: nextSeed, rolls: r, res: { wood: state.res.wood + wood, stone: state.res.stone + stone, gold: state.res.gold + gold }, phase: "build", log: `Gathered: ${wood}W / ${stone}S / ${gold}G` };
  }
  if (action.type === "build" && state.phase === "build") {
    const c = COSTS[action.what === "wall" ? "wall" : action.what];
    if (state.res.wood < c.wood || state.res.stone < c.stone || state.res.gold < c.gold) return state;
    if (action.what === "tower" && state.built.tower) return state;
    if (action.what === "keep" && state.built.keep) return state;
    if (action.what === "throne" && state.built.throne) return state;
    const built = { ...state.built };
    if (action.what === "wall") built.walls += 1;
    else built[action.what] = true;
    const res = { wood: state.res.wood - c.wood, stone: state.res.stone - c.stone, gold: state.res.gold - c.gold };
    const turn = state.turn + 1;
    const score = state.score + c.score;
    const phase: DiceCastleState["phase"] = turn > TURNS ? "done" : "roll";
    return { ...state, res, built, turn, score, phase, rolls: null, log: `Built ${action.what} (+${c.score}).` };
  }
  if (action.type === "skip" && state.phase === "build") {
    const turn = state.turn + 1;
    const phase: DiceCastleState["phase"] = turn > TURNS ? "done" : "roll";
    return { ...state, turn, phase, rolls: null, log: "Skipped build." };
  }
  return state;
}

export function isTerminal(state: DiceCastleState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
