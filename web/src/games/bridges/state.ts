import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PUZZLES_EASY, PUZZLES_MEDIUM, PUZZLES_HARD } from "./puzzles.js";
import type { BridgesPuzzle } from "./puzzles.js";
export type { BridgesPuzzle };

export interface BridgesSettings {
  difficulty: "easy" | "medium" | "hard";
}

/** A placed bridge: between two islands, count=1 or 2 */
export interface Bridge {
  r1: number; c1: number;
  r2: number; c2: number;
  count: number; // 1 or 2
}

export interface BridgesState {
  settings: BridgesSettings;
  puzzle: BridgesPuzzle;
  bridges: Bridge[];
  won: boolean;
  moves: number;
}

export type BridgesAction =
  | { type: "addBridge"; r1: number; c1: number; r2: number; c2: number }
  | { type: "reset" };

function sameSegment(b: Bridge, r1: number, c1: number, r2: number, c2: number): boolean {
  return (b.r1 === r1 && b.c1 === c1 && b.r2 === r2 && b.c2 === c2) ||
         (b.r1 === r2 && b.c1 === c2 && b.r2 === r1 && b.c2 === c1);
}

/** Check if a bridge segment crosses an existing bridge */
function crossesBridge(r1: number, c1: number, r2: number, c2: number, existing: Bridge[]): boolean {
  // One is horizontal, the other is vertical
  const isHoriz = r1 === r2;
  for (const b of existing) {
    const bHoriz = b.r1 === b.r2;
    if (isHoriz === bHoriz) continue; // parallel, no cross
    // One horiz, one vert
    const hr = isHoriz ? r1 : b.r1;
    const hc1 = isHoriz ? Math.min(c1, c2) : Math.min(b.c1, b.c2);
    const hc2 = isHoriz ? Math.max(c1, c2) : Math.max(b.c1, b.c2);
    const vc = isHoriz ? b.c1 : c1;
    const vr1 = isHoriz ? Math.min(b.r1, b.r2) : Math.min(r1, r2);
    const vr2 = isHoriz ? Math.max(b.r1, b.r2) : Math.max(r1, r2);
    if (vc > hc1 && vc < hc2 && hr > vr1 && hr < vr2) return true;
  }
  return false;
}

export function islandBridgeCount(bridges: Bridge[], r: number, c: number): number {
  let count = 0;
  for (const b of bridges) {
    if ((b.r1 === r && b.c1 === c) || (b.r2 === r && b.c2 === c)) count += b.count;
  }
  return count;
}

export function checkWon(puzzle: BridgesPuzzle, bridges: Bridge[]): boolean {
  const { size, grid } = puzzle;
  // Check each island has exactly its clue bridges
  for (let i = 0; i < size * size; i++) {
    const v = grid[i];
    if (v === null) continue;
    const r = Math.floor(i / size), c = i % size;
    if (islandBridgeCount(bridges, r, c) !== v) return false;
  }
  // Check all islands are connected via BFS
  const islands: [number, number][] = [];
  for (let i = 0; i < size * size; i++) {
    if (grid[i] !== null) islands.push([Math.floor(i / size), i % size]);
  }
  if (islands.length === 0) return true;
  const visited = new Set<string>();
  const queue: [number, number][] = [islands[0]!];
  visited.add(`${islands[0]![0]},${islands[0]![1]}`);
  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    for (const b of bridges) {
      let nr = -1, nc = -1;
      if (b.r1 === r && b.c1 === c) { nr = b.r2; nc = b.c2; }
      else if (b.r2 === r && b.c2 === c) { nr = b.r1; nc = b.c1; }
      if (nr >= 0 && !visited.has(`${nr},${nc}`)) {
        visited.add(`${nr},${nc}`);
        queue.push([nr, nc]);
      }
    }
  }
  return visited.size === islands.length;
}

export function initialState(seed: number, settings: BridgesSettings): BridgesState {
  const rng = mulberry32(seed);
  const pool = settings.difficulty === "easy" ? PUZZLES_EASY
    : settings.difficulty === "medium" ? PUZZLES_MEDIUM : PUZZLES_HARD;
  const puzzle = pool[Math.floor(rng() * pool.length)]!;
  return { settings, puzzle, bridges: [], won: false, moves: 0 };
}

export function reducer(state: BridgesState, action: BridgesAction): BridgesState {
  if (state.won && action.type !== "reset") return state;
  switch (action.type) {
    case "addBridge": {
      const { r1, c1, r2, c2 } = action;
      // Normalize order
      const nr1 = Math.min(r1, r2) || r1, nc1 = Math.min(c1, c2) || c1;
      const nr2 = Math.max(r1, r2) || r2, nc2 = Math.max(c1, c2) || c2;
      const existing = state.bridges.find(b => sameSegment(b, r1, c1, r2, c2));
      let newBridges: Bridge[];
      if (existing) {
        if (existing.count === 2) {
          // Remove bridge
          newBridges = state.bridges.filter(b => !sameSegment(b, r1, c1, r2, c2));
        } else {
          // Upgrade to 2
          newBridges = state.bridges.map(b => sameSegment(b, r1, c1, r2, c2) ? { ...b, count: 2 } : b);
        }
      } else {
        // Check crossing
        if (crossesBridge(r1, c1, r2, c2, state.bridges)) return state;
        newBridges = [...state.bridges, { r1, c1, r2, c2, count: 1 }];
        void [nr1, nc1, nr2, nc2]; // suppress unused
      }
      const won = checkWon(state.puzzle, newBridges);
      return { ...state, bridges: newBridges, won, moves: state.moves + 1 };
    }
    case "reset":
      return { ...state, bridges: [], won: false, moves: 0 };
    default:
      return state;
  }
}

export function isTerminal(state: BridgesState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 5) };
}
