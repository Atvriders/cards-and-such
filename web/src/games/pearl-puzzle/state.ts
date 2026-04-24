import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PUZZLES } from "./puzzles.js";
import type { PearlPuzzle, Edge } from "./puzzles.js";

export type { PearlPuzzle, Edge };

export interface PearlSettings {
  difficulty: "easy" | "hard";
}

export interface PearlState {
  settings: PearlSettings;
  puzzle: PearlPuzzle;
  edges: Set<string>;
  won: boolean;
  moves: number;
}

export type PearlAction =
  | { type: "toggleEdge"; edge: Edge }
  | { type: "reset" };

export function edgeKey(e: Edge): string {
  const [r1, c1, r2, c2] = e;
  if (r1 < r2 || (r1 === r2 && c1 < c2)) return `${r1},${c1},${r2},${c2}`;
  return `${r2},${c2},${r1},${c1}`;
}

export function solutionEdgeSet(puzzle: PearlPuzzle): Set<string> {
  return new Set(puzzle.solution.map(edgeKey));
}

export function checkWon(puzzle: PearlPuzzle, edges: Set<string>): boolean {
  const solSet = solutionEdgeSet(puzzle);
  if (edges.size !== solSet.size) return false;
  for (const e of edges) {
    if (!solSet.has(e)) return false;
  }
  return true;
}

export function initialState(seed: number, settings: PearlSettings): PearlState {
  const rng = mulberry32(seed);
  const puzzle = PUZZLES[Math.floor(rng() * PUZZLES.length)]!;
  return {
    settings,
    puzzle,
    edges: new Set(),
    won: false,
    moves: 0,
  };
}

export function reducer(state: PearlState, action: PearlAction): PearlState {
  if (state.won && action.type !== "reset") return state;
  switch (action.type) {
    case "toggleEdge": {
      const key = edgeKey(action.edge);
      const edges = new Set(state.edges);
      if (edges.has(key)) {
        edges.delete(key);
      } else {
        edges.add(key);
      }
      const won = checkWon(state.puzzle, edges);
      return { ...state, edges, won, moves: state.moves + 1 };
    }
    case "reset":
      return {
        ...state,
        edges: new Set(),
        won: false,
        moves: 0,
      };
    default:
      return state;
  }
}

export function isTerminal(state: PearlState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 5) };
}
