import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface BasketballFTSettings {
  shots: "10" | "20";
}

export const TOTAL_SHOTS = 10;

export interface Shot {
  angle: number;
  power: number;
  wind: number;
  made: boolean;
  distraction: string;
}

export interface BasketballFTState {
  settings: BasketballFTSettings;
  rngSeed: number;
  totalShots: number;
  shotsTaken: number;
  shots: Shot[];
  angle: number;       // 0..1, ideal=0.5
  power: number;       // 0..1, ideal=0.72
  wind: number;        // current wind (-0.5..0.5)
  distraction: string; // current distraction text
  phase: "aim" | "result" | "done";
  lastResult: string;
  madeCount: number;
}

export type BasketballFTAction =
  | { type: "set-angle"; value: number }
  | { type: "set-power"; value: number }
  | { type: "shoot" }
  | { type: "next" };

const DISTRACTIONS = [
  "Fan waves foam finger", "Crowd chants", "Bright flash", "Loud horn",
  "Opponent stares", "Band plays", "Phone rings", "", "", "",
];

function nextSeed(seed: number): number {
  return (mulberry32(seed)() * 2 ** 31) >>> 0;
}

function shootResult(angle: number, power: number, wind: number, seed: number): boolean {
  const rng = mulberry32(seed);
  const angleDev = Math.abs(angle - 0.5) + Math.abs(wind) * 0.4;
  const powerDev = Math.abs(power - 0.72);
  const quality = Math.max(0, 1 - angleDev / 0.35 - powerDev / 0.4);
  return rng() < quality;
}

export function initialState(seed: number, settings: BasketballFTSettings): BasketballFTState {
  const totalShots = parseInt(settings.shots, 10);
  const rng = mulberry32(seed);
  // Pre-generate wind and distractions
  const winds = Array.from({ length: totalShots }, () => (rng() - 0.5) * 0.6);
  const distractionIdx = Array.from({ length: totalShots }, () => Math.floor(rng() * DISTRACTIONS.length));
  const firstWind = winds[0] ?? 0;
  const firstDistraction = DISTRACTIONS[distractionIdx[0] ?? 0] ?? "";

  return {
    settings,
    rngSeed: seed >>> 0,
    totalShots,
    shotsTaken: 0,
    shots: [],
    angle: 0.5,
    power: 0.72,
    wind: firstWind,
    distraction: firstDistraction,
    phase: "aim",
    lastResult: "",
    madeCount: 0,
  };
}

export function reducer(state: BasketballFTState, action: BasketballFTAction): BasketballFTState {
  if (state.phase === "done") return state;

  if (action.type === "set-angle" && state.phase === "aim") {
    return { ...state, angle: Math.min(1, Math.max(0, action.value)) };
  }
  if (action.type === "set-power" && state.phase === "aim") {
    return { ...state, power: Math.min(1, Math.max(0, action.value)) };
  }

  if (action.type === "shoot" && state.phase === "aim") {
    const seed1 = state.rngSeed;
    const seed2 = nextSeed(seed1);
    const made = shootResult(state.angle, state.power, state.wind, seed1);
    const newShot: Shot = { angle: state.angle, power: state.power, wind: state.wind, made, distraction: state.distraction };
    const newShots = [...state.shots, newShot];
    const newMadeCount = state.madeCount + (made ? 1 : 0);
    const newShotsTaken = state.shotsTaken + 1;
    const done = newShotsTaken >= state.totalShots;

    // Pre-generate next wind/distraction from seed chain
    const rng = mulberry32(seed2);
    const nextWind = (rng() - 0.5) * 0.6;
    const nextDistraction = DISTRACTIONS[Math.floor(rng() * DISTRACTIONS.length)] ?? "";

    return {
      ...state,
      rngSeed: seed2,
      shots: newShots,
      madeCount: newMadeCount,
      shotsTaken: newShotsTaken,
      lastResult: made ? "MADE IT!" : "MISSED!",
      wind: nextWind,
      distraction: nextDistraction,
      phase: done ? "done" : "result",
    };
  }

  if (action.type === "next" && state.phase === "result") {
    return { ...state, phase: "aim" };
  }

  return state;
}

export function isTerminal(state: BasketballFTState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.round((state.madeCount / state.totalShots) * 1000) };
}
