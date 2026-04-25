import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Mirror Roll: Roll a die. Then predict: will the NEXT roll be HIGHER, LOWER, or SAME?
// Correct HIGH/LOW = 25pts. Correct SAME = 60pts (1/6 chance). Wrong = 0. 10 rounds.

export interface DiceMirrorRollSettings { rounds: "8" | "10" | "12"; }

export interface DiceMirrorRollState {
  round: number;
  maxRounds: number;
  currentDie: number;
  nextDie: number | null;
  bet: "higher" | "lower" | "same" | null;
  result: "correct" | "wrong" | null;
  lastPts: number;
  score: number;
  phase: "betting" | "reveal" | "gameover";
  rngSeed: number;
}

export type DiceMirrorRollAction =
  | { type: "bet"; call: "higher" | "lower" | "same" }
  | { type: "next" };

function rollDie(seed: number): { value: number; nextSeed: number } {
  const rng = mulberry32(seed);
  return { value: Math.floor(rng() * 6) + 1, nextSeed: Math.floor(rng() * 2 ** 31) };
}

export function initialState(seed: number, settings: DiceMirrorRollSettings): DiceMirrorRollState {
  const { value, nextSeed } = rollDie(seed);
  return { round: 1, maxRounds: parseInt(settings.rounds, 10), currentDie: value, nextDie: null, bet: null, result: null, lastPts: 0, score: 0, phase: "betting", rngSeed: nextSeed };
}

export function reducer(state: DiceMirrorRollState, action: DiceMirrorRollAction): DiceMirrorRollState {
  if (state.phase === "gameover") return state;
  if (action.type === "bet") {
    if (state.phase !== "betting") return state;
    const { value: nextDie, nextSeed } = rollDie(state.rngSeed);
    const actual: "higher" | "lower" | "same" = nextDie > state.currentDie ? "higher" : nextDie < state.currentDie ? "lower" : "same";
    const correct = action.call === actual;
    const pts = correct ? (action.call === "same" ? 60 : 25) : 0;
    const phase = state.round >= state.maxRounds ? "gameover" : "reveal";
    return { ...state, bet: action.call, nextDie, result: correct ? "correct" : "wrong", lastPts: pts, score: state.score + pts, phase, rngSeed: nextSeed };
  }
  if (action.type === "next") {
    if (state.phase !== "reveal") return state;
    return { ...state, round: state.round + 1, currentDie: state.nextDie!, nextDie: null, bet: null, result: null, lastPts: 0, phase: "betting" };
  }
  return state;
}

export function isTerminal(state: DiceMirrorRollState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
