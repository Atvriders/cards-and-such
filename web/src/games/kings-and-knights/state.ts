import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PUZZLES_EASY, PUZZLES_MEDIUM, attacks } from "./puzzles.js";
import type { KKPuzzle, KKPiece, PieceType } from "./puzzles.js";

export type { KKPuzzle, KKPiece, PieceType };
export { attacks };

export interface KKSettings {
  difficulty: "easy" | "medium";
}

export interface KKState {
  settings: KKSettings;
  puzzle: KKPuzzle;
  /** Player-placed pieces (does not include clues) */
  placed: KKPiece[];
  /** Currently selected piece type to place */
  selectedType: PieceType;
  won: boolean;
  moves: number;
}

export type KKAction =
  | { type: "selectType"; pieceType: PieceType }
  | { type: "toggleCell"; row: number; col: number }
  | { type: "reset" };

export function allPieces(state: KKState): KKPiece[] {
  return [...state.puzzle.clues, ...state.placed];
}

export function computeConflicts(pieces: KKPiece[]): Set<string> {
  const conflicts = new Set<string>();
  for (let i = 0; i < pieces.length; i++) {
    for (let j = i + 1; j < pieces.length; j++) {
      if (attacks(pieces[i]!, pieces[j]!)) {
        conflicts.add(`${pieces[i]!.row},${pieces[i]!.col}`);
        conflicts.add(`${pieces[j]!.row},${pieces[j]!.col}`);
      }
    }
  }
  return conflicts;
}

export function checkWon(state: KKState): boolean {
  const { puzzle } = state;
  const pieces = allPieces(state);
  // Count correct piece types
  const kings = pieces.filter(p => p.type === "K").length;
  const knights = pieces.filter(p => p.type === "N").length;
  if (kings !== puzzle.kingsCount || knights !== puzzle.knightsCount) return false;
  // No conflicts
  return computeConflicts(pieces).size === 0;
}

export function initialState(seed: number, settings: KKSettings): KKState {
  const rng = mulberry32(seed);
  const pool = settings.difficulty === "easy" ? PUZZLES_EASY : PUZZLES_MEDIUM;
  const puzzle = pool[Math.floor(rng() * pool.length)]!;
  return {
    settings,
    puzzle,
    placed: [],
    selectedType: "K",
    won: false,
    moves: 0,
  };
}

export function reducer(state: KKState, action: KKAction): KKState {
  if (state.won && action.type !== "reset") return state;
  switch (action.type) {
    case "selectType":
      return { ...state, selectedType: action.pieceType };
    case "toggleCell": {
      const { row, col } = action;
      // Can't modify clue cells
      if (state.puzzle.clues.some(p => p.row === row && p.col === col)) return state;
      const existingIdx = state.placed.findIndex(p => p.row === row && p.col === col);
      let newPlaced: KKPiece[];
      if (existingIdx >= 0) {
        const existing = state.placed[existingIdx]!;
        if (existing.type === state.selectedType) {
          // Remove it
          newPlaced = state.placed.filter((_, i) => i !== existingIdx);
        } else {
          // Change type
          newPlaced = state.placed.map((p, i) => i === existingIdx ? { ...p, type: state.selectedType } : p);
        }
      } else {
        newPlaced = [...state.placed, { row, col, type: state.selectedType }];
      }
      const newState = { ...state, placed: newPlaced, moves: state.moves + 1 };
      return { ...newState, won: checkWon(newState) };
    }
    case "reset":
      return { ...state, placed: [], won: false, moves: 0 };
    default:
      return state;
  }
}

export function isTerminal(state: KKState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 10) };
}
