import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DiceUpDownGameSettings { rounds: "5" | "10" | "15"; }
export interface DiceUpDownGameState {
  settings: DiceUpDownGameSettings;
  rng: () => number;
  currentRoll: number;
  streak: number;
  direction: "up" | "down" | null;
  prevRoll: number | null;
  score: number;
  round: number;
  totalRounds: number;
  lastCorrect: boolean | null;
  phase: "playing" | "gameover";
}
export type DiceUpDownGameAction = { type: "guess"; dir: "up" | "down" };

export function initialState(seed: number, settings: DiceUpDownGameSettings): DiceUpDownGameState {
  const rng = mulberry32(seed);
  const currentRoll = Math.floor(rng() * 6) + 1;
  return { settings, rng, currentRoll, streak: 0, direction: null, prevRoll: null, score: 0, round: 1, totalRounds: parseInt(settings.rounds, 10), lastCorrect: null, phase: "playing" };
}

export function reducer(state: DiceUpDownGameState, action: DiceUpDownGameAction): DiceUpDownGameState {
  if (state.phase === "gameover") return state;
  if (action.type !== "guess") return state;
  const rng = state.rng;
  const nextRoll = Math.floor(rng() * 6) + 1;
  const correct = (action.dir === "up" && nextRoll > state.currentRoll) || (action.dir === "down" && nextRoll < state.currentRoll);
  const streak = correct ? state.streak + 1 : 0;
  const pts = correct ? 5 + streak * 2 : 0;
  const nextRound = state.round + 1;
  const phase = nextRound > state.totalRounds ? "gameover" : "playing";
  return { ...state, rng, prevRoll: state.currentRoll, currentRoll: nextRoll, streak, direction: action.dir, score: state.score + pts, round: nextRound, lastCorrect: correct, phase };
}

export function isTerminal(state: DiceUpDownGameState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
