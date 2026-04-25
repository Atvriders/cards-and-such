import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface RocketLaunchSettings {
  difficulty: "easy" | "normal" | "hard";
}

export interface RocketLaunchState {
  settings: RocketLaunchSettings;
  rngSeed: number;
  rocketX: number;       // 0–8 column (9-wide grid)
  targetX: number;       // 0–8 column target
  altitude: number;      // 0 = ground, increases with each launch step
  fuel: number;          // remaining fuel units
  maxFuel: number;
  score: number;
  hits: number;
  misses: number;
  phase: "aim" | "launching" | "result";
  lastHit: boolean;
  roundsLeft: number;
  gameOver: boolean;
  won: boolean;
}

export type RocketLaunchAction =
  | { type: "move-left" }
  | { type: "move-right" }
  | { type: "launch" }
  | { type: "next-round" };

function rng(seed: number): { val: number; seed: number } {
  const r = mulberry32(seed);
  const val = r();
  return { val, seed: (seed + 0x6d2b79f5) >>> 0 };
}

export function initialState(seed: number, settings: RocketLaunchSettings): RocketLaunchState {
  const maxFuel = settings.difficulty === "easy" ? 30 : settings.difficulty === "normal" ? 20 : 12;
  const rounds = settings.difficulty === "easy" ? 10 : settings.difficulty === "normal" ? 8 : 6;
  const { val, seed: newSeed } = rng(seed);
  const targetX = Math.floor(val * 9);
  return {
    settings,
    rngSeed: newSeed,
    rocketX: 4,
    targetX,
    altitude: 0,
    fuel: maxFuel,
    maxFuel,
    score: 0,
    hits: 0,
    misses: 0,
    phase: "aim",
    lastHit: false,
    roundsLeft: rounds,
    gameOver: false,
    won: false,
  };
}

export function reducer(state: RocketLaunchState, action: RocketLaunchAction): RocketLaunchState {
  if (state.gameOver) return state;

  if (action.type === "move-left" && state.phase === "aim") {
    if (state.fuel <= 0) return state;
    return { ...state, rocketX: Math.max(0, state.rocketX - 1), fuel: state.fuel - 1 };
  }

  if (action.type === "move-right" && state.phase === "aim") {
    if (state.fuel <= 0) return state;
    return { ...state, rocketX: Math.min(8, state.rocketX + 1), fuel: state.fuel - 1 };
  }

  if (action.type === "launch" && state.phase === "aim") {
    const hit = state.rocketX === state.targetX;
    const bonus = hit ? Math.floor(state.fuel * 10) + 100 : 0;
    return {
      ...state,
      phase: "result",
      altitude: 100,
      lastHit: hit,
      score: state.score + bonus,
      hits: hit ? state.hits + 1 : state.hits,
      misses: hit ? state.misses : state.misses + 1,
    };
  }

  if (action.type === "next-round" && state.phase === "result") {
    const newRoundsLeft = state.roundsLeft - 1;
    if (newRoundsLeft <= 0) {
      const won = state.hits > state.misses;
      return { ...state, phase: "aim", roundsLeft: 0, gameOver: true, won };
    }
    const { val, seed: newSeed } = rng(state.rngSeed);
    const targetX = Math.floor(val * 9);
    return {
      ...state,
      rngSeed: newSeed,
      rocketX: 4,
      targetX,
      altitude: 0,
      fuel: state.maxFuel,
      phase: "aim",
      lastHit: false,
      roundsLeft: newRoundsLeft,
    };
  }

  return state;
}

export function isTerminal(state: RocketLaunchState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.score };
}
