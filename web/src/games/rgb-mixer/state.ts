import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface RgbMixerSettings {
  rounds: "3" | "5" | "8";
}

export interface RgbMixerState {
  settings: RgbMixerSettings;
  rngSeed: number;
  totalRounds: number;
  currentRound: number;
  targetR: number;
  targetG: number;
  targetB: number;
  r: number;
  g: number;
  b: number;
  locked: boolean;
  score: number;
  roundScores: number[];
  gameOver: boolean;
}

export type RgbMixerAction =
  | { type: "setR"; value: number }
  | { type: "setG"; value: number }
  | { type: "setB"; value: number }
  | { type: "submit" };

function randomChannel(rng: () => number): number {
  return Math.floor(rng() * 256);
}

function roundScore(dr: number, dg: number, db: number): number {
  const dist = Math.sqrt(dr * dr + dg * dg + db * db);
  return Math.max(0, Math.round(1000 - dist * 3));
}

function nextTarget(rng: () => number): { r: number; g: number; b: number } {
  return { r: randomChannel(rng), g: randomChannel(rng), b: randomChannel(rng) };
}

export function initialState(seed: number, settings: RgbMixerSettings): RgbMixerState {
  const totalRounds = parseInt(settings.rounds, 10);
  const rng = mulberry32(seed >>> 0);
  const { r: targetR, g: targetG, b: targetB } = nextTarget(rng);
  return {
    settings,
    rngSeed: seed >>> 0,
    totalRounds,
    currentRound: 0,
    targetR,
    targetG,
    targetB,
    r: 128,
    g: 128,
    b: 128,
    locked: false,
    score: 0,
    roundScores: [],
    gameOver: false,
  };
}

export function reducer(state: RgbMixerState, action: RgbMixerAction): RgbMixerState {
  if (state.gameOver) return state;

  if (action.type === "setR" && !state.locked) {
    return { ...state, r: Math.max(0, Math.min(255, action.value)) };
  }
  if (action.type === "setG" && !state.locked) {
    return { ...state, g: Math.max(0, Math.min(255, action.value)) };
  }
  if (action.type === "setB" && !state.locked) {
    return { ...state, b: Math.max(0, Math.min(255, action.value)) };
  }

  if (action.type === "submit") {
    if (state.locked) {
      // Advance to next round
      const nextRound = state.currentRound + 1;
      const gameOver = nextRound >= state.totalRounds;
      if (gameOver) return { ...state, gameOver: true };

      // Generate next target using deterministic rng based on round
      const rng = mulberry32(state.rngSeed + nextRound * 997);
      const { r: targetR, g: targetG, b: targetB } = nextTarget(rng);
      return {
        ...state,
        currentRound: nextRound,
        targetR,
        targetG,
        targetB,
        r: 128,
        g: 128,
        b: 128,
        locked: false,
      };
    }

    // Lock in answer
    const dr = state.r - state.targetR;
    const dg = state.g - state.targetG;
    const db = state.b - state.targetB;
    const pts = roundScore(dr, dg, db);
    return {
      ...state,
      locked: true,
      score: state.score + pts,
      roundScores: [...state.roundScores, pts],
    };
  }

  return state;
}

export function isTerminal(state: RgbMixerState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.score };
}

export function colorDistance(state: RgbMixerState): number {
  const dr = state.r - state.targetR;
  const dg = state.g - state.targetG;
  const db = state.b - state.targetB;
  return Math.round(Math.sqrt(dr * dr + dg * dg + db * db));
}
