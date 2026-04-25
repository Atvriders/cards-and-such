import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface HomeRunDerbySettings {
  outs: "5" | "10";
}

export interface Swing {
  timing: number;  // 0..1, ideal=0.5
  power: number;   // 0..1, ideal=0.80
  wind: number;
  result: "hr" | "hit" | "out";
  distance: number;
}

export interface HomeRunDerbyState {
  settings: HomeRunDerbySettings;
  rngSeed: number;
  maxOuts: number;
  outsUsed: number;
  homeRuns: number;
  swings: Swing[];
  timing: number;
  power: number;
  wind: number;
  phase: "aim" | "result" | "done";
  lastResult: string;
  lastDistance: number;
}

export type HomeRunDerbyAction =
  | { type: "set-timing"; value: number }
  | { type: "set-power"; value: number }
  | { type: "swing" }
  | { type: "next" };

function nextSeed(seed: number): number {
  return (mulberry32(seed)() * 2 ** 31) >>> 0;
}

function swingResult(timing: number, power: number, wind: number, seed: number): { result: "hr" | "hit" | "out"; distance: number } {
  const rng = mulberry32(seed);
  const timingDev = Math.abs(timing - 0.5);
  const powerDev = Math.abs(power - 0.80);
  const quality = Math.max(0, 1 - timingDev / 0.35 - powerDev / 0.45 + wind * 0.1);
  const r = rng();
  const distance = Math.round(300 + quality * 200 + (rng() - 0.5) * 40);
  if (quality > 0.65 && r < quality) return { result: "hr", distance };
  if (quality > 0.25) return { result: "hit", distance: Math.min(distance, 290) };
  return { result: "out", distance: 0 };
}

export function initialState(seed: number, settings: HomeRunDerbySettings): HomeRunDerbyState {
  const rng = mulberry32(seed);
  const wind = (rng() - 0.5) * 0.4;
  return {
    settings,
    rngSeed: seed >>> 0,
    maxOuts: parseInt(settings.outs, 10),
    outsUsed: 0,
    homeRuns: 0,
    swings: [],
    timing: 0.5,
    power: 0.80,
    wind,
    phase: "aim",
    lastResult: "",
    lastDistance: 0,
  };
}

export function reducer(state: HomeRunDerbyState, action: HomeRunDerbyAction): HomeRunDerbyState {
  if (state.phase === "done") return state;

  if (action.type === "set-timing" && state.phase === "aim") {
    return { ...state, timing: Math.min(1, Math.max(0, action.value)) };
  }
  if (action.type === "set-power" && state.phase === "aim") {
    return { ...state, power: Math.min(1, Math.max(0, action.value)) };
  }

  if (action.type === "swing" && state.phase === "aim") {
    const seed1 = state.rngSeed;
    const seed2 = nextSeed(seed1);
    const { result, distance } = swingResult(state.timing, state.power, state.wind, seed1);
    const swing: Swing = { timing: state.timing, power: state.power, wind: state.wind, result, distance };
    const newSwings = [...state.swings, swing];
    const newOuts = state.outsUsed + (result === "out" ? 1 : 0);
    const newHRs = state.homeRuns + (result === "hr" ? 1 : 0);
    const done = newOuts >= state.maxOuts;

    const rng = mulberry32(seed2);
    const nextWind = (rng() - 0.5) * 0.4;

    const msg = result === "hr"
      ? `HOME RUN! ${distance} ft!`
      : result === "hit"
      ? `Base hit — ${distance} ft`
      : "OUT!";

    return {
      ...state,
      rngSeed: seed2,
      swings: newSwings,
      outsUsed: newOuts,
      homeRuns: newHRs,
      wind: nextWind,
      lastResult: msg,
      lastDistance: distance,
      phase: done ? "done" : "result",
    };
  }

  if (action.type === "next" && state.phase === "result") {
    return { ...state, phase: "aim" };
  }

  return state;
}

export function isTerminal(state: HomeRunDerbyState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.homeRuns * 100 };
}
