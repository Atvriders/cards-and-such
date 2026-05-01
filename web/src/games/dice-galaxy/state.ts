import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const PLANETS = 8;

export interface Planet { name: string; need: number; reward: number; visited: boolean; }

export interface DiceGalaxySettings { dummy: boolean; }

export interface DiceGalaxyState {
  rngSeed: number;
  planets: Planet[];
  fuel: number;
  rolls: number[] | null;
  score: number;
  phase: "roll" | "result" | "done";
  log: string;
  selected: number | null;
}

export type DiceGalaxyAction = { type: "select"; idx: number } | { type: "next" };

const NAMES = ["Hesperia", "Vega", "Khorne", "Aether", "Lyx", "Plix", "Quor", "Zen"];

export function initialState(seed: number, _settings: DiceGalaxySettings): DiceGalaxyState {
  const rng = mulberry32(seed);
  const planets: Planet[] = NAMES.map((n) => ({ name: n, need: 7 + Math.floor(rng() * 8), reward: 8 + Math.floor(rng() * 18), visited: false }));
  return { rngSeed: Math.floor(rng() * 2 ** 31), planets, fuel: 6, rolls: null, score: 0, phase: "roll", log: "", selected: null };
}

export function reducer(state: DiceGalaxyState, action: DiceGalaxyAction): DiceGalaxyState {
  if (state.phase === "done") return state;
  if (action.type === "select" && state.phase === "roll") {
    if (state.fuel <= 0) return state;
    const planet = state.planets[action.idx];
    if (!planet || planet.visited) return state;
    const rng = mulberry32(state.rngSeed);
    const r1 = 1 + Math.floor(rng()*6);
    const r2 = 1 + Math.floor(rng()*6);
    const r3 = 1 + Math.floor(rng()*6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const sum = r1 + r2 + r3;
    const success = sum >= planet.need;
    const planets = state.planets.map((p, i) => i === action.idx && success ? { ...p, visited: true } : p);
    let pts = 0;
    let log = "";
    if (success) {
      pts = planet.reward + (sum >= planet.need + 4 ? 6 : 0);
      log = `Landed on ${planet.name} (sum ${sum} >= ${planet.need}). +${pts}.`;
    } else {
      log = `Slingshot past ${planet.name} (sum ${sum} < ${planet.need}).`;
    }
    const fuel = state.fuel - 1;
    const allDone = planets.every(p => p.visited);
    let phase: DiceGalaxyState["phase"] = "result";
    if (fuel <= 0 || allDone) {
      if (allDone) pts += 30;
      phase = "done";
      log += allDone ? " Galaxy explored! +30." : " Out of fuel.";
    }
    return { ...state, rngSeed: nextSeed, planets, fuel, rolls: [r1, r2, r3], score: state.score + pts, phase, log, selected: action.idx };
  }
  if (action.type === "next" && state.phase === "result") {
    return { ...state, phase: "roll", rolls: null, log: "", selected: null };
  }
  return state;
}

export function isTerminal(state: DiceGalaxyState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
