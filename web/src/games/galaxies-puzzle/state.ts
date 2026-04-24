import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PUZZLES } from "./puzzles.js";
import type { GalaxyPuzzle } from "./puzzles.js";

export type { GalaxyPuzzle };

export interface GalaxiesSettings {
  difficulty: "easy" | "hard";
}

export interface GalaxiesState {
  settings: GalaxiesSettings;
  puzzle: GalaxyPuzzle;
  // Player assigns each cell to a galaxy index (-1 = unassigned)
  assignment: number[];
  selected: number | null; // currently selected galaxy index to paint with
  won: boolean;
  moves: number;
}

export type GalaxiesAction =
  | { type: "selectGalaxy"; galaxyIdx: number }
  | { type: "paintCell"; cellIdx: number }
  | { type: "reset" };

export function checkWon(puzzle: GalaxyPuzzle, assignment: number[]): boolean {
  const { solution } = puzzle;
  if (assignment.some(v => v === -1)) return false;
  return assignment.every((v, i) => v === solution[i]);
}

export function initialState(seed: number, settings: GalaxiesSettings): GalaxiesState {
  const rng = mulberry32(seed);
  const puzzle = PUZZLES[Math.floor(rng() * PUZZLES.length)]!;
  return {
    settings,
    puzzle,
    assignment: new Array(puzzle.size * puzzle.size).fill(-1),
    selected: null,
    won: false,
    moves: 0,
  };
}

export function reducer(state: GalaxiesState, action: GalaxiesAction): GalaxiesState {
  if (state.won && action.type !== "reset") return state;
  switch (action.type) {
    case "selectGalaxy":
      return { ...state, selected: action.galaxyIdx };
    case "paintCell": {
      if (state.selected === null) return state;
      const assignment = state.assignment.slice();
      // Toggle: if cell already has this galaxy, clear it
      if (assignment[action.cellIdx] === state.selected) {
        assignment[action.cellIdx] = -1;
      } else {
        assignment[action.cellIdx] = state.selected;
      }
      const won = checkWon(state.puzzle, assignment);
      return { ...state, assignment, won, moves: state.moves + 1 };
    }
    case "reset":
      return {
        ...state,
        assignment: new Array(state.puzzle.size * state.puzzle.size).fill(-1),
        selected: null,
        won: false,
        moves: 0,
      };
    default:
      return state;
  }
}

export function isTerminal(state: GalaxiesState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 3) };
}
