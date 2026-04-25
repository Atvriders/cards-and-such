import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CrosswordProSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface CrosswordClue {
  number: number;
  direction: "across" | "down";
  row: number;
  col: number;
  length: number;
  clue: string;
  answer: string;
}

export interface CrosswordProState {
  settings: CrosswordProSettings;
  grid: readonly string[];        // user-entered letters, "" for empty, "#" for black
  solution: readonly string[];    // correct letters, "#" for black
  size: number;
  clues: readonly CrosswordClue[];
  selectedClue: number | null;    // index into clues
  won: boolean;
  reveals: number;
}

export type CrosswordProAction =
  | { type: "type"; row: number; col: number; letter: string }
  | { type: "select"; clueIndex: number }
  | { type: "reveal" };

// Hardcoded small crosswords
const EASY_PUZZLE = {
  size: 5,
  blacks: [0*5+2, 2*5+0, 2*5+4, 4*5+2],
  clues: [
    { number:1, direction:"across" as const, row:0, col:0, length:2, clue:"Exist", answer:"BE" },
    { number:2, direction:"across" as const, row:0, col:3, length:2, clue:"Consumed", answer:"ATE" },
    { number:3, direction:"across" as const, row:1, col:0, length:5, clue:"Feline", answer:"TABBY" },
    { number:4, direction:"across" as const, row:3, col:0, length:5, clue:"Quick brown animal", answer:"FOXES" },
    { number:5, direction:"across" as const, row:4, col:0, length:2, clue:"Golf peg", answer:"TE" },
    { number:6, direction:"across" as const, row:4, col:3, length:2, clue:"Consume", answer:"EAT" },
    { number:1, direction:"down" as const, row:0, col:0, length:2, clue:"Musical note", answer:"BE" },
    { number:7, direction:"down" as const, row:0, col:1, length:5, clue:"Rabbit", answer:"ABBEY" },
    { number:8, direction:"down" as const, row:0, col:3, length:5, clue:"Anger", answer:"ANGER" },
    { number:9, direction:"down" as const, row:0, col:4, length:2, clue:"Negative", answer:"TE" },
  ],
};

const MEDIUM_PUZZLE = {
  size: 5,
  blacks: [1*5+2, 3*5+2],
  clues: [
    { number:1, direction:"across" as const, row:0, col:0, length:5, clue:"Planet we live on", answer:"EARTH" },
    { number:2, direction:"across" as const, row:1, col:0, length:2, clue:"Rodent", answer:"AT" },
    { number:3, direction:"across" as const, row:1, col:3, length:2, clue:"Prefix: half", answer:"HE" },
    { number:4, direction:"across" as const, row:2, col:0, length:5, clue:"Spooky", answer:"EERIE" },
    { number:5, direction:"across" as const, row:3, col:0, length:2, clue:"Boat paddle", answer:"OA" },
    { number:6, direction:"across" as const, row:3, col:3, length:2, clue:"Zodiac ram", answer:"AR" },
    { number:7, direction:"across" as const, row:4, col:0, length:5, clue:"Relaxed", answer:"ATEAS" },
    { number:1, direction:"down" as const, row:0, col:0, length:5, clue:"Consume", answer:"EATER" },
    { number:8, direction:"down" as const, row:0, col:1, length:5, clue:"Soil", answer:"ARIEL" },
    { number:9, direction:"down" as const, row:0, col:2, length:1, clue:"Myself", answer:"R" },
    { number:10, direction:"down" as const, row:0, col:3, length:5, clue:"Listened", answer:"THEAR" },
    { number:11, direction:"down" as const, row:0, col:4, length:5, clue:"Finish", answer:"HIRES" },
  ],
};

