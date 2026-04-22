import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { SHIKAKU_PUZZLES } from "./puzzles.js";
import type { ShikakuPuzzle, ShikakuRect, NumberedCell } from "./puzzles.js";

export type { ShikakuPuzzle, ShikakuRect, NumberedCell };

export interface ShikakuSettings {
  difficulty: "easy" | "hard";
}

export interface DraftRect {
  r1: number; c1: number;
  r2: number; c2: number;
}

export interface ShikakuState {
  settings: ShikakuSettings;
  puzzle: ShikakuPuzzle;
  /** Completed rects drawn by the player: clueIdx → ShikakuRect */
  placed: (ShikakuRect | null)[];
  /** Currently dragging a rect */
  draft: DraftRect | null;
  won: boolean;
  moves: number;
}

export type ShikakuAction =
  | { type: "startDrag"; r: number; c: number }
  | { type: "updateDrag"; r: number; c: number }
  | { type: "endDrag" }
  | { type: "removeRect"; clueIdx: number }
  | { type: "reset" };

/** Returns which clue index a rect (r,c,h,w) would belong to — the clue inside it, or -1 */
export function findClueInRect(puzzle: ShikakuPuzzle, rect: ShikakuRect): number {
  let found = -1;
  for (let i = 0; i < puzzle.clues.length; i++) {
    const clue = puzzle.clues[i]!;
    if (
      clue.r >= rect.r && clue.r < rect.r + rect.h &&
      clue.c >= rect.c && clue.c < rect.c + rect.w
    ) {
      if (found !== -1) return -1; // two clues inside
      found = i;
    }
  }
  return found;
}

export function draftToRect(d: DraftRect): ShikakuRect {
  const r = Math.min(d.r1, d.r2);
  const c = Math.min(d.c1, d.c2);
  const h = Math.abs(d.r2 - d.r1) + 1;
  const w = Math.abs(d.c2 - d.c1) + 1;
  return { r, c, h, w };
}

function rectsOverlap(a: ShikakuRect, b: ShikakuRect): boolean {
  return (
    a.r < b.r + b.h && a.r + a.h > b.r &&
    a.c < b.c + b.w && a.c + a.w > b.c
  );
}

function checkWon(puzzle: ShikakuPuzzle, placed: (ShikakuRect | null)[]): boolean {
  // All clues must have a placed rect
  for (let i = 0; i < puzzle.clues.length; i++) {
    const rect = placed[i];
    if (!rect) return false;
    const clue = puzzle.clues[i]!;
    // Area must match clue value
    if (rect.h * rect.w !== clue.value) return false;
  }
  // Rects must cover the full grid without overlap
  const covered = new Array(puzzle.size * puzzle.size).fill(false);
  for (const rect of placed) {
    if (!rect) return false;
    for (let r = rect.r; r < rect.r + rect.h; r++) {
      for (let c = rect.c; c < rect.c + rect.w; c++) {
        const idx = r * puzzle.size + c;
        if (covered[idx]) return false;
        covered[idx] = true;
      }
    }
  }
  return covered.every(Boolean);
}

export function initialState(seed: number, settings: ShikakuSettings): ShikakuState {
  const rng = mulberry32(seed);
  const pool = SHIKAKU_PUZZLES[settings.difficulty]!;
  const puzzle = pool[Math.floor(rng() * pool.length)]!;
  return {
    settings,
    puzzle,
    placed: new Array(puzzle.clues.length).fill(null),
    draft: null,
    won: false,
    moves: 0,
  };
}

export function reducer(state: ShikakuState, action: ShikakuAction): ShikakuState {
  if (state.won && action.type !== "reset") return state;
  switch (action.type) {
    case "startDrag":
      return { ...state, draft: { r1: action.r, c1: action.c, r2: action.r, c2: action.c } };
    case "updateDrag":
      if (!state.draft) return state;
      return { ...state, draft: { ...state.draft, r2: action.r, c2: action.c } };
    case "endDrag": {
      if (!state.draft) return state;
      const rect = draftToRect(state.draft);
      const clueIdx = findClueInRect(state.puzzle, rect);
      if (clueIdx === -1) return { ...state, draft: null };

      // Check area matches clue
      const clue = state.puzzle.clues[clueIdx]!;
      if (rect.h * rect.w !== clue.value) return { ...state, draft: null };

      // Check no overlap with other placed rects
      const newPlaced = state.placed.slice();
      for (let i = 0; i < newPlaced.length; i++) {
        if (i === clueIdx) continue;
        const other = newPlaced[i];
        if (other && rectsOverlap(rect, other)) return { ...state, draft: null };
      }

      newPlaced[clueIdx] = rect;
      const won = checkWon(state.puzzle, newPlaced);
      return { ...state, placed: newPlaced, draft: null, won, moves: state.moves + 1 };
    }
    case "removeRect": {
      const newPlaced = state.placed.slice();
      newPlaced[action.clueIdx] = null;
      return { ...state, placed: newPlaced };
    }
    case "reset":
      return {
        ...state,
        placed: new Array(state.puzzle.clues.length).fill(null),
        draft: null,
        won: false,
        moves: 0,
      };
    default:
      return state;
  }
}

export function isTerminal(state: ShikakuState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 5) };
}
