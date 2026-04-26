import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DiceLowRollSettings { rounds: "10" | "20"; }
export interface DiceLowRollState {
  rngSeed: number; dice: number[] | null; coins: number;
  round: number; maxRounds: number; phase: "betting" | "result" | "gameover";
  bet: number; lastWin: boolean | null;
}
export type DiceLowRollAction = { type: "bet"; amount: number } | { type: "next" };

export function initialState(seed: number, settings: DiceLowRollSettings): DiceLowRollState {
  const rng = mulberry32(seed);
  return { rngSeed: Math.floor(rng() * 2 ** 31), dice: null, coins: 100, round: 1, maxRounds: parseInt(settings.rounds, 10), phase: "betting", bet: 0, lastWin: null };
}

export function reducer(state: DiceLowRollState, action: DiceLowRollAction): DiceLowRollState {
  if (state.phase === "gameover") return state;
  if (action.type === "bet") {
    if (state.phase !== "betting") return state;
    const rng = mulberry32(state.rngSeed);
    const d1 = Math.floor(rng() * 6) + 1;
    const d2 = Math.floor(rng() * 6) + 1;
    const d3 = Math.floor(rng() * 6) + 1;
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const sum = d1 + d2 + d3;
    const win = sum <= 9; // low is <= 9
    const amount = Math.max(1, Math.min(action.amount, state.coins));
    const newCoins = state.coins + (win ? amount : -amount);
    const done = state.round >= state.maxRounds || newCoins <= 0;
    return { ...state, dice: [d1,d2,d3], bet: amount, lastWin: win, coins: Math.max(0, newCoins), rngSeed: nextSeed, phase: done ? "gameover" : "result" };
  }
  if (action.type === "next" && state.phase === "result") {
    return { ...state, dice: null, round: state.round + 1, lastWin: null, phase: "betting" };
  }
  return state;
}

export function isTerminal(state: DiceLowRollState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.coins } : null;
}
