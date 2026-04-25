import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Marathon Pacer: manage pace through 26 mile race
// Tap to speed up, but burn energy. Balance between fast pace and bonking

export const TOTAL_MILES = 10; // mini marathon

export interface MarathonState {
  rngSeed: number;
  mile: number;          // current mile 0-TOTAL_MILES
  energy: number;        // 0-100
  pace: number;          // seconds per mile (lower = faster)
  targetPace: number;    // optimal pace for current conditions
  totalTime: number;     // accumulated seconds
  boosts: number;        // surge uses left
  phase: "running" | "done";
  mileTimes: number[];
  tick: number;
  mileProgress: number;  // 0-100 within current mile
  score: number;
}

export type MarathonAction =
  | { type: "surge" }
  | { type: "recover" }
  | { type: "tick" };

export function initialState(seed: number): MarathonState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const targetPace = 480 + Math.floor(rng() * 120); // 8-10 min/mile in seconds
  return {
    rngSeed: nextSeed,
    mile: 0,
    energy: 100,
    pace: targetPace,
    targetPace,
    totalTime: 0,
    boosts: 5,
    phase: "running",
    mileTimes: [],
    tick: 0,
    mileProgress: 0,
    score: 0,
  };
}

export function reducer(state: MarathonState, action: MarathonAction): MarathonState {
  if (state.phase === "done") return state;

  if (action.type === "surge") {
    if (state.boosts <= 0 || state.energy < 10) return state;
    const newPace = Math.max(240, state.pace - 60);
    return {
      ...state,
      pace: newPace,
      energy: Math.max(0, state.energy - 15),
      boosts: state.boosts - 1,
    };
  }

  if (action.type === "recover") {
    const newPace = Math.min(state.targetPace + 120, state.pace + 30);
    return {
      ...state,
      pace: newPace,
      energy: Math.min(100, state.energy + 5),
    };
  }

  // tick
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const newTick = state.tick + 1;

  // Natural energy drain based on how much faster than target pace
  const paceStress = Math.max(0, state.targetPace - state.pace);
  const energyDrain = 0.2 + (paceStress / state.targetPace) * 0.5;
  const newEnergy = Math.max(0, state.energy - energyDrain);

  // If energy low, pace degrades
  const energyPenalty = newEnergy < 20 ? (20 - newEnergy) * 2 : 0;
  const adjustedPace = Math.min(state.targetPace + 120, state.pace + energyPenalty * 0.1);

  // Progress through mile: each tick advances by pace-dependent amount
  // At pace=480, progress per tick = ~100/480 * tickInterval
  const tickInterval = 100; // ms, progress per tick
  const progressPerTick = (tickInterval / 1000) * (100 / (adjustedPace));
  const newProgress = state.mileProgress + progressPerTick * 100;

  if (newProgress >= 100) {
    // mile complete
    const mileTime = adjustedPace;
    const newMileTimes = [...state.mileTimes, mileTime];
    const newMile = state.mile + 1;
    const mileScore = Math.round(Math.max(0, (state.targetPace * 1.3 - mileTime) / state.targetPace * 20));

    if (newMile >= TOTAL_MILES) {
      return {
        ...state,
        rngSeed: nextSeed,
        tick: newTick,
        mile: newMile,
        energy: newEnergy,
        pace: adjustedPace,
        totalTime: state.totalTime + mileTime,
        mileTimes: newMileTimes,
        mileProgress: 0,
        phase: "done",
        score: Math.min(100, state.score + mileScore),
      };
    }

    return {
      ...state,
      rngSeed: nextSeed,
      tick: newTick,
      mile: newMile,
      energy: newEnergy,
      pace: adjustedPace,
      totalTime: state.totalTime + mileTime,
      mileTimes: newMileTimes,
      mileProgress: 0,
      score: state.score + mileScore,
    };
  }

  return {
    ...state,
    rngSeed: nextSeed,
    tick: newTick,
    energy: newEnergy,
    pace: adjustedPace,
    mileProgress: newProgress,
  };
}

export function isTerminal(state: MarathonState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, Math.min(100, state.score)) };
}
