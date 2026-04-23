import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface MathBingoSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface MathProblem {
  text: string;
  answer: number;
}

export interface MathBingoState {
  settings: MathBingoSettings;
  rngSeed: number;
  card: number[]; // 25 numbers arranged as 5x5 (row-major), center is FREE
  marked: boolean[]; // 25 cells
  problem: MathProblem | null;
  problemsDrawn: number;
  won: boolean;
  done: boolean;
  lastCorrect: boolean | null; // did last problem match a card number
}

export type MathBingoAction =
  | { type: "draw" }       // draw next problem
  | { type: "mark"; idx: number }; // mark a cell

const FREE_CENTER = 12; // index 12 = row 2 col 2 in 5x5

function generateCard(rng: () => number, difficulty: MathBingoSettings["difficulty"]): number[] {
  // Build a pool of answer values likely to appear in the problems
  const max = difficulty === "easy" ? 50 : difficulty === "medium" ? 100 : 150;
  const pool: Set<number> = new Set();
  // Collect up to 60 candidates (max distinct = max, so always enough)
  for (let i = 0; i < 200 && pool.size < 60; i++) {
    pool.add(Math.floor(rng() * max) + 1);
  }
  const arr = Array.from(pool).sort(() => rng() - 0.5).slice(0, 24);
  // Pad if somehow short (degenerate seed)
  while (arr.length < 24) arr.push(arr.length + 1);
  // Insert FREE cell at center (index 12)
  arr.splice(12, 0, 0);
  return arr;
}

function generateProblem(rng: () => number, difficulty: MathBingoSettings["difficulty"]): MathProblem {
  const ops = difficulty === "easy"
    ? (["+", "-"] as const)
    : difficulty === "medium"
    ? (["+", "-", "×"] as const)
    : (["+", "-", "×", "÷"] as const);

  const op = ops[Math.floor(rng() * ops.length)]!;
  let a: number, b: number, answer: number;

  if (op === "+") {
    a = Math.floor(rng() * (difficulty === "easy" ? 15 : 40)) + 1;
    b = Math.floor(rng() * (difficulty === "easy" ? 15 : 40)) + 1;
    answer = a + b;
  } else if (op === "-") {
    a = Math.floor(rng() * (difficulty === "easy" ? 20 : 50)) + 5;
    b = Math.floor(rng() * (a - 1)) + 1;
    answer = a - b;
  } else if (op === "×") {
    a = Math.floor(rng() * (difficulty === "medium" ? 9 : 12)) + 2;
    b = Math.floor(rng() * (difficulty === "medium" ? 9 : 12)) + 2;
    answer = a * b;
  } else {
    // division: generate clean division
    b = Math.floor(rng() * 11) + 2;
    answer = Math.floor(rng() * 12) + 1;
    a = b * answer;
  }

  return { text: `${a} ${op} ${b}`, answer };
}

export function initialState(seed: number, settings: MathBingoSettings): MathBingoState {
  const rng = mulberry32(seed >>> 0);
  const card = generateCard(rng, settings.difficulty);
  const marked = Array(25).fill(false);
  marked[FREE_CENTER] = true; // center is FREE
  const newSeed = (rng() * 2 ** 31) >>> 0;

  return {
    settings,
    rngSeed: newSeed,
    card,
    marked,
    problem: null,
    problemsDrawn: 0,
    won: false,
    done: false,
    lastCorrect: null,
  };
}

function checkBingo(marked: boolean[]): boolean {
  // Check rows
  for (let r = 0; r < 5; r++) {
    if ([0, 1, 2, 3, 4].every((c) => marked[r * 5 + c])) return true;
  }
  // Check cols
  for (let c = 0; c < 5; c++) {
    if ([0, 1, 2, 3, 4].every((r) => marked[r * 5 + c])) return true;
  }
  // Diagonals
  if ([0, 6, 12, 18, 24].every((i) => marked[i])) return true;
  if ([4, 8, 12, 16, 20].every((i) => marked[i])) return true;
  return false;
}

export function reducer(state: MathBingoState, action: MathBingoAction): MathBingoState {
  if (state.done) return state;

  if (action.type === "draw") {
    const rng = mulberry32(state.rngSeed);
    const problem = generateProblem(rng, state.settings.difficulty);
    const newSeed = (rng() * 2 ** 31) >>> 0;

    // Auto-mark any card cells matching the answer
    const newMarked = [...state.marked];
    let matched = false;
    for (let i = 0; i < 25; i++) {
      if (i === FREE_CENTER) continue;
      if (state.card[i] === problem.answer && !newMarked[i]) {
        newMarked[i] = true;
        matched = true;
      }
    }

    const won = checkBingo(newMarked);
    const problemsDrawn = state.problemsDrawn + 1;
    const done = won || problemsDrawn >= 30;

    return {
      ...state,
      rngSeed: newSeed,
      problem,
      marked: newMarked,
      problemsDrawn,
      won,
      done,
      lastCorrect: matched,
    };
  }

  return state;
}

export function isTerminal(state: MathBingoState): { score: number } | null {
  if (!state.done) return null;
  const base = state.won ? 500 : 0;
  const efficiency = state.won ? Math.max(0, 30 - state.problemsDrawn) * 10 : 0;
  return { score: base + efficiency };
}

export { checkBingo, FREE_CENTER };
