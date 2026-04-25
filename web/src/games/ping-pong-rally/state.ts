import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface PingPongRallySettings {
  target: "20" | "50";
}

export interface PingPongRallyState {
  settings: PingPongRallySettings;
  rngSeed: number;
  targetRally: number;
  rallyCount: number;
  hitWindow: number;   // 0..1 position of sweet spot
  timing: number;      // player's timed hit 0..1
  streak: number;
  longestStreak: number;
  phase: "rally" | "miss" | "done";
  lastResult: string;
  totalHits: number;
}

export type PingPongRallyAction =
  | { type: "hit"; timing: number }
  | { type: "restart" };

function nextSeed(seed: number): number {
  return (mulberry32(seed)() * 2 ** 31) >>> 0;
}

export function initialState(seed: number, settings: PingPongRallySettings): PingPongRallyState {
  const rng = mulberry32(seed);
  const hitWindow = 0.3 + rng() * 0.4;
  return {
    settings,
    rngSeed: seed >>> 0,
    targetRally: parseInt(settings.target, 10),
    rallyCount: 0,
    hitWindow,
    timing: 0.5,
    streak: 0,
    longestStreak: 0,
    phase: "rally",
    lastResult: "",
    totalHits: 0,
  };
}

export function reducer(state: PingPongRallyState, action: PingPongRallyAction): PingPongRallyState {
  if (state.phase === "done") return state;

  if (action.type === "hit" && state.phase === "rally") {
    const seed1 = state.rngSeed;
    const seed2 = nextSeed(seed1);
    const rng = mulberry32(seed2);

    const tolerance = 0.18;
    const deviation = Math.abs(action.timing - state.hitWindow);
    const hit = deviation <= tolerance;

    const newHitWindow = 0.2 + rng() * 0.6; // next ball position
    const newStreak = hit ? state.streak + 1 : 0;
    const newLongest = Math.max(state.longestStreak, newStreak);
    const newTotal = state.totalHits + (hit ? 1 : 0);
    const newRallyCount = state.rallyCount + 1;
    const done = newRallyCount >= state.targetRally;

    return {
      ...state,
      rngSeed: seed2,
      rallyCount: newRallyCount,
      hitWindow: newHitWindow,
      timing: action.timing,
      streak: newStreak,
      longestStreak: newLongest,
      totalHits: newTotal,
      lastResult: hit ? "Nice return!" : "Missed!",
      phase: done ? "done" : hit ? "rally" : "miss",
    };
  }

  if (action.type === "restart" && state.phase === "miss") {
    return { ...state, streak: 0, phase: "rally" };
  }

  return state;
}

export function isTerminal(state: PingPongRallyState): { score: number } | null {
  if (state.phase !== "done") return null;
  const accuracy = state.totalHits / state.targetRally;
  return { score: Math.round(accuracy * 800 + state.longestStreak * 2) };
}
