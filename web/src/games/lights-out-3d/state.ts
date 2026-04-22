import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Lights Out 3D — a 3×3×3 cube of lights.
// Pressing a cell toggles it AND its up to 6 face-adjacent neighbors.
// Goal: turn all lights off.

export interface LightsOut3DSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface LightsOut3DState {
  settings: LightsOut3DSettings;
  cells: readonly boolean[];  // 27 cells, true = ON
  moves: number;
  won: boolean;
}

export type LightsOut3DAction =
  | { type: "press"; index: number };

// 3×3×3: index = x + y*3 + z*9
// x = index % 3
// y = (index / 3) | 0 % 3
// z = (index / 9) | 0

export function indexToXYZ(i: number): [number, number, number] {
  const x = i % 3;
  const y = Math.floor(i / 3) % 3;
  const z = Math.floor(i / 9);
  return [x, y, z];
}

export function xyzToIndex(x: number, y: number, z: number): number {
  return x + y * 3 + z * 9;
}

// Returns the indices toggled when pressing index i (itself + up to 6 neighbors)
export function getToggles(i: number): number[] {
  const [x, y, z] = indexToXYZ(i);
  const result: number[] = [i];
  const dirs: [number, number, number][] = [
    [1,0,0], [-1,0,0],
    [0,1,0], [0,-1,0],
    [0,0,1], [0,0,-1],
  ];
  for (const [dx, dy, dz] of dirs) {
    const nx = x + dx, ny = y + dy, nz = z + dz;
    if (nx >= 0 && nx < 3 && ny >= 0 && ny < 3 && nz >= 0 && nz < 3) {
      result.push(xyzToIndex(nx, ny, nz));
    }
  }
  return result;
}

// Generate a solvable puzzle by applying random presses to a solved (all-off) state
function makePuzzle(rng: () => number, difficulty: LightsOut3DSettings["difficulty"]): boolean[] {
  const numPresses = difficulty === "easy" ? 3 : difficulty === "medium" ? 6 : 10;
  const cells = new Array(27).fill(false) as boolean[];
  const usedPresses = new Set<number>();
  let attempts = 0;
  while (usedPresses.size < numPresses && attempts < 100) {
    attempts++;
    const idx = Math.floor(rng() * 27);
    if (usedPresses.has(idx)) continue;
    usedPresses.add(idx);
    for (const t of getToggles(idx)) cells[t] = !cells[t];
  }
  return cells;
}

export function initialState(seed: number, settings: LightsOut3DSettings): LightsOut3DState {
  const rng = mulberry32(seed);
  const cells = makePuzzle(rng, settings.difficulty);
  return {
    settings,
    cells,
    moves: 0,
    won: cells.every((c) => !c),
  };
}

export function reducer(state: LightsOut3DState, action: LightsOut3DAction): LightsOut3DState {
  if (state.won) return state;

  if (action.type === "press") {
    const { index } = action;
    if (index < 0 || index >= 27) return state;
    const newCells = state.cells.slice() as boolean[];
    for (const t of getToggles(index)) newCells[t] = !newCells[t];
    const won = newCells.every((c) => !c);
    return { ...state, cells: newCells, moves: state.moves + 1, won };
  }

  return state;
}

export function isTerminal(state: LightsOut3DState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(10, 300 - state.moves * 5) };
}

export function countOn(cells: readonly boolean[]): number {
  return cells.filter(Boolean).length;
}
