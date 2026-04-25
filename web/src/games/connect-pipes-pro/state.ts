import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface ConnectPipesSettings {
  size: "5" | "6" | "7";
}

export type Color = "red" | "blue" | "green" | "yellow" | "orange" | "purple";

export interface ConnectPipesState {
  settings: ConnectPipesSettings;
  size: number;
  // endpoints: map from "r,c" -> Color
  endpoints: Record<string, Color>;
  // paths: map from color -> list of "r,c" strings
  paths: Record<string, string[]>;
  activeColor: Color | null;
  won: boolean;
  movesMade: number;
}

export type ConnectPipesAction =
  | { type: "start"; row: number; col: number }
  | { type: "extend"; row: number; col: number }
  | { type: "release" };

const COLORS: Color[] = ["red", "blue", "green", "yellow", "orange", "purple"];

function key(r: number, c: number): string {
  return `${r},${c}`;
}

export function initialState(seed: number, settings: ConnectPipesSettings): ConnectPipesState {
  const size = parseInt(settings.size, 10);
  const rng = mulberry32(seed);

  const numPairs = size === 5 ? 4 : size === 6 ? 5 : 6;
  const endpoints: Record<string, Color> = {};
  const paths: Record<string, string[]> = {};

  const used = new Set<string>();
  for (let i = 0; i < numPairs; i++) {
    const color = COLORS[i]!;
    paths[color] = [];
    let r1: number, c1: number, r2: number, c2: number;
    let attempts = 0;
    do {
      r1 = Math.floor(rng() * size);
      c1 = Math.floor(rng() * size);
      attempts++;
    } while (used.has(key(r1, c1)) && attempts < 100);
    used.add(key(r1, c1));
    endpoints[key(r1, c1)] = color;

    attempts = 0;
    do {
      r2 = Math.floor(rng() * size);
      c2 = Math.floor(rng() * size);
      attempts++;
    } while ((used.has(key(r2, c2)) || (r2 === r1 && c2 === c1)) && attempts < 100);
    used.add(key(r2, c2));
    endpoints[key(r2, c2)] = color;
  }

  return {
    settings,
    size,
    endpoints,
    paths,
    activeColor: null,
    won: false,
    movesMade: 0,
  };
}

function isEndpoint(state: ConnectPipesState, r: number, c: number): Color | null {
  return state.endpoints[key(r, c)] ?? null;
}

function pathContains(path: string[], r: number, c: number): boolean {
  return path.includes(key(r, c));
}

function isAdjacent(a: string, r: number, c: number): boolean {
  const [ar, ac] = a.split(",").map(Number) as [number, number];
  return (Math.abs(ar - r) + Math.abs(ac - c)) === 1;
}

function checkWon(state: ConnectPipesState): boolean {
  // All paths must connect both endpoints
  const colors = Object.values(state.endpoints);
  const uniqueColors = [...new Set(colors)];
  for (const color of uniqueColors) {
    const path = state.paths[color] ?? [];
    if (path.length < 2) return false;
    // Both endpoints of this color must be in path
    const eps = Object.entries(state.endpoints)
      .filter(([, c]) => c === color)
      .map(([k]) => k);
    if (eps.length < 2) return false;
    if (!path.includes(eps[0]!) || !path.includes(eps[1]!)) return false;
  }
  // All cells must be filled
  const filled = new Set<string>();
  for (const path of Object.values(state.paths)) {
    for (const k of path) filled.add(k);
  }
  return filled.size === state.size * state.size;
}

export function reducer(state: ConnectPipesState, action: ConnectPipesAction): ConnectPipesState {
  if (state.won) return state;

  if (action.type === "start") {
    const { row, col } = action;
    if (row < 0 || row >= state.size || col < 0 || col >= state.size) return state;
    const color = isEndpoint(state, row, col);
    if (!color) return state;
    // Clear this color's path and start fresh from clicked endpoint
    return {
      ...state,
      paths: { ...state.paths, [color]: [key(row, col)] },
      activeColor: color,
      movesMade: state.movesMade + 1,
    };
  }

  if (action.type === "extend") {
    const { row, col } = action;
    if (!state.activeColor) return state;
    if (row < 0 || row >= state.size || col < 0 || col >= state.size) return state;
    const color = state.activeColor;
    const path = state.paths[color] ?? [];
    if (path.length === 0) return state;
    const last = path[path.length - 1]!;

    if (!isAdjacent(last, row, col)) return state;

    // If going back, trim path
    if (path.length >= 2 && path[path.length - 2] === key(row, col)) {
      const newPath = path.slice(0, -1);
      return { ...state, paths: { ...state.paths, [color]: newPath } };
    }

    if (pathContains(path, row, col)) return state;

    // Check if cell occupied by another path
    for (const [c, p] of Object.entries(state.paths)) {
      if (c !== color && p.includes(key(row, col))) return state;
    }

    const newPath = [...path, key(row, col)];
    const newPaths = { ...state.paths, [color]: newPath };
    const newState = { ...state, paths: newPaths };
    const won = checkWon(newState);
    return { ...newState, won };
  }

  if (action.type === "release") {
    return { ...state, activeColor: null };
  }

  return state;
}

export function isTerminal(state: ConnectPipesState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.movesMade * 5) };
}
