import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { ACROSTIC_PUZZLES } from "./puzzles.js";
import type { AcrosticPuzzle } from "./puzzles.js";

export type { AcrosticPuzzle };

export interface AcrosticSettings {
  dummy?: "1";
}

export interface AcrosticState {
  settings: AcrosticSettings;
  puzzle: AcrosticPuzzle;
  clueInputs: string[];     // player's answers to each clue
  selectedClue: number | null;
  currentInput: string;
  checked: boolean;
  score: number;
  gameOver: boolean;
  message: string;
}

export type AcrosticAction =
  | { type: "selectClue"; index: number }
  | { type: "type"; char: string }
  | { type: "delete" }
  | { type: "clear" }
  | { type: "check" };

export function initialState(seed: number, settings: AcrosticSettings): AcrosticState {
  const rng = mulberry32(seed);
  const idx = Math.floor(rng() * ACROSTIC_PUZZLES.length);
  const puzzle = ACROSTIC_PUZZLES[idx]!;
  return {
    settings,
    puzzle,
    clueInputs: puzzle.clues.map(() => ""),
    selectedClue: 0,
    currentInput: "",
    checked: false,
    score: 0,
    gameOver: false,
    message: "",
  };
}

export function reducer(state: AcrosticState, action: AcrosticAction): AcrosticState {
  if (state.gameOver) return state;

  switch (action.type) {
    case "selectClue": {
      // Save current input first
      const clueInputs = [...state.clueInputs];
      if (state.selectedClue !== null) {
        clueInputs[state.selectedClue] = state.currentInput;
      }
      const newCurrent = clueInputs[action.index] ?? "";
      return { ...state, clueInputs, selectedClue: action.index, currentInput: newCurrent, message: "" };
    }
    case "type": {
      const ch = action.char.toUpperCase();
      if (!/^[A-Z]$/.test(ch) || state.selectedClue === null) return state;
      return { ...state, currentInput: state.currentInput + ch, message: "" };
    }
    case "delete": {
      if (state.selectedClue === null) return state;
      return { ...state, currentInput: state.currentInput.slice(0, -1), message: "" };
    }
    case "clear": {
      return { ...state, currentInput: "", message: "" };
    }
    case "check": {
      // Save pending input
      const clueInputs = [...state.clueInputs];
      if (state.selectedClue !== null) {
        clueInputs[state.selectedClue] = state.currentInput;
      }
      let correct = 0;
      const { clues } = state.puzzle;
      for (let i = 0; i < clues.length; i++) {
        if ((clueInputs[i] ?? "").toUpperCase() === clues[i]!.answer.toUpperCase()) {
          correct++;
        }
      }
      const score = Math.round((correct / clues.length) * 100);
      return { ...state, clueInputs, checked: true, score, gameOver: true, message: `${correct}/${clues.length} correct` };
    }
    default:
      return state;
  }
}

export function isTerminal(state: AcrosticState): { score: number } | null {
  if (state.gameOver) return { score: state.score };
  return null;
}
