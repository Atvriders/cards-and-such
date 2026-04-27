import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Flush Mini: Roll 5 dice. Bonus for 3+ same.
// 8 rounds. Score: 30 base + bonuses (3 same: +50, 4 same: +120, 5 same: +250).

export const TOTAL_ROUNDS = 8;

export interface DiceFlushMiniSettings { dummy: boolean; }

export interface DiceFlushMiniState {
  rngSeed: number;
  round: number;
  dice: [number, number, number, number, number] | null;
  score: number;
  lastPts: number;
  lastBonus: string;
  phase: "rolling" | "scored" | "done";
}

export type DiceFlushMiniAction = { type: "roll" } | { type: "next" };

export function bonusFor(dice: number[]): { pts: number; label: string } {
  const counts: Record<number, number> = {};
  for (const d of dice) counts[d] = (counts[d] ?? 0) + 1;
  const max = Math.max(...Object.values(counts));
  if (max === 5) return { pts: 280, label: "5 of a kind!" };
  if (max === 4) return { pts: 150, label: "4 of a kind" };
  if (max === 3) return { pts: 80, label: "3 of a kind" };
  return { pts: 30, label: "no match" };
}

export function initialState(seed: number, _settings: DiceFlushMiniSettings): DiceFlushMiniState {
  return { rngSeed: seed, round: 1, dice: null, score: 0, lastPts: 0, lastBonus: "", phase: "rolling" };
}

export function reducer(state: DiceFlushMiniState, action: DiceFlushMiniAction): DiceFlushMiniState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < 5; i++) dice.push(1 + Math.floor(rng() * 6));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const { pts, label } = bonusFor(dice);
    const isLast = state.round >= TOTAL_ROUNDS;
    return {
      ...state,
      rngSeed: nextSeed,
      dice: dice as [number, number, number, number, number],
      score: state.score + pts,
      lastPts: pts,
      lastBonus: label,
      phase: isLast ? "done" : "scored",
    };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, dice: null, lastPts: 0, lastBonus: "", phase: "rolling" };
  }
  return state;
}

export function isTerminal(state: DiceFlushMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
