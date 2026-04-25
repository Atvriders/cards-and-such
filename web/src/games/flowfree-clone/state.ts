import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface ColorFlowSettings {
  difficulty: "easy" | "medium" | "hard";
}

export type FlowColor = "red" | "blue" | "green" | "yellow" | "maroon";

// Hardcoded puzzles per difficulty
// Each puzzle: { size, endpoints: [color, r1, c1, r2, c2][] }
const EASY_PUZZLES = [
  { size: 5, endpoints: [["red",0,0,4,4],["blue",0,4,4,0],["green",0,2,4,2],["yellow",2,0,2,4]] as [FlowColor,number,number,number,number][] },
  { size: 5, endpoints: [["red",0,0,2,2],["blue",4,4,2,2],["green",0,4,4,0],["yellow",1,0,3,4]] as [FlowColor,number,number,number,number][] },
];
const MEDIUM_PUZZLES = [
  { size: 6, endpoints: [["red",0,0,5,5],["blue",0,5,5,0],["green",0,3,5,3],["yellow",3,0,3,5],["maroon",1,1,4,4]] as [FlowColor,number,number,number,number][] },
  { size: 6, endpoints: [["red",0,1,5,4],["blue",0,4,5,1],["green",1,0,4,5],["yellow",1,5,4,0],["maroon",2,2,3,3]] as [FlowColor,number,number,number,number][] },
];
const HARD_PUZZLES = [
  { size: 7, endpoints: [["red",0,0,6,6],["blue",0,6,6,0],["green",0,3,6,3],["yellow",3,0,3,6],["maroon",1,1,5,5]] as [FlowColor,number,number,number,number][] },
  { size: 7, endpoints: [["red",0,2,6,4],["blue",0,4,6,2],["green",2,0,4,6],["yellow",2,6,4,0],["maroon",3,3,0,0]] as [FlowColor,number,number,number,number][] },
];

export interface ColorFlowState {
  settings: ColorFlowSettings;
  size: number;
  endpoints: Record<string, FlowColor>; // "r,c" -> color
  paths: Record<string, string[]>;       // color -> list of "r,c"
  activeColor: FlowColor | null;
  won: boolean;
  movesMade: number;
}

export type ColorFlowAction =
  | { type: "start"; row: number; col: number }
  | { type: "extend"; row: number; col: number }
  | { type: "release" };

function key(r: number, c: number): string { return `${r},${c}`; }

export function initialState(seed: number, settings: ColorFlowSettings): ColorFlowState {
  const rng = mulberry32(seed);
  const pool = settings.difficulty === "easy" ? EASY_PUZZLES :
               settings.difficulty === "medium" ? MEDIUM_PUZZLES : HARD_PUZZLES;
  const puzzle = pool[Math.floor(rng() * pool.length)]!;

  const endpoints: Record<string, FlowColor> = {};
  const paths: Record<string, string[]> = {};
  for (const [color, r1, c1, r2, c2] of puzzle.endpoints) {
    endpoints[key(r1, c1)] = color;
    endpoints[key(r2, c2)] = color;
    paths[color] = [];
  }

  return {
    settings,
    size: puzzle.size,
    endpoints,
    paths,
    activeColor: null,
    won: false,
    movesMade: 0,
  };
}

function isAdjacent(k: string, r: number, c: number): boolean {
  const [ar, ac] = k.split(",").map(Number) as [number, number];
  return Math.abs(ar - r) + Math.abs(ac - c) === 1;
}

function checkWon(state: ColorFlowState): boolean {
  const colors = new Set(Object.values(state.endpoints));
  for (const color of colors) {
    const path = state.paths[color] ?? [];
    if (path.length < 2) return false;
    const eps = Object.entries(state.endpoints).filter(([,c]) => c === color).map(([k]) => k);
    if (!path.includes(eps[0]!) || !path.includes(eps[1]!)) return false;
  }
  const filled = new Set<string>();
  for (const p of Object.values(state.paths)) for (const k of p) filled.add(k);
  return filled.size === state.size * state.size;
}

export function reducer(state: ColorFlowState, action: ColorFlowAction): ColorFlowState {
  if (state.won) return state;

  if (action.type === "start") {
    const { row, col } = action;
    const color = state.endpoints[key(row, col)];
    if (!color) return state;
    return {
      ...state,
      paths: { ...state.paths, [color]: [key(row, col)] },
      activeColor: color,
      movesMade: state.movesMade + 1,
    };
  }

  if (action.type === "extend") {
    if (!state.activeColor) return state;
    const { row, col } = action;
    const color = state.activeColor;
    const path = state.paths[color] ?? [];
    if (!path.length) return state;
    const last = path[path.length - 1]!;
    if (!isAdjacent(last, row, col)) return state;

    // Backtrack
    if (path.length >= 2 && path[path.length - 2] === key(row, col)) {
      return { ...state, paths: { ...state.paths, [color]: path.slice(0, -1) } };
    }
    if (path.includes(key(row, col))) return state;
    for (const [c, p] of Object.entries(state.paths)) {
      if (c !== color && p.includes(key(row, col))) return state;
    }
    const newPaths = { ...state.paths, [color]: [...path, key(row, col)] };
    const next = { ...state, paths: newPaths };
    return { ...next, won: checkWon(next) };
  }

  if (action.type === "release") return { ...state, activeColor: null };
  return state;
}

export function isTerminal(state: ColorFlowState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.movesMade * 5) };
}
