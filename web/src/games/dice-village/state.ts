import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TURNS = 12;
export const BUILDINGS = ["house", "farm", "mill", "church"] as const;
export type Building = typeof BUILDINGS[number];

export interface DiceVillageSettings { dummy: boolean; }

export interface DiceVillageState {
  rngSeed: number;
  turn: number;
  rolls: number[] | null;
  built: Record<Building, number>;
  score: number;
  phase: "roll" | "build" | "done";
  log: string;
}

export type DiceVillageAction = { type: "roll" } | { type: "build"; what: Building } | { type: "skip" };

const REQ: Record<Building, { has: (rolls: number[]) => boolean; pts: number }> = {
  house:  { has: r => r.some(x => x <= 2), pts: 8 },     // need any 1-2
  farm:   { has: r => r.some(x => x === 3 || x === 4), pts: 14 }, // need 3 or 4
  mill:   { has: r => r.some(x => x === 5), pts: 20 },   // need 5
  church: { has: r => r.filter(x => x === 6).length >= 2, pts: 36 }, // need two 6s
};

export function initialState(seed: number, _settings: DiceVillageSettings): DiceVillageState {
  return { rngSeed: seed, turn: 1, rolls: null, built: { house: 0, farm: 0, mill: 0, church: 0 }, score: 0, phase: "roll", log: "" };
}

export function reducer(state: DiceVillageState, action: DiceVillageAction): DiceVillageState {
  if (state.phase === "done") return state;
  if (action.type === "roll" && state.phase === "roll") {
    const rng = mulberry32(state.rngSeed);
    const r = [1+Math.floor(rng()*6), 1+Math.floor(rng()*6), 1+Math.floor(rng()*6)];
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: nextSeed, rolls: r, phase: "build", log: `Rolled ${r.join(", ")}.` };
  }
  if (action.type === "build" && state.phase === "build" && state.rolls) {
    const { has, pts } = REQ[action.what];
    if (!has(state.rolls)) return state;
    const built = { ...state.built, [action.what]: state.built[action.what] + 1 };
    const turn = state.turn + 1;
    const phase: DiceVillageState["phase"] = turn > TURNS ? "done" : "roll";
    return { ...state, built, rolls: null, score: state.score + pts, turn, phase, log: `Built ${action.what} (+${pts}).` };
  }
  if (action.type === "skip" && state.phase === "build") {
    const turn = state.turn + 1;
    const phase: DiceVillageState["phase"] = turn > TURNS ? "done" : "roll";
    return { ...state, rolls: null, turn, phase, log: "Skipped." };
  }
  return state;
}

export function isTerminal(state: DiceVillageState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
