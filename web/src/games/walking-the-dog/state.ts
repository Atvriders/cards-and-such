import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface WalkingTheDogSettings {
  length: "short" | "medium" | "long";
}

// Walking the Dog: tap the right button at the right time to collect treats,
// avoid hazards, and keep the dog's energy up across a fixed number of steps.
export type Hazard = "puddle" | "bike" | "cat" | null;

export interface WalkingTheDogState {
  settings: WalkingTheDogSettings;
  rngSeed: number;
  step: number;
  totalSteps: number;
  energy: number;      // 0-100
  treats: number;      // collected treats
  hazardAhead: Hazard;
  lastAction: string | null;
  lastResult: "good" | "bad" | "neutral" | null;
  gameOver: boolean;
  won: boolean;
  score: number;
}

export type WalkingTheDogAction =
  | { type: "walk" }
  | { type: "dodge" }
  | { type: "sniff" };

const HAZARD_TYPES: Hazard[] = ["puddle", "bike", "cat", null];

function nextHazard(rng: () => number): Hazard {
  const r = rng();
  if (r < 0.25) return "puddle";
  if (r < 0.45) return "bike";
  if (r < 0.55) return "cat";
  return null;
}

export function initialState(seed: number, settings: WalkingTheDogSettings): WalkingTheDogState {
  const totalSteps = settings.length === "short" ? 10 : settings.length === "medium" ? 20 : 30;
  const rng = mulberry32(seed);
  const hazard = nextHazard(rng);
  const newSeed = (seed ^ 0xfeedface) >>> 0;
  return {
    settings,
    rngSeed: newSeed,
    step: 0,
    totalSteps,
    energy: 70,
    treats: 0,
    hazardAhead: hazard,
    lastAction: null,
    lastResult: null,
    gameOver: false,
    won: false,
    score: 0,
  };
}

export function reducer(state: WalkingTheDogState, action: WalkingTheDogAction): WalkingTheDogState {
  if (state.gameOver) return state;

  const rng = mulberry32(state.rngSeed);
  const nextStep = state.step + 1;
  let energy = state.energy;
  let treats = state.treats;
  let result: "good" | "bad" | "neutral" = "neutral";

  if (action.type === "walk") {
    if (state.hazardAhead === "puddle" || state.hazardAhead === "bike") {
      energy = Math.max(0, energy - 15); result = "bad";
    } else if (state.hazardAhead === "cat") {
      energy = Math.max(0, energy - 5); result = "neutral";
    } else {
      treats += 1; energy = Math.min(100, energy + 2); result = "good";
    }
  } else if (action.type === "dodge") {
    if (state.hazardAhead !== null) {
      energy = Math.min(100, energy - 5); result = "good";
    } else {
      energy = Math.max(0, energy - 8); result = "bad";
    }
  } else if (action.type === "sniff") {
    if (state.hazardAhead === null) {
      treats += 2; energy = Math.min(100, energy + 5); result = "good";
    } else {
      energy = Math.max(0, energy - 10); result = "bad";
    }
  }

  const newHazard = nextHazard(rng);
  const newSeed = (state.rngSeed + 0x1234abcd) >>> 0;

  const done = nextStep >= state.totalSteps || energy <= 0;
  const won = done && energy > 0;
  const score = done ? treats * 50 + energy * 2 : 0;

  return {
    ...state,
    rngSeed: newSeed,
    step: nextStep,
    energy,
    treats,
    hazardAhead: newHazard,
    lastAction: action.type,
    lastResult: result,
    gameOver: done,
    won,
    score,
  };
}

export function isTerminal(state: WalkingTheDogState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.score };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _hazardTypesUsed: typeof HAZARD_TYPES = HAZARD_TYPES;
