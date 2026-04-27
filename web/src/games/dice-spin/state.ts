import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Dice Spin: Bet over/under/equal with target=7. 2 dice. Over (sum>7) wins +10. Under (sum<7) wins +10. Equal (sum=7) wins +30.
// 10 rounds.
export const TOTAL_ROUNDS = 10;
export interface DiceSpinSettings { dummy: boolean; }
export interface DiceSpinState {
  rngSeed: number;
  round: number;
  bet: "over" | "under" | "equal" | null;
  dice: [number, number] | null;
  score: number;
  phase: "betting" | "result" | "done";
  lastWin: number;
}
export type DiceSpinAction = { type: "bet"; choice: "over" | "under" | "equal" } | { type: "next" };
export function initialState(seed: number, _settings: DiceSpinSettings): DiceSpinState {
  return { rngSeed: seed, round: 1, bet: null, dice: null, score: 0, phase: "betting", lastWin: 0 };
}
export function reducer(state: DiceSpinState, action: DiceSpinAction): DiceSpinState {
  if (state.phase === "done") return state;
  if (action.type === "bet" && state.phase === "betting") {
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6);
    const b = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const sum = a + b;
    let win = 0;
    if (action.choice === "over" && sum > 7) win = 10;
    else if (action.choice === "under" && sum < 7) win = 10;
    else if (action.choice === "equal" && sum === 7) win = 30;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, bet: action.choice, dice: [a, b], score: state.score + win, phase: isLast ? "done" : "result", lastWin: win };
  }
  if (action.type === "next" && state.phase === "result") {
    return { ...state, round: state.round + 1, bet: null, dice: null, phase: "betting", lastWin: 0 };
  }
  return state;
}
export function isTerminal(state: DiceSpinState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
