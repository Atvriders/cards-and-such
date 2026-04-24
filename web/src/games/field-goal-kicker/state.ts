import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface FieldGoalSettings {
  kicks: "10" | "15";
}

export interface Kick {
  distance: number;  // yards
  angle: number;     // player aim 0..1
  power: number;     // 0..1
  wind: number;      // negative=left, positive=right
  good: boolean;
}

export interface FieldGoalState {
  settings: FieldGoalSettings;
  rngSeed: number;
  totalKicks: number;
  kickIndex: number;
  kicks: Kick[];
  currentDistance: number;
  wind: number;
  angle: number;    // 0..1, ideal=0.5
  power: number;    // 0..1, need higher power for longer kicks
  phase: "aim" | "result" | "done";
  lastResult: string;
  goodCount: number;
}

export type FieldGoalAction =
  | { type: "set-angle"; value: number }
  | { type: "set-power"; value: number }
  | { type: "kick" }
  | { type: "next" };

const DISTANCES = [20, 25, 30, 35, 40, 45, 50, 33, 27, 42, 38, 22, 48, 35, 30];

function nextSeed(seed: number): number {
  return (mulberry32(seed)() * 2 ** 31) >>> 0;
}

function idealPower(distance: number): number {
  // 20 yds = 0.35 power; 55 yds = 0.95 power
  return Math.min(0.95, 0.35 + ((distance - 20) / 35) * 0.6);
}

function kickResult(angle: number, power: number, distance: number, wind: number, seed: number): boolean {
  const rng = mulberry32(seed);
  const ideal = idealPower(distance);
  const angleDev = Math.abs(angle - 0.5) + Math.abs(wind) * 0.3;
  const powerDev = Math.abs(power - ideal);
  const quality = Math.max(0, 1 - angleDev / 0.3 - powerDev / 0.35);
  return rng() < quality;
}

export function initialState(seed: number, settings: FieldGoalSettings): FieldGoalState {
  const totalKicks = parseInt(settings.kicks, 10);
  const rng = mulberry32(seed);
  const winds = Array.from({ length: totalKicks }, () => (rng() - 0.5) * 0.5);
  const dist = DISTANCES[0] ?? 30;
  return {
    settings,
    rngSeed: seed >>> 0,
    totalKicks,
    kickIndex: 0,
    kicks: [],
    currentDistance: dist,
    wind: winds[0] ?? 0,
    angle: 0.5,
    power: idealPower(dist),
    phase: "aim",
    lastResult: "",
    goodCount: 0,
  };
}

export function reducer(state: FieldGoalState, action: FieldGoalAction): FieldGoalState {
  if (state.phase === "done") return state;

  if (action.type === "set-angle" && state.phase === "aim") {
    return { ...state, angle: Math.min(1, Math.max(0, action.value)) };
  }
  if (action.type === "set-power" && state.phase === "aim") {
    return { ...state, power: Math.min(1, Math.max(0, action.value)) };
  }

  if (action.type === "kick" && state.phase === "aim") {
    const seed1 = state.rngSeed;
    const seed2 = nextSeed(seed1);
    const good = kickResult(state.angle, state.power, state.currentDistance, state.wind, seed1);
    const newKick: Kick = {
      distance: state.currentDistance,
      angle: state.angle,
      power: state.power,
      wind: state.wind,
      good,
    };
    const newKicks = [...state.kicks, newKick];
    const newKickIndex = state.kickIndex + 1;
    const newGoodCount = state.goodCount + (good ? 1 : 0);
    const done = newKickIndex >= state.totalKicks;

    const rng = mulberry32(seed2);
    const nextWind = (rng() - 0.5) * 0.5;
    const nextDist = DISTANCES[newKickIndex] ?? 30;

    return {
      ...state,
      rngSeed: seed2,
      kicks: newKicks,
      kickIndex: newKickIndex,
      goodCount: newGoodCount,
      currentDistance: nextDist,
      wind: nextWind,
      power: idealPower(nextDist),
      lastResult: good ? `GOOD! ${state.currentDistance} yds` : `NO GOOD — ${state.currentDistance} yds`,
      phase: done ? "done" : "result",
    };
  }

  if (action.type === "next" && state.phase === "result") {
    return { ...state, phase: "aim" };
  }

  return state;
}

export function isTerminal(state: FieldGoalState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.round((state.goodCount / state.totalKicks) * 1000) };
}
