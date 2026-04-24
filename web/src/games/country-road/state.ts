import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PUZZLES } from "./puzzles.js";
import type { CountryRoadPuzzle } from "./puzzles.js";

export type { CountryRoadPuzzle };

export interface CountryRoadSettings {
  difficulty: "easy" | "hard";
}

// Player toggles cells as "road" (part of loop) or not
export interface CountryRoadState {
  settings: CountryRoadSettings;
  puzzle: CountryRoadPuzzle;
  road: boolean[]; // true = this cell is part of the loop
  won: boolean;
  moves: number;
}

export type CountryRoadAction =
  | { type: "toggleCell"; idx: number }
  | { type: "reset" };

export function checkWon(puzzle: CountryRoadPuzzle, road: boolean[]): boolean {
  const { size, region, clues, solution } = puzzle;
  // Must match solution set exactly
  const solSet = new Set(solution);
  for (let i = 0; i < size * size; i++) {
    if (road[i] !== solSet.has(i)) return false;
  }
  // Check clue counts per region
  const counts = new Array(clues.length).fill(0);
  for (let i = 0; i < size * size; i++) {
    const reg = region[i];
    if (road[i] && reg !== undefined) counts[reg]++;
  }
  for (let r = 0; r < clues.length; r++) {
    if (counts[r] !== clues[r]) return false;
  }
  return true;
}

export function initialState(seed: number, settings: CountryRoadSettings): CountryRoadState {
  const rng = mulberry32(seed);
  const puzzle = PUZZLES[Math.floor(rng() * PUZZLES.length)]!;
  return {
    settings,
    puzzle,
    road: new Array(puzzle.size * puzzle.size).fill(false),
    won: false,
    moves: 0,
  };
}

export function reducer(state: CountryRoadState, action: CountryRoadAction): CountryRoadState {
  if (state.won && action.type !== "reset") return state;
  switch (action.type) {
    case "toggleCell": {
      const road = state.road.slice();
      road[action.idx] = !road[action.idx];
      const won = checkWon(state.puzzle, road);
      return { ...state, road, won, moves: state.moves + 1 };
    }
    case "reset":
      return {
        ...state,
        road: new Array(state.puzzle.size * state.puzzle.size).fill(false),
        won: false,
        moves: 0,
      };
    default:
      return state;
  }
}

export function isTerminal(state: CountryRoadState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 3) };
}
