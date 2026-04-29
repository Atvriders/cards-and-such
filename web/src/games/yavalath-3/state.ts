import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const SIZE = 5;
export const MAX_MOVES = 14;
export interface Yavalath3Settings { dummy: boolean; }
export type Cell = "P" | "C" | null;
export interface Yavalath3State {
  rngSeed: number;
  board: Cell[];
  turn: "P" | "C";
  moves: number;
  result: "P" | "C" | "draw" | null;
  score: number;
  phase: "playing" | "done";
}
export type Yavalath3Action = { type: "place"; idx: number };
export function initialState(seed: number, _settings: Yavalath3Settings): Yavalath3State {
  return { rngSeed: seed, board: Array(SIZE * SIZE).fill(null), turn: "P", moves: 0, result: null, score: 0, phase: "playing" };
}
export function reducer(state: Yavalath3State, action: Yavalath3Action): Yavalath3State {
  if (state.phase === "done" || state.result) return state;
  if (action.type !== "place") return state;
  if (state.turn !== "P") return state;
  if (action.idx < 0 || action.idx >= SIZE*SIZE) return state;
  if (state.board[action.idx] !== null) return state;
  const nb = state.board.slice();
  nb[action.idx] = "P";
  let moves = state.moves + 1;
  const rng = mulberry32(state.rngSeed);
  const empty: number[] = [];
  for (let i = 0; i < nb.length; i++) if (nb[i] === null) empty.push(i);
  if (empty.length > 0) {
    const pick = empty[Math.floor(rng() * empty.length)]!;
    nb[pick] = "C";
    moves++;
  }
  const seed2 = Math.floor(rng() * 2 ** 31);
  if (moves >= MAX_MOVES || nb.every(c => c !== null)) {
    const pCount = nb.filter(c => c === "P").length;
    const cCount = nb.filter(c => c === "C").length;
    let result: "P" | "C" | "draw" = "draw";
    let score = state.score;
    if (pCount > cCount) { result = "P"; score = state.score + 100; }
    else if (cCount > pCount) { result = "C"; score = Math.max(0, state.score); }
    else { score = state.score + 25; }
    return { ...state, rngSeed: seed2, board: nb, moves, result, score, phase: "done" };
  }
  return { ...state, rngSeed: seed2, board: nb, moves, turn: "P" };
}
export function isTerminal(state: Yavalath3State): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
