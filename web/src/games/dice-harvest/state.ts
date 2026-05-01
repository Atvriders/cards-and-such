import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const SEASONS = 8;
export const FIELDS = 5;

export interface DiceHarvestSettings { dummy: boolean; }

export interface DiceHarvestState {
  rngSeed: number;
  season: number;
  fields: (number | null)[]; // crop value or null
  rolls: number[] | null;
  score: number;
  phase: "plant" | "harvest" | "done";
  log: string;
}

export type DiceHarvestAction = { type: "plant" } | { type: "harvest" };

export function initialState(seed: number, _settings: DiceHarvestSettings): DiceHarvestState {
  return { rngSeed: seed, season: 1, fields: Array(FIELDS).fill(null), rolls: null, score: 0, phase: "plant", log: "" };
}

export function reducer(state: DiceHarvestState, action: DiceHarvestAction): DiceHarvestState {
  if (state.phase === "done") return state;
  if (action.type === "plant" && state.phase === "plant") {
    const rng = mulberry32(state.rngSeed);
    const r = Array.from({ length: FIELDS }, () => 1 + Math.floor(rng() * 6));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const fields = state.fields.map((f, i) => f ?? r[i]!);
    return { ...state, rngSeed: nextSeed, rolls: r, fields, phase: "harvest", log: `Planted: ${r.join(", ")}` };
  }
  if (action.type === "harvest" && state.phase === "harvest") {
    const rng = mulberry32(state.rngSeed);
    const yieldRoll = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let pts = 0;
    const fields: (number | null)[] = state.fields.map(f => {
      if (f === null) return null;
      const harvested = f * yieldRoll;
      pts += harvested;
      return null;
    });
    const season = state.season + 1;
    const phase: DiceHarvestState["phase"] = season > SEASONS ? "done" : "plant";
    return { ...state, rngSeed: nextSeed, fields, score: state.score + pts, season, phase, log: `Harvest yield x${yieldRoll} = +${pts}.`, rolls: null };
  }
  return state;
}

export function isTerminal(state: DiceHarvestState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
