import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type QCPhase = "idle" | "showing" | "input" | "result" | "done";
export type Difficulty = "easy" | "medium" | "hard";

const RANGES: Record<Difficulty, { min: number; max: number; showMs: number }> = {
  easy:   { min: 1,  max: 20,  showMs: 1500 },
  medium: { min: 20, max: 50,  showMs: 1000 },
  hard:   { min: 50, max: 100, showMs: 700  },
};

export interface QuickCountingState {
  settings: { difficulty: Difficulty };
  phase: QCPhase;
  target: number;
  playerInput: string;
  round: number;
  totalRounds: number;
  score: number;
  lastCorrect: boolean | null;
  showMs: number;
  rngSeed: number;
  rngCounter: number;
}

export type QCAction =
  | { type: "start" }
  | { type: "reveal" }
  | { type: "type-digit"; digit: string }
  | { type: "backspace" }
  | { type: "submit" }
  | { type: "next" };

function generateTarget(seed: number, counter: number, difficulty: Difficulty): number {
  const rng = mulberry32(seed + counter * 999983);
  const { min, max } = RANGES[difficulty];
  return min + Math.floor(rng() * (max - min + 1));
}

export function initialState(
  seed: number,
  settings: { difficulty: Difficulty },
): QuickCountingState {
  return {
    settings,
    phase: "idle",
    target: 0,
    playerInput: "",
    round: 0,
    totalRounds: 10,
    score: 0,
    lastCorrect: null,
    showMs: RANGES[settings.difficulty].showMs,
    rngSeed: seed,
    rngCounter: 0,
  };
}

export function reducer(state: QuickCountingState, action: QCAction): QuickCountingState {
  switch (action.type) {
    case "start": {
      if (state.phase !== "idle" && state.phase !== "done") return state;
      const target = generateTarget(state.rngSeed, state.rngCounter, state.settings.difficulty);
      return {
        ...state,
        phase: "showing",
        target,
        playerInput: "",
        round: 1,
        score: 0,
        lastCorrect: null,
        showMs: RANGES[state.settings.difficulty].showMs,
        rngCounter: state.rngCounter + 1,
      };
    }

    case "reveal": {
      if (state.phase !== "showing") return state;
      return { ...state, phase: "input", playerInput: "" };
    }

    case "type-digit": {
      if (state.phase !== "input") return state;
      if (state.playerInput.length >= 3) return state;
      return { ...state, playerInput: state.playerInput + action.digit };
    }

    case "backspace": {
      if (state.phase !== "input") return state;
      return { ...state, playerInput: state.playerInput.slice(0, -1) };
    }

    case "submit": {
      if (state.phase !== "input" || !state.playerInput) return state;
      const guessed = parseInt(state.playerInput, 10);
      const correct = guessed === state.target;
      return {
        ...state,
        phase: "result",
        lastCorrect: correct,
        score: state.score + (correct ? 10 : 0),
      };
    }

    case "next": {
      if (state.phase !== "result") return state;
      if (state.round >= state.totalRounds) {
        return { ...state, phase: "done" };
      }
      const target = generateTarget(state.rngSeed, state.rngCounter, state.settings.difficulty);
      return {
        ...state,
        phase: "showing",
        target,
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

export function isTerminal(state: QuickCountingState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.score };
}

export function getShowMs(settings: { difficulty: Difficulty }): number {
  return RANGES[settings.difficulty].showMs;
}
