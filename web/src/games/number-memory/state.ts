import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type Phase = "idle" | "showing" | "input" | "result" | "done";
export type Difficulty = "3" | "5" | "7" | "9";

export interface NumberMemoryState {
  settings: { difficulty: Difficulty };
  phase: Phase;
  currentNumber: string;
  playerInput: string;
  round: number;
  maxRound: number;
  correctStreak: number;
  bestStreak: number;
  score: number;
  lastCorrect: boolean | null;
  rngSeed: number;
  rngCounter: number;
}

export type NumberMemoryAction =
  | { type: "start" }
  | { type: "reveal" }
  | { type: "type-digit"; digit: string }
  | { type: "backspace" }
  | { type: "submit" }
  | { type: "next" };

function generateNumber(seed: number, counter: number, digits: number): string {
  const rng = mulberry32(seed + counter * 999983);
  // First digit 1-9, rest 0-9
  let num = String(Math.floor(rng() * 9) + 1);
  for (let i = 1; i < digits; i++) {
    num += String(Math.floor(rng() * 10));
  }
  return num;
}

export function initialState(
  seed: number,
  settings: { difficulty: Difficulty },
): NumberMemoryState {
  return {
    settings,
    phase: "idle",
    currentNumber: "",
    playerInput: "",
    round: 0,
    maxRound: 10,
    correctStreak: 0,
    bestStreak: 0,
    score: 0,
    lastCorrect: null,
    rngSeed: seed,
    rngCounter: 0,
  };
}

export function reducer(
  state: NumberMemoryState,
  action: NumberMemoryAction,
): NumberMemoryState {
  switch (action.type) {
    case "start": {
      if (state.phase !== "idle" && state.phase !== "done") return state;
      const digits = parseInt(state.settings.difficulty, 10);
      const num = generateNumber(state.rngSeed, state.rngCounter, digits);
      return {
        ...state,
        phase: "showing",
        currentNumber: num,
        playerInput: "",
        round: 1,
        correctStreak: 0,
        score: 0,
        lastCorrect: null,
        rngCounter: state.rngCounter + 1,
      };
    }

    case "reveal": {
      if (state.phase !== "showing") return state;
      return { ...state, phase: "input", playerInput: "" };
    }

    case "type-digit": {
      if (state.phase !== "input") return state;
      if (state.playerInput.length >= state.currentNumber.length) return state;
      return { ...state, playerInput: state.playerInput + action.digit };
    }

    case "backspace": {
      if (state.phase !== "input") return state;
      return { ...state, playerInput: state.playerInput.slice(0, -1) };
    }

    case "submit": {
      if (state.phase !== "input") return state;
      if (state.playerInput.length < state.currentNumber.length) return state;
      const correct = state.playerInput === state.currentNumber;
      const newStreak = correct ? state.correctStreak + 1 : 0;
      const newBest = Math.max(state.bestStreak, newStreak);
      const roundScore = correct ? parseInt(state.settings.difficulty, 10) * 10 : 0;
      return {
        ...state,
        phase: "result",
        lastCorrect: correct,
        correctStreak: newStreak,
        bestStreak: newBest,
        score: state.score + roundScore,
      };
    }

    case "next": {
      if (state.phase !== "result") return state;
      if (state.round >= state.maxRound) {
        return { ...state, phase: "done" };
      }
      const digits = parseInt(state.settings.difficulty, 10);
      const num = generateNumber(state.rngSeed, state.rngCounter, digits);
      return {
        ...state,
        phase: "showing",
        currentNumber: num,
        playerInput: "",
        round: state.round + 1,
        lastCorrect: null,
        rngCounter: state.rngCounter + 1,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: NumberMemoryState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.score + state.bestStreak * 5 };
}
