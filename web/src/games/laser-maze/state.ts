import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PUZZLES } from "./puzzles.js";
import type { LaserPuzzle, Direction, MirrorType } from "./puzzles.js";
export type { LaserPuzzle, Direction, MirrorType };

export interface LaserMazeSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface LaserMazeState {
  settings: LaserMazeSettings;
  puzzle: LaserPuzzle;
  /** Player-placed mirrors: index -> mirror type (or undefined = empty) */
  placedMirrors: Map<number, MirrorType>;
  won: boolean;
  moves: number;
}

export type LaserMazeAction =
  | { type: "placeMirror"; idx: number; mirror: MirrorType }
  | { type: "removeMirror"; idx: number }
  | { type: "reset" };

/** Reflect a direction off a mirror */
function reflect(dir: Direction, mirror: MirrorType): Direction {
  if (mirror === "/") {
    switch (dir) {
      case "right": return "up";
      case "up": return "right";
      case "left": return "down";
      case "down": return "left";
    }
  } else {
    switch (dir) {
      case "right": return "down";
      case "down": return "right";
      case "left": return "up";
      case "up": return "left";
    }
  }
}

function step(r: number, c: number, dir: Direction): [number, number] {
  switch (dir) {
    case "right": return [r, c + 1];
    case "left": return [r, c - 1];
    case "up": return [r - 1, c];
    case "down": return [r + 1, c];
  }
}

export interface LaserBeam {
  cells: number[]; // visited cell indices in order
  hitTarget: boolean;
}

export function traceBeam(puzzle: LaserPuzzle, placedMirrors: Map<number, MirrorType>): LaserBeam {
  const { size, grid, emitter, target } = puzzle;
  let { r, c, dir } = emitter;
  const cells: number[] = [];
  const visited = new Set<string>();
  let hitTarget = false;

  for (let step2 = 0; step2 < 200; step2++) {
    // Move in current direction
    [r, c] = step(r, c, dir);
    if (r < 0 || r >= size || c < 0 || c >= size) break; // off grid
    const idx = r * size + c;
    const key = `${idx}-${dir}`;
    if (visited.has(key)) break; // loop detection
    visited.add(key);
    cells.push(idx);
    if (idx === target) { hitTarget = true; break; }
    const cell = grid[idx]!;
    if (cell.wall) break;
    const mirror = placedMirrors.get(idx) ?? cell.mirror;
    if (mirror) {
      dir = reflect(dir, mirror);
    }
  }

  return { cells, hitTarget };
}

export function checkWon(puzzle: LaserPuzzle, placedMirrors: Map<number, MirrorType>): boolean {
  if (placedMirrors.size !== puzzle.mirrorCount) return false;
  return traceBeam(puzzle, placedMirrors).hitTarget;
}

export function initialState(seed: number, settings: LaserMazeSettings): LaserMazeState {
  const rng = mulberry32(seed);
  const puzzle = PUZZLES[Math.floor(rng() * PUZZLES.length)]!;
  return { settings, puzzle, placedMirrors: new Map(), won: false, moves: 0 };
}

export function reducer(state: LaserMazeState, action: LaserMazeAction): LaserMazeState {
  if (state.won && action.type !== "reset") return state;
  switch (action.type) {
    case "placeMirror": {
      const { idx, mirror } = action;
      // Don't place on wall or fixed mirror
      const cell = state.puzzle.grid[idx]!;
      if (cell.wall || cell.mirror) return state;
      const newMirrors = new Map(state.placedMirrors);
      newMirrors.set(idx, mirror);
      const won = checkWon(state.puzzle, newMirrors);
      return { ...state, placedMirrors: newMirrors, won, moves: state.moves + 1 };
    }
    case "removeMirror": {
      const newMirrors = new Map(state.placedMirrors);
      newMirrors.delete(action.idx);
      return { ...state, placedMirrors: newMirrors, moves: state.moves + 1 };
    }
    case "reset":
      return { ...state, placedMirrors: new Map(), won: false, moves: 0 };
    default:
      return state;
  }
}

export function isTerminal(state: LaserMazeState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 5) };
}
