import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Pair Pursuit: 10 rounds. Each round, roll 4 dice.
// Score per round: best matched group:
//   4 of a kind  +100
//   3 of a kind  +50
//   one pair     +20
//   no match     +0
// Two pairs counted as +20 (best single match).

export const TOTAL_ROUNDS = 10;

export interface PairPursuitSettings { dummy: boolean; }

export interface PairPursuitState {
  rngSeed: number;
  round: number;
  dice: number[];
  score: number;
  phase: "ready" | "rolled" | "done";
  lastPts: number;
}

export type PairPursuitAction = { type: "roll" } | { type: "next" };

export function bestMatch(dice: number[]): { pts: number; label: string } {
  const counts = new Map<number, number>();
  for (const d of dice) counts.set(d, (counts.get(d) ?? 0) + 1);
  const best = Math.max(...Array.from(counts.values()));
  if (best >= 4) return { pts: 100, label: "Four of a kind! +100" };
  if (best === 3) return { pts: 50, label: "Three of a kind! +50" };
  if (best === 2) return { pts: 20, label: "Pair! +20" };
  return { pts: 0, label: "No match" };
}

export function initialState(seed: number, _settings: PairPursuitSettings): PairPursuitState {
  return { rngSeed: seed, round: 1, dice: [], score: 0, phase: "ready", lastPts: 0 };
}

export function reducer(state: PairPursuitState, action: PairPursuitAction): PairPursuitState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "ready") return state;
    const rng = mulberry32(state.rngSeed);
    const dice = Array.from({ length: 4 }, () => 1 + Math.floor(rng() * 6));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const { pts } = bestMatch(dice);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dice, score: state.score + pts, phase: isLast ? "done" : "rolled", lastPts: pts };
  }
  if (action.type === "next") {
    if (state.phase !== "rolled") return state;
    return { ...state, round: state.round + 1, dice: [], phase: "ready", lastPts: 0 };
  }
  return state;
}

export function isTerminal(state: PairPursuitState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
