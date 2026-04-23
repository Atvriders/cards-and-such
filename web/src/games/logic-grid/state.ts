import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PUZZLES } from "./puzzles.js";
import type { LogicGridPuzzle } from "./puzzles.js";
export type { LogicGridPuzzle };

export interface LogicGridSettings {
  difficulty: "easy" | "medium" | "hard";
}

/** Cell state: null=unknown, true=yes, false=no */
export type CellMark = null | boolean;

export interface LogicGridState {
  settings: LogicGridSettings;
  puzzle: LogicGridPuzzle;
  /**
   * marks[entity][attrIdx-1][valueIdx]
   * e.g. marks[0][0][2] = whether entity0 has attribute1 value2
   */
  marks: CellMark[][][];
  won: boolean;
  moves: number;
}

export type LogicGridAction =
  | { type: "setMark"; entity: number; attr: number; value: number; mark: CellMark }
  | { type: "reset" };

function makeMark(n: number): CellMark[][][] {
  // [entity=5][attr=4][value=5]
  return Array.from({ length: n }, () =>
    Array.from({ length: 4 }, () => new Array<CellMark>(n).fill(null))
  );
}

export function checkWon(puzzle: LogicGridPuzzle, marks: CellMark[][][]): boolean {
  const n = puzzle.attributes[0].length;
  for (let e = 0; e < n; e++) {
    for (let a = 0; a < 4; a++) {
      const solVal = puzzle.solution[e]![a]!;
      for (let v = 0; v < n; v++) {
        const expected = v === solVal ? true : false;
        if (marks[e]![a]![v] !== expected) return false;
      }
    }
  }
  return true;
}

export function initialState(seed: number, settings: LogicGridSettings): LogicGridState {
  const rng = mulberry32(seed);
  const puzzle = PUZZLES[Math.floor(rng() * PUZZLES.length)]!;
  const n = puzzle.attributes[0].length;
  return {
    settings,
    puzzle,
    marks: makeMark(n),
    won: false,
    moves: 0,
  };
}

export function reducer(state: LogicGridState, action: LogicGridAction): LogicGridState {
  if (state.won && action.type !== "reset") return state;
  switch (action.type) {
    case "setMark": {
      const { entity, attr, value, mark } = action;
      const newMarks = state.marks.map((em, ei) =>
        ei === entity
          ? em.map((am, ai) =>
              ai === attr
                ? am.map((v, vi) => (vi === value ? mark : v))
                : am
            )
          : em
      );
      const won = checkWon(state.puzzle, newMarks);
      return { ...state, marks: newMarks, won, moves: state.moves + 1 };
    }
    case "reset": {
      const n = state.puzzle.attributes[0].length;
      return { ...state, marks: makeMark(n), won: false, moves: 0 };
    }
    default:
      return state;
  }
}

export function isTerminal(state: LogicGridState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 3) };
}
