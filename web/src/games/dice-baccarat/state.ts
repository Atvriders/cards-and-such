import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Baccarat: 10 rounds. Player bets player/banker/tie before rolls.
// Roll 2 dice for player, 2 dice for banker. Compare sums (mod 10 to mimic baccarat) — higher mod-10 wins.
// Player win on player bet = +10. Banker win on banker bet = +10. Tie on tie bet = +30.

export const TOTAL_ROUNDS = 10;
export type DBChoice = "player" | "banker" | "tie";

export interface DiceBaccaratSettings { dummy: boolean; }

export interface DiceBaccaratState {
  rngSeed: number;
  round: number;
  bet: DBChoice | null;
  player: [number, number] | null;
  banker: [number, number] | null;
  pSum: number;
  bSum: number;
  result: "player" | "banker" | "tie" | null;
  score: number;
  phase: "betting" | "result" | "done";
  lastPts: number;
}

export type DiceBaccaratAction = { type: "bet"; choice: DBChoice } | { type: "next" };

export function initialState(seed: number, _settings: DiceBaccaratSettings): DiceBaccaratState {
  return { rngSeed: seed, round: 1, bet: null, player: null, banker: null, pSum: 0, bSum: 0, result: null, score: 0, phase: "betting", lastPts: 0 };
}

export function reducer(state: DiceBaccaratState, action: DiceBaccaratAction): DiceBaccaratState {
  if (state.phase === "done") return state;
  if (action.type === "bet") {
    if (state.phase !== "betting") return state;
    const rng = mulberry32(state.rngSeed);
    const p1 = 1 + Math.floor(rng() * 6);
    const p2 = 1 + Math.floor(rng() * 6);
    const b1 = 1 + Math.floor(rng() * 6);
    const b2 = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pSum = (p1 + p2) % 10;
    const bSum = (b1 + b2) % 10;
    let result: "player" | "banker" | "tie";
    if (pSum > bSum) result = "player";
    else if (bSum > pSum) result = "banker";
    else result = "tie";
    let pts = 0;
    if (action.choice === result) {
      pts = action.choice === "tie" ? 30 : 10;
    }
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, bet: action.choice, player: [p1, p2], banker: [b1, b2], pSum, bSum, result, score: state.score + pts, phase: isLast ? "done" : "result", lastPts: pts };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, bet: null, player: null, banker: null, pSum: 0, bSum: 0, result: null, phase: "betting", lastPts: 0 };
  }
  return state;
}

export function isTerminal(state: DiceBaccaratState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
