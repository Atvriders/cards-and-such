import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DicePredictionSettings {
  rounds: "5" | "10" | "15";
}

export type DieFace = 1 | 2 | 3 | 4 | 5 | 6;

export interface DiceRound {
  prediction: DieFace | null;
  result: DieFace | null;
  correct: boolean;
}

export interface DicePredictionState {
  settings: DicePredictionSettings;
  rngSeed: number;
  totalRounds: number;
  rounds: DiceRound[];
  currentRound: number;
  score: number;
  gameOver: boolean;
}

export type DicePredictionAction =
  | { type: "predict"; face: DieFace }
  | { type: "roll" };

function rollDie(seed: number, roll: number): DieFace {
  const rng = mulberry32(seed + roll * 31337);
  return (Math.floor(rng() * 6) + 1) as DieFace;
}

export function initialState(seed: number, settings: DicePredictionSettings): DicePredictionState {
  const totalRounds = parseInt(settings.rounds, 10);
  const rounds: DiceRound[] = Array.from({ length: totalRounds }, () => ({
    prediction: null,
    result: null,
    correct: false,
  }));
  return {
    settings,
    rngSeed: seed >>> 0,
    totalRounds,
    rounds,
    currentRound: 0,
    score: 0,
    gameOver: false,
  };
}

export function reducer(state: DicePredictionState, action: DicePredictionAction): DicePredictionState {
  if (state.gameOver) return state;

  const round = state.rounds[state.currentRound];
  if (!round) return state;

  if (action.type === "predict") {
    if (round.prediction !== null) return state; // already predicted
    const updatedRound: DiceRound = { ...round, prediction: action.face };
    const rounds = [...state.rounds];
    rounds[state.currentRound] = updatedRound;
    return { ...state, rounds };
  }

  if (action.type === "roll") {
    if (round.prediction === null) return state; // need prediction first
    if (round.result !== null) {
      // Advance to next round
      const next = state.currentRound + 1;
      const gameOver = next >= state.totalRounds;
      return { ...state, currentRound: gameOver ? state.currentRound : next, gameOver };
    }

    const result = rollDie(state.rngSeed, state.currentRound);
    const correct = result === round.prediction;
    const updatedRound: DiceRound = { ...round, result, correct };
    const rounds = [...state.rounds];
    rounds[state.currentRound] = updatedRound;
    const score = state.score + (correct ? 100 : 0);
    return { ...state, rounds, score };
  }

  return state;
}

export function isTerminal(state: DicePredictionState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.score };
}
