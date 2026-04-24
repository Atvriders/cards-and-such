import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Rainbow Sort — sort falling colored drops into the right buckets

export type RainbowColor = "red" | "orange" | "yellow" | "green" | "blue" | "purple";

export interface RainbowSettings {
  rounds: "5" | "8" | "10";
}

export interface RainbowState {
  settings: RainbowSettings;
  rngSeed: number;
  current: RainbowColor; // the drop to sort
  roundNum: number;
  totalRounds: number;
  score: number;
  lastCorrect: boolean | null;
  message: string;
  done: boolean;
}

export type RainbowAction = { type: "sort"; bucket: RainbowColor };

const COLORS: RainbowColor[] = ["red", "orange", "yellow", "green", "blue", "purple"];

function nextColor(seed: number): { color: RainbowColor; nextSeed: number } {
  const rng = mulberry32(seed);
  const color = COLORS[Math.floor(rng() * COLORS.length)]!;
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { color, nextSeed };
}

export function initialState(seed: number, settings: RainbowSettings): RainbowState {
  const totalRounds = parseInt(settings.rounds);
  const { color, nextSeed } = nextColor(seed);
  return {
    settings,
    rngSeed: nextSeed,
    current: color,
    roundNum: 1,
    totalRounds,
    score: 0,
    lastCorrect: null,
    message: `Drop the ${color} drop into the matching bucket!`,
    done: false,
  };
}

export function reducer(state: RainbowState, action: RainbowAction): RainbowState {
  if (state.done) return state;
  if (action.type !== "sort") return state;

  const correct = action.bucket === state.current;
  const score = state.score + (correct ? Math.round(100 / state.totalRounds) : 0);

  if (state.roundNum >= state.totalRounds) {
    return {
      ...state,
      score,
      lastCorrect: correct,
      done: true,
      message: correct
        ? `Correct! Final score: ${score}. Excellent sorting!`
        : `That was ${state.current}! Final score: ${score}.`,
    };
  }

  const { color, nextSeed } = nextColor(state.rngSeed);
  return {
    ...state,
    rngSeed: nextSeed,
    current: color,
    roundNum: state.roundNum + 1,
    score,
    lastCorrect: correct,
    message: correct
      ? `Perfect! Now sort the ${color} drop!`
      : `Oops — that was ${state.current}! Next: sort the ${color} drop.`,
  };
}

export function isTerminal(state: RainbowState): { score: number } | null {
  if (!state.done) return null;
  return { score: state.score };
}
