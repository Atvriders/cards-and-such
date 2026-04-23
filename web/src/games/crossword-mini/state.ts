import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { MINI_PUZZLES } from "./puzzles.js";
import type { MiniPuzzle, MiniClue } from "./puzzles.js";

export type { MiniClue };

export interface CrosswordMiniSettings {
  dummy?: "1"; // no meaningful settings needed
}

export interface CrosswordMiniState {
  settings: CrosswordMiniSettings;
  puzzle: MiniPuzzle;
  playerGrid: string[]; // 25 chars, player's entries ('' for empty, '#' for black)
  selectedCell: number | null;
  direction: "across" | "down";
  checked: boolean;
  score: number;
  gameOver: boolean;
}

export type CrosswordMiniAction =
  | { type: "selectCell"; index: number }
  | { type: "type"; char: string }
  | { type: "delete" }
  | { type: "check" }
  | { type: "toggleDirection" };

export function initialState(seed: number, _settings: CrosswordMiniSettings): CrosswordMiniState {
  const rng = mulberry32(seed);
  const idx = Math.floor(rng() * MINI_PUZZLES.length);
  const puzzle = MINI_PUZZLES[idx]!;
  const playerGrid: string[] = puzzle.grid.split("").map(ch => ch === "#" ? "#" : "");
  return {
    settings: _settings,
    puzzle,
    playerGrid,
    selectedCell: null,
    direction: "across",
    checked: false,
    score: 0,
    gameOver: false,
  };
}

function nextCell(state: CrosswordMiniState, index: number, dir: "across" | "down"): number | null {
  const puzzle = state.puzzle;
  if (dir === "across") {
    const next = index + 1;
    if (next % 5 === 0) return null;
    if (puzzle.grid[next] === "#") return null;
    return next;
  } else {
    const next = index + 5;
    if (next >= 25) return null;
    if (puzzle.grid[next] === "#") return null;
    return next;
  }
}

export function reducer(state: CrosswordMiniState, action: CrosswordMiniAction): CrosswordMiniState {
  if (state.gameOver) return state;

  switch (action.type) {
    case "selectCell": {
      const cell = action.index;
      if (state.puzzle.grid[cell] === "#") return state;
      if (state.selectedCell === cell) {
        return { ...state, direction: state.direction === "across" ? "down" : "across" };
      }
      return { ...state, selectedCell: cell, checked: false };
    }
    case "toggleDirection": {
      return { ...state, direction: state.direction === "across" ? "down" : "across" };
    }
    case "type": {
      const ch = action.char.toUpperCase();
      if (!/^[A-Z]$/.test(ch) || state.selectedCell === null) return state;
      const newGrid = [...state.playerGrid];
      newGrid[state.selectedCell] = ch;
      const nextIdx = nextCell(state, state.selectedCell, state.direction);
      return { ...state, playerGrid: newGrid, selectedCell: nextIdx ?? state.selectedCell };
    }
    case "delete": {
      if (state.selectedCell === null) return state;
      const newGrid = [...state.playerGrid];
      newGrid[state.selectedCell] = "";
      return { ...state, playerGrid: newGrid };
    }
    case "check": {
      const { puzzle, playerGrid } = state;
      let correct = 0;
      let total = 0;
      for (let i = 0; i < 25; i++) {
        if (puzzle.grid[i] === "#") continue;
        total++;
        if (playerGrid[i] === puzzle.grid[i]) correct++;
      }
      const score = Math.round((correct / total) * 100);
      return { ...state, checked: true, score, gameOver: true };
    }
    default:
      return state;
  }
}

export function isTerminal(state: CrosswordMiniState): { score: number } | null {
  if (state.gameOver) return { score: state.score };
  return null;
}
