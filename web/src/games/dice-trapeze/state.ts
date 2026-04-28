import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 10;

export interface DiceTrapezeSettings { dummy: boolean; }

export type DiceTrapezeChoice = "Differ" | "Match";

export const OPTIONS: { label: DiceTrapezeChoice; points: number; win: (a: number, b: number) => boolean }[] = [
  { label: "Differ", points: 10, win: (a: number, b: number) => a !== b },
  { label: "Match", points: 30, win: (a: number, b: number) => a === b },
];

export interface DiceTrapezeState {
  rngSeed: number;
  round: number;
  choice: DiceTrapezeChoice | null;
  dice: [number, number] | null;
  score: number;
  lastWin: boolean;
  lastPts: number;
  phase: "predict" | "result" | "done";
}

export type DiceTrapezeAction = { type: "predict"; choice: DiceTrapezeChoice } | { type: "next" };

export function initialState(seed: number, _settings: DiceTrapezeSettings): DiceTrapezeState {
  return { rngSeed: seed, round: 1, choice: null, dice: null, score: 0, lastWin: false, lastPts: 0, phase: "predict" };
}

export function reducer(state: DiceTrapezeState, action: DiceTrapezeAction): DiceTrapezeState {
  if (state.phase === "done") return state;
  if (action.type === "predict") {
    if (state.phase !== "predict") return state;
    const opt = OPTIONS.find(o => o.label === action.choice);
    if (!opt) return state;
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6);
    const b = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const win = opt.win(a, b);
    const pts = win ? opt.points : 0;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, choice: action.choice, dice: [a, b], score: state.score + pts, lastWin: win, lastPts: pts, phase: isLast ? "done" : "result" };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, choice: null, dice: null, lastWin: false, lastPts: 0, phase: "predict" };
  }
  return state;
}

export function isTerminal(state: DiceTrapezeState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
