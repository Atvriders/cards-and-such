import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Twin Bet: Roll 2 dice. Bet before roll whether they will MATCH (both same face).
// Match = rare ~1/6 chance. Correct MATCH bet = 50pts. Correct NO MATCH bet = 15pts.
// Wrong bet = 0pts. 10 rounds.

export interface DiceTwinBetSettings { rounds: "8" | "10" | "12"; }

export interface DiceTwinBetState {
  round: number;
  maxRounds: number;
  dice: [number, number] | null;
  bet: "match" | "nomatch" | null;
  result: "correct" | "wrong" | null;
  score: number;
  phase: "betting" | "reveal" | "gameover";
  rngSeed: number;
}

export type DiceTwinBetAction =
  | { type: "bet"; call: "match" | "nomatch" }
  | { type: "next" };

function roll2(seed: number): { dice: [number, number]; nextSeed: number } {
  const rng = mulberry32(seed);
  const d1 = Math.floor(rng() * 6) + 1;
  const d2 = Math.floor(rng() * 6) + 1;
  return { dice: [d1, d2], nextSeed: Math.floor(rng() * 2 ** 31) };
}

export function initialState(seed: number, settings: DiceTwinBetSettings): DiceTwinBetState {
  return { round: 1, maxRounds: parseInt(settings.rounds, 10), dice: null, bet: null, result: null, score: 0, phase: "betting", rngSeed: seed };
}

export function reducer(state: DiceTwinBetState, action: DiceTwinBetAction): DiceTwinBetState {
  if (state.phase === "gameover") return state;
  if (action.type === "bet") {
    if (state.phase !== "betting") return state;
    const { dice, nextSeed } = roll2(state.rngSeed);
    const isMatch = dice[0] === dice[1];
    const correctCall = (action.call === "match") === isMatch;
    const pts = correctCall ? (isMatch ? 50 : 15) : 0;
    const phase = state.round >= state.maxRounds ? "gameover" : "reveal";
    return { ...state, bet: action.call, dice, result: correctCall ? "correct" : "wrong", score: state.score + pts, phase, rngSeed: nextSeed };
  }
  if (action.type === "next") {
    if (state.phase !== "reveal") return state;
    return { ...state, round: state.round + 1, dice: null, bet: null, result: null, phase: "betting" };
  }
  return state;
}

export function isTerminal(state: DiceTwinBetState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
