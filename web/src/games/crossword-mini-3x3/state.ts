import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// 3x3 mini crossword: 3 across, 3 down. Word list is fixed but seed selects which puzzle.
export interface CrosswordMini3x3Settings { dummy: boolean; }
interface Puzzle {
  // grid is 3x3; uppercase letters
  grid: string[]; // length 9
  acrossClues: [string, string, string];
  downClues: [string, string, string];
}
const PUZZLES: Puzzle[] = [
  { grid: ["C","A","T","O","W","E","B","I","T"], acrossClues: ["Furry pet (3)", "Spider's home (3)", "Small piece (3)"], downClues: ["Pig sound: ___ ___ (3)", "Wonder, awe... (3)", "Possessive pronoun (3)"] },
  { grid: ["S","U","N","E","A","R","A","T","E"], acrossClues: ["Star at center of solar system (3)", "Hearing organ (3)", "Charge per unit (3)"], downClues: ["Word with -set, -down (3)", "Article (1) + word for 'until' (2) (3)", "Number after eight (3)"] },
  { grid: ["B","I","G","I","C","E","T","A","R"], acrossClues: ["Large (3)", "Frozen water (3)", "Sticky black substance (3)"], downClues: ["Bug (3)", "Frozen treat: ___ cream (3)", "Something owned: posses___ (3)"] },
  { grid: ["D","O","G","O","R","E","T","E","E"], acrossClues: ["Canine pet (3)", "Sci-fi: blood, mineral... (3)", "Golf peg (3)"], downClues: ["Bring (3)", "Number of feet on a chair (3)", "Final letter of the alphabet (3)"] },
];
export interface CrosswordMini3x3State {
  rngSeed: number;
  puzzleIndex: number;
  cells: string[]; // 9 user inputs
  selected: number; // currently focused cell
  acrossClues: [string, string, string];
  downClues: [string, string, string];
  solution: string[];
  moves: number;
  phase: "playing" | "done";
}
export type CrosswordMini3x3Action = { type: "select"; index: number } | { type: "input"; letter: string } | { type: "check" } | { type: "reset" };
export function initialState(seed: number, _s: CrosswordMini3x3Settings): CrosswordMini3x3State {
  const rng = mulberry32(seed);
  const idx = Math.floor(rng() * PUZZLES.length);
  const p = PUZZLES[idx]!;
  return { rngSeed: seed, puzzleIndex: idx, cells: new Array(9).fill(""), selected: 0, acrossClues: p.acrossClues, downClues: p.downClues, solution: p.grid, moves: 0, phase: "playing" };
}
export function reducer(state: CrosswordMini3x3State, action: CrosswordMini3x3Action): CrosswordMini3x3State {
  if (state.phase === "done") return state;
  if (action.type === "reset") {
    const newSeed = state.rngSeed + state.moves + 1;
    const rng = mulberry32(newSeed);
    const idx = Math.floor(rng() * PUZZLES.length);
    const p = PUZZLES[idx]!;
    return { rngSeed: newSeed, puzzleIndex: idx, cells: new Array(9).fill(""), selected: 0, acrossClues: p.acrossClues, downClues: p.downClues, solution: p.grid, moves: 0, phase: "playing" };
  }
  if (action.type === "select") return { ...state, selected: action.index };
  if (action.type === "input") {
    const ch = action.letter.toUpperCase().slice(0,1);
    const cells = [...state.cells]; cells[state.selected] = ch;
    const next = Math.min(state.selected + 1, 8);
    return { ...state, cells, selected: next, moves: state.moves + 1 };
  }
  if (action.type === "check") {
    const ok = state.cells.every((c, i) => c === state.solution[i]);
    return ok ? { ...state, phase: "done" } : state;
  }
  return state;
}
export function isTerminal(state: CrosswordMini3x3State): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(50, 500 - state.moves * 5) };
}
