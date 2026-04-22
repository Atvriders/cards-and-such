import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { STAR_BATTLE_PUZZLES } from "./puzzles.js";
import type { StarBattlePuzzle } from "./puzzles.js";

export interface StarBattleSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface StarBattleState {
  puzzle: StarBattlePuzzle;
  /** Player marks: 0=empty, 1=star, 2=dot (eliminated mark) */
  marks: number[];
  errorCells: number[];
  movesMade: number;
  won: boolean;
  settings: StarBattleSettings;
}

export type StarBattleAction =
  | { type: "toggle"; index: number }; // cycles 0->1->2->0

export function computeStarErrors(marks: number[], puzzle: StarBattlePuzzle): number[] {
  const { n, stars, regions } = puzzle;
  const errors = new Set<number>();
  const starIndices = marks.map((v, i) => (v === 1 ? i : -1)).filter((i) => i >= 0);

  // Adjacency violations
  for (let a = 0; a < starIndices.length; a++) {
    for (let b = a + 1; b < starIndices.length; b++) {
      const ra = Math.floor(starIndices[a]! / n);
      const ca = starIndices[a]! % n;
      const rb = Math.floor(starIndices[b]! / n);
      const cb = starIndices[b]! % n;
      if (Math.abs(ra - rb) <= 1 && Math.abs(ca - cb) <= 1) {
        errors.add(starIndices[a]!);
        errors.add(starIndices[b]!);
      }
    }
  }

  // Over-filled rows
  for (let r = 0; r < n; r++) {
    const rowStars = starIndices.filter((i) => Math.floor(i / n) === r);
    if (rowStars.length > stars) rowStars.forEach((i) => errors.add(i));
  }

  // Over-filled cols
  for (let c = 0; c < n; c++) {
    const colStars = starIndices.filter((i) => i % n === c);
    if (colStars.length > stars) colStars.forEach((i) => errors.add(i));
  }

  // Over-filled regions
  const numRegions = Math.max(...regions) + 1;
  for (let reg = 0; reg < numRegions; reg++) {
    const regStars = starIndices.filter((i) => regions[i] === reg);
    if (regStars.length > stars) regStars.forEach((i) => errors.add(i));
  }

  return [...errors];
}

function checkWon(marks: number[], solution: boolean[]): boolean {
  return marks.every((v, i) => (v === 1) === solution[i]);
}

export function initialState(seed: number, settings: StarBattleSettings): StarBattleState {
  const rng = mulberry32(seed);
  const pool = STAR_BATTLE_PUZZLES.filter((p) => p.difficulty === settings.difficulty);
  const puzzle = pool[Math.floor(rng() * pool.length)]!;
  return {
    puzzle,
    marks: new Array(puzzle.n * puzzle.n).fill(0),
    errorCells: [],
    movesMade: 0,
    won: false,
    settings,
  };
}

export function reducer(state: StarBattleState, action: StarBattleAction): StarBattleState {
  switch (action.type) {
    case "toggle": {
      const { index } = action;
      const next = state.marks.slice();
      const cur = next[index]!;
      next[index] = cur === 0 ? 1 : cur === 1 ? 2 : 0;
      const errorCells = computeStarErrors(next, state.puzzle);
      const won = checkWon(next, state.puzzle.solution);
      return { ...state, marks: next, errorCells, movesMade: state.movesMade + 1, won };
    }
    default:
      return state;
  }
}

export function isTerminal(state: StarBattleState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.movesMade * 5) };
}
