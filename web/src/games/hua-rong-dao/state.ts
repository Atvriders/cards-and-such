import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DeductionPuzzle {
  scenario: string;
  clues: string[];
  options: string[];
  correctIndex: number;
}

export interface HuaRongDaoSettings { puzzles: "8"; }

export interface HuaRongDaoState {
  puzzles: DeductionPuzzle[];
  currentIndex: number;
  selected: number | null;
  resolved: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type HuaRongDaoAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_PUZZLES: DeductionPuzzle[] = [
  {
    "scenario": "Cao Cao (2×2) is at rows 1-2, cols 2-3. Two empty cells at (5,2) and (5,3). Cao Cao must reach the bottom centre. Next move?",
    "clues": [
      "Empty cells form a 1×2 below; Cao Cao needs path cleared row by row."
    ],
    "options": [
      "Move 1×1 down",
      "Move 1×2 horizontal aside",
      "Move Cao Cao down (blocked)",
      "Move 1×2 vertical aside"
    ],
    "correctIndex": 1
  },
  {
    "scenario": "Cao Cao at rows 2-3 cols 2-3. Empties at (1,1) and (1,4). Next?",
    "clues": [
      "Move side pieces up to free path."
    ],
    "options": [
      "Move 1×1 up to (1,1)",
      "Move Cao Cao up",
      "Move 1×2 horizontal up",
      "Move 1×2 vertical down"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Cao Cao at rows 3-4 cols 2-3. Empties at (5,1) and (5,2). Next move?",
    "clues": [
      "Path beneath Cao Cao at (5,2) and (5,3) needed; only (5,2) empty."
    ],
    "options": [
      "Move 1×1 from (5,3) → (5,1)... wait, must clear (5,3)",
      "Move bottom-row 1×1 horizontally to free (5,3)",
      "Move Cao Cao right",
      "Move Cao Cao down"
    ],
    "correctIndex": 1
  },
  {
    "scenario": "Empties at (5,2) and (5,3). Cao Cao at rows 3-4 cols 2-3. Next?",
    "clues": [
      "Path under Cao Cao is now clear."
    ],
    "options": [
      "Slide Cao Cao down to rows 4-5",
      "Move 1×2 horizontal",
      "Move 1×1 sideways",
      "Move Cao Cao right"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Cao Cao at rows 4-5 cols 2-3 — at the exit. Final move?",
    "clues": [
      "Goal reached if Cao Cao occupies the bottom exit cells."
    ],
    "options": [
      "Declare exit",
      "Move Cao Cao up",
      "Slide 1×1 left",
      "Move 1×2 vertical"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Cao Cao at rows 1-2 cols 2-3; empties at (3,2)(3,3). Next?",
    "clues": [
      "Slide Cao Cao down 1 row."
    ],
    "options": [
      "Slide Cao Cao down",
      "Move 1×1 left",
      "Move 1×2 vertical",
      "Move 1×2 horizontal up"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Cao Cao at rows 2-3 cols 2-3; empties at (4,2)(4,3). Next?",
    "clues": [
      "Slide Cao Cao down 1 row."
    ],
    "options": [
      "Slide Cao Cao down",
      "Move horizontal block",
      "Move 1×1 right",
      "Move 1×2 vertical"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Cao Cao stuck at rows 1-2 cols 1-2; empties at (1,4)(2,4). Next?",
    "clues": [
      "Cannot slide Cao Cao directly; need to set up by clearing centre."
    ],
    "options": [
      "Move adjacent 1×2 vertical to clear column",
      "Move Cao Cao down",
      "Slide 1×1 to (1,3)",
      "Declare exit"
    ],
    "correctIndex": 0
  }
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, _settings: HuaRongDaoSettings): HuaRongDaoState {
  const rng = mulberry32(seed);
  const pool = shuffle([...ALL_PUZZLES], rng).slice(0, Math.min(8, ALL_PUZZLES.length));
  return {
    puzzles: pool,
    currentIndex: 0,
    selected: null,
    resolved: false,
    score: 0,
    correctCount: 0,
    phase: "playing",
  };
}

export function reducer(state: HuaRongDaoState, action: HuaRongDaoAction): HuaRongDaoState {
  if (state.phase === "done") return state;
  switch (action.type) {
    case "select":
      return state.resolved ? state : { ...state, selected: action.index };
    case "submit": {
      if (state.resolved || state.selected === null) return state;
      const p = state.puzzles[state.currentIndex]!;
      const ok = state.selected === p.correctIndex;
      return {
        ...state,
        resolved: true,
        score: state.score + (ok ? 100 : 0),
        correctCount: state.correctCount + (ok ? 1 : 0),
        phase: "result",
      };
    }
    case "next": {
      const ni = state.currentIndex + 1;
      if (ni >= state.puzzles.length) return { ...state, phase: "done" };
      return { ...state, currentIndex: ni, selected: null, resolved: false, phase: "playing" };
    }
    default:
      return state;
  }
}

export function isTerminal(state: HuaRongDaoState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
