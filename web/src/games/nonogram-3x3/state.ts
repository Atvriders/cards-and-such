import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Nonogram3x3Settings { dummy: boolean; }

export interface Nonogram3x3State {
  rngSeed: number;
  solution: boolean[];   // 9 entries — the target picture
  cells: boolean[];      // 9 entries — current marks
  rowClues: number[][];  // length 3
  colClues: number[][];  // length 3
  moves: number;
  message: string;
  phase: "playing" | "done";
}

export type Nonogram3x3Action =
  | { type: "toggle"; index: number }
  | { type: "check" }
  | { type: "reset" };

export function rowsOf(cells: boolean[]): boolean[][] {
  return [cells.slice(0, 3), cells.slice(3, 6), cells.slice(6, 9)];
}

export function colsOf(cells: boolean[]): boolean[][] {
  return [
    [cells[0]!, cells[3]!, cells[6]!],
    [cells[1]!, cells[4]!, cells[7]!],
    [cells[2]!, cells[5]!, cells[8]!],
  ];
}

export function clueLine(line: boolean[]): number[] {
  const out: number[] = [];
  let run = 0;
  for (const v of line) {
    if (v) run++;
    else if (run > 0) {
      out.push(run);
      run = 0;
    }
  }
  if (run > 0) out.push(run);
  return out.length ? out : [0];
}

function randomSolution(seed: number): boolean[] {
  const rng = mulberry32(seed);
  // 4-6 lit cells out of 9 produces a sensible mini-puzzle
  const target = 4 + Math.floor(rng() * 3);
  const cells = new Array(9).fill(false);
  let lit = 0;
  while (lit < target) {
    const i = Math.floor(rng() * 9);
    if (!cells[i]) {
      cells[i] = true;
      lit++;
    }
  }
  return cells;
}

export function initialState(seed: number, _s: Nonogram3x3Settings): Nonogram3x3State {
  const solution = randomSolution(seed);
  const rowClues = rowsOf(solution).map(clueLine);
  const colClues = colsOf(solution).map(clueLine);
  return {
    rngSeed: seed,
    solution,
    cells: new Array(9).fill(false),
    rowClues,
    colClues,
    moves: 0,
    message: "",
    phase: "playing",
  };
}

export function reducer(state: Nonogram3x3State, action: Nonogram3x3Action): Nonogram3x3State {
  if (action.type === "reset") {
    const newSeed = state.rngSeed + state.moves + 1;
    const sol = randomSolution(newSeed);
    return {
      rngSeed: newSeed,
      solution: sol,
      cells: new Array(9).fill(false),
      rowClues: rowsOf(sol).map(clueLine),
      colClues: colsOf(sol).map(clueLine),
      moves: 0,
      message: "",
      phase: "playing",
    };
  }
  if (state.phase === "done") return state;
  if (action.type === "toggle") {
    const cells = [...state.cells];
    cells[action.index] = !cells[action.index];
    return { ...state, cells, moves: state.moves + 1, message: "" };
  }
  if (action.type === "check") {
    const ok = state.cells.every((c, i) => c === state.solution[i]);
    if (ok) return { ...state, phase: "done", message: "Picture matches!" };
    const wrong = state.cells.filter((c, i) => c !== state.solution[i]).length;
    return { ...state, message: `Not yet — ${wrong} cell${wrong === 1 ? "" : "s"} off.` };
  }
  return state;
}

export function isTerminal(state: Nonogram3x3State): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(50, 400 - state.moves * 5) };
}
