import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TRACK_LENGTH = 30;
export const STARTING_FUEL = 12;
export const STARTING_HULL = 4;

export interface DiceSpaceshipSettings { dummy: boolean; }

export type Choice = "thrust" | "drift" | "scan";

export interface DiceSpaceshipState {
  rngSeed: number;
  pos: number;
  fuel: number;
  hull: number;
  rolls: [number, number] | null;
  hazardHit: boolean;
  score: number;
  phase: "choose" | "result" | "done";
  log: string;
}

export type DiceSpaceshipAction = { type: "act"; choice: Choice } | { type: "next" };

export function initialState(seed: number, _settings: DiceSpaceshipSettings): DiceSpaceshipState {
  return { rngSeed: seed, pos: 0, fuel: STARTING_FUEL, hull: STARTING_HULL, rolls: null, hazardHit: false, score: 0, phase: "choose", log: "" };
}

export function reducer(state: DiceSpaceshipState, action: DiceSpaceshipAction): DiceSpaceshipState {
  if (state.phase === "done") return state;
  if (action.type === "act" && state.phase === "choose") {
    if (action.choice === "thrust" && state.fuel <= 0) return state;
    const rng = mulberry32(state.rngSeed);
    const r1 = 1 + Math.floor(rng() * 6);
    const r2 = 1 + Math.floor(rng() * 6);
    const haz = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let move = 0; let fuel = state.fuel; let hull = state.hull; let log = "";
    if (action.choice === "thrust") {
      move = r1 + r2;
      fuel -= 2;
      log = `Thrust +${move} ly. Fuel -2.`;
    } else if (action.choice === "drift") {
      move = Math.min(r1, r2);
      log = `Drift +${move} ly.`;
    } else {
      move = Math.max(r1, r2);
      log = `Scan +${move} ly. Hazard avoided.`;
    }
    let hit = false;
    if (haz >= 5 && action.choice !== "scan") {
      hull -= 1;
      hit = true;
      log += ` Asteroid! Hull ${hull}.`;
    }
    const pos = Math.min(TRACK_LENGTH, state.pos + move);
    let score = state.score + move;
    let phase: DiceSpaceshipState["phase"] = "result";
    if (pos >= TRACK_LENGTH) {
      score += 60 + fuel * 4 + hull * 8;
      log += ` ARRIVED!`;
      phase = "done";
    } else if (hull <= 0) {
      log += ` Hull breached.`;
      phase = "done";
    }
    return { ...state, rngSeed: nextSeed, rolls: [r1, r2], hazardHit: hit, pos, fuel, hull, score, phase, log };
  }
  if (action.type === "next" && state.phase === "result") {
    return { ...state, phase: "choose", rolls: null, hazardHit: false, log: "" };
  }
  return state;
}

export function isTerminal(state: DiceSpaceshipState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
