import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Counting Bears — count the colored bears on screen and tap the right number

export type BearColor = "red" | "blue" | "yellow" | "green";

export interface CountingSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface Round {
  bears: BearColor[];
  targetColor: BearColor;
  correctCount: number;
  choices: number[];
}

export interface CountingState {
  settings: CountingSettings;
  rngSeed: number;
  round: Round;
  roundNum: number;
  totalRounds: number;
  score: number;
  lastCorrect: boolean | null;
  message: string;
  done: boolean;
}

export type CountingAction = { type: "pick"; value: number };

const COLORS: BearColor[] = ["red", "blue", "yellow", "green"];
const COLOR_LABELS: Record<BearColor, string> = { red: "Red", blue: "Blue", yellow: "Yellow", green: "Green" };

function makeRound(seed: number, difficulty: "easy" | "medium" | "hard"): { round: Round; nextSeed: number } {
  const rng = mulberry32(seed);
  const maxBears = difficulty === "easy" ? 6 : difficulty === "medium" ? 10 : 15;
  const targetColor = COLORS[Math.floor(rng() * COLORS.length)]!;

  const totalBears = 4 + Math.floor(rng() * (maxBears - 3));
  const bears: BearColor[] = [];
  for (let i = 0; i < totalBears; i++) {
    bears.push(COLORS[Math.floor(rng() * COLORS.length)]!);
  }
  const correctCount = bears.filter(b => b === targetColor).length;

  // Generate 3 choices + correct answer, deduplicated
  const choiceSet = new Set<number>([correctCount]);
  while (choiceSet.size < 4) {
    const delta = Math.floor(rng() * 4) + 1;
    const candidate = correctCount + (rng() < 0.5 ? delta : -delta);
    if (candidate >= 0 && candidate <= maxBears) choiceSet.add(candidate);
  }
  const choices = Array.from(choiceSet).sort((a, b) => a - b);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { round: { bears, targetColor, correctCount, choices }, nextSeed };
}

export function initialState(seed: number, settings: CountingSettings): CountingState {
  const totalRounds = 5;
  const { round, nextSeed } = makeRound(seed, settings.difficulty);
  return {
    settings,
    rngSeed: nextSeed,
    round,
    roundNum: 1,
    totalRounds,
    score: 0,
    lastCorrect: null,
    message: `How many ${COLOR_LABELS[round.targetColor]} bears do you see?`,
    done: false,
  };
}

export function reducer(state: CountingState, action: CountingAction): CountingState {
  if (state.done) return state;
  if (action.type !== "pick") return state;

  const correct = action.value === state.round.correctCount;
  const score = state.score + (correct ? 20 : 0);

  if (state.roundNum >= state.totalRounds) {
    return {
      ...state,
      score,
      lastCorrect: correct,
      message: correct
        ? `Correct! Final score: ${score}/100 — Well done!`
        : `It was ${state.round.correctCount}. Final score: ${score}/100.`,
      done: true,
    };
  }

  const { round, nextSeed } = makeRound(state.rngSeed, state.settings.difficulty);
  return {
    ...state,
    rngSeed: nextSeed,
    round,
    roundNum: state.roundNum + 1,
    score,
    lastCorrect: correct,
    message: correct
      ? `Correct! How many ${COLOR_LABELS[round.targetColor]} bears?`
      : `Oops! It was ${state.round.correctCount}. How many ${COLOR_LABELS[round.targetColor]} bears?`,
  };
}

export function isTerminal(state: CountingState): { score: number } | null {
  if (!state.done) return null;
  return { score: state.score };
}

export { COLOR_LABELS };
