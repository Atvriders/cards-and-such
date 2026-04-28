import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface TowerOfHanoiMiniSettings { discs: "3" | "4" | "5"; }

export interface TowerOfHanoiMiniState {
  pegs: number[][]; // 3 pegs of disc sizes (small=1 to large=N)
  discs: number;
  moves: number;
  selected: number | null; // peg index 0..2
  phase: "playing" | "done";
}

export type TowerOfHanoiMiniAction =
  | { type: "tap"; peg: number }
  | { type: "reset" };

export function initialState(seed: number, settings: TowerOfHanoiMiniSettings): TowerOfHanoiMiniState {
  // mulberry32 just to avoid unused-import concerns
  mulberry32(seed)();
  const n = parseInt(settings.discs, 10);
  const pegs: number[][] = [[], [], []];
  for (let i = n; i >= 1; i--) pegs[0]!.push(i);
  return { pegs, discs: n, moves: 0, selected: null, phase: "playing" };
}

function topOf(p: number[]): number | undefined { return p[p.length - 1]; }

export function reducer(state: TowerOfHanoiMiniState, action: TowerOfHanoiMiniAction): TowerOfHanoiMiniState {
  if (state.phase === "done") return state;
  if (action.type === "reset") {
    const pegs: number[][] = [[], [], []];
    for (let i = state.discs; i >= 1; i--) pegs[0]!.push(i);
    return { ...state, pegs, moves: 0, selected: null, phase: "playing" };
  }
  if (action.type === "tap") {
    if (state.selected === null) {
      const src = state.pegs[action.peg]!;
      if (src.length === 0) return state;
      return { ...state, selected: action.peg };
    }
    const from = state.selected;
    const to = action.peg;
    if (from === to) return { ...state, selected: null };
    const src = state.pegs[from]!;
    const dst = state.pegs[to]!;
    const moving = topOf(src);
    if (moving === undefined) return { ...state, selected: null };
    const tDest = topOf(dst);
    if (tDest !== undefined && moving > tDest) return { ...state, selected: null };
    const newPegs = state.pegs.map((p, i) => (i === from ? p.slice(0, -1) : i === to ? [...p, moving] : [...p]));
    const moves = state.moves + 1;
    const phase: "playing" | "done" = newPegs[2]!.length === state.discs ? "done" : "playing";
    return { ...state, pegs: newPegs, moves, selected: null, phase };
  }
  return state;
}

export function isTerminal(state: TowerOfHanoiMiniState): { score: number } | null {
  if (state.phase !== "done") return null;
  const optimal = (1 << state.discs) - 1;
  return { score: Math.max(50, 500 - (state.moves - optimal) * 20) };
}