const HARD_PUZZLE = {
  size: 7,
  blacks: [0*7+3, 3*7+0, 3*7+3, 3*7+6, 6*7+3],
  clues: [
    { number:1, direction:"across" as const, row:0, col:0, length:3, clue:"Exist", answer:"ARE" },
    { number:2, direction:"across" as const, row:0, col:4, length:3, clue:"Nocturnal flier", answer:"BAT" },
    { number:3, direction:"across" as const, row:1, col:0, length:7, clue:"Fast runner", answer:"CHEETAH" },
    { number:4, direction:"across" as const, row:2, col:0, length:7, clue:"Flower part", answer:"PETALED" },
    { number:5, direction:"across" as const, row:4, col:0, length:7, clue:"Imaginary", answer:"FANTASY" },
    { number:6, direction:"across" as const, row:5, col:0, length:7, clue:"Sunrise direction", answer:"EASTERN" },
    { number:7, direction:"across" as const, row:6, col:0, length:3, clue:"Exist", answer:"ARE" },
    { number:8, direction:"across" as const, row:6, col:4, length:3, clue:"Conclude", answer:"END" },
    { number:1, direction:"down" as const, row:0, col:0, length:7, clue:"Flower bed", answer:"ACEPHEE" },
    { number:9, direction:"down" as const, row:0, col:1, length:7, clue:"Planet red", answer:"RHTAAS" },
    { number:10, direction:"down" as const, row:0, col:2, length:7, clue:"Finish", answer:"ETALNER" },
    { number:2, direction:"down" as const, row:0, col:4, length:7, clue:"Game piece", answer:"BFESTN" },
    { number:11, direction:"down" as const, row:0, col:5, length:7, clue:"Perform", answer:"ATAARE" },
    { number:12, direction:"down" as const, row:0, col:6, length:7, clue:"Complete", answer:"TDHYND" },
  ],
};

function buildSolution(size: number, blacks: number[], clues: CrosswordClue[]): string[] {
  const sol = new Array(size * size).fill("#");
  for (let i = 0; i < size * size; i++) {
    if (!blacks.includes(i)) sol[i] = "";
  }
  for (const clue of clues) {
    for (let i = 0; i < clue.length; i++) {
      const r = clue.direction === "across" ? clue.row : clue.row + i;
      const c = clue.direction === "across" ? clue.col + i : clue.col;
      if (i < clue.answer.length) {
        sol[r * size + c] = clue.answer[i]!;
      }
    }
  }
  return sol;
}

export function initialState(seed: number, settings: CrosswordProSettings): CrosswordProState {
  const rng = mulberry32(seed);
  const puzzleData = settings.difficulty === "easy" ? EASY_PUZZLE :
                     settings.difficulty === "medium" ? MEDIUM_PUZZLE : HARD_PUZZLE;

  const size = puzzleData.size;
  const solution = buildSolution(size, puzzleData.blacks, puzzleData.clues);
  const grid = solution.map(v => v === "#" ? "#" : "");

  // Deduplicate clues by number+direction
  const seen = new Set<string>();
  const clues: CrosswordClue[] = [];
  for (const c of puzzleData.clues) {
    const ck = `${c.number}-${c.direction}`;
    if (!seen.has(ck)) { seen.add(ck); clues.push(c); }
  }

  void rng;
  return {
    settings,
    grid,
    solution,
    size,
    clues,
    selectedClue: null,
    won: false,
    reveals: 0,
  };
}

export function reducer(state: CrosswordProState, action: CrosswordProAction): CrosswordProState {
  if (state.won) return state;

  if (action.type === "type") {
    const { row, col, letter } = action;
    const idx = row * state.size + col;
    if (state.solution[idx] === "#") return state;
    const grid = state.grid.slice();
    grid[idx] = letter.toUpperCase().slice(0, 1);
    const won = grid.every((v, i) => v === state.solution[i]);
    return { ...state, grid, won };
  }

  if (action.type === "select") {
    return { ...state, selectedClue: action.clueIndex };
  }

  if (action.type === "reveal") {
    // Reveal one random unrevealed cell
    const wrong = state.grid
      .map((v, i) => ({ v, i }))
      .filter(({ v, i }) => state.solution[i] !== "#" && v !== state.solution[i]);
    if (!wrong.length) return state;
    const pick = wrong[Math.floor(Math.random() * wrong.length)]!;
    const grid = state.grid.slice();
    grid[pick.i] = state.solution[pick.i]!;
    const won = grid.every((v, i) => v === state.solution[i]);
    return { ...state, grid, won, reveals: state.reveals + 1 };
  }

  return state;
}

export function isTerminal(state: CrosswordProState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(50, 1000 - state.reveals * 100) };
}
