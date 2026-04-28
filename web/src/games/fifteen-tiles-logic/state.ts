import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DeductionPuzzle {
  scenario: string;
  clues: string[];
  options: string[];
  correctIndex: number;
}

export interface FifteenPuzzleSettings { puzzles: "8"; }

export interface FifteenPuzzleState {
  puzzles: DeductionPuzzle[];
  currentIndex: number;
  selected: number | null;
  resolved: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type FifteenPuzzleAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_PUZZLES: DeductionPuzzle[] = [
  {
    "scenario": "Board (X = empty): row1=[1,2,3,4] row2=[5,6,7,8] row3=[9,10,X,11] row4=[13,14,15,12]. Which tile do you slide next to keep solving optimally?",
    "clues": [
      "Empty is at (3,3); tile 11 to its right needs to be at (3,4) → already there."
    ],
    "options": [
      "Slide tile 11",
      "Slide tile 7",
      "Slide tile 12",
      "Slide tile 10"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Board: row1=[1,2,3,4] row2=[5,6,7,8] row3=[9,10,11,X] row4=[13,14,15,12]. Next move?",
    "clues": [
      "12 should end at row 4 col 4 (already there but currently the slot is filled)... wait — empty at (3,4); tile 12 sits at (4,4) below."
    ],
    "options": [
      "Slide tile 12 up",
      "Slide tile 11 right",
      "Slide tile 8 down",
      "Slide tile 4 down"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Board: row1=[1,2,3,4] row2=[5,6,7,8] row3=[9,10,11,12] row4=[13,14,X,15]. Next move?",
    "clues": [
      "Empty at (4,3); tile 15 to right at (4,4)."
    ],
    "options": [
      "Slide tile 15 left",
      "Slide tile 11 down",
      "Slide tile 14 right",
      "Slide tile 13 right"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Board: row1=[1,2,3,4] row2=[5,6,7,8] row3=[9,10,11,12] row4=[13,X,14,15]. Next move?",
    "clues": [
      "Empty at (4,2); 14 next to it."
    ],
    "options": [
      "Slide tile 14 left",
      "Slide tile 10 down",
      "Slide tile 13 right",
      "Slide tile 15 left"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Board: row1=[1,2,3,4] row2=[5,6,7,8] row3=[9,10,11,12] row4=[X,13,14,15]. Next?",
    "clues": [
      "Empty at (4,1)."
    ],
    "options": [
      "Slide tile 13 left",
      "Slide tile 9 down",
      "Slide tile 14 left",
      "Slide tile 15 left"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Board: row1=[1,X,2,3] row2=[5,6,7,4] row3=[9,10,11,8] row4=[13,14,15,12]. Solving top row, next move?",
    "clues": [
      "Empty at (1,2); tile 2 needs to reach (1,2). Currently at (1,3)."
    ],
    "options": [
      "Slide tile 2 left",
      "Slide tile 6 up",
      "Slide tile 1 right",
      "Slide tile 3 left"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Board: row1=[1,2,X,3] row2=[5,6,7,4] row3=[9,10,11,8] row4=[13,14,15,12]. Next?",
    "clues": [
      "Empty at (1,3). Want 3 at (1,3) — slide right tile (3) left."
    ],
    "options": [
      "Slide tile 3 left",
      "Slide tile 7 up",
      "Slide tile 2 right",
      "Slide tile 4 up"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Board: row1=[1,2,3,X] row2=[5,6,7,4] row3=[9,10,11,8] row4=[13,14,15,12]. Final row 1 tile?",
    "clues": [
      "Empty at (1,4); slide 4 up to complete row 1."
    ],
    "options": [
      "Slide tile 4 up",
      "Slide tile 3 right",
      "Slide tile 7 right",
      "Slide tile 8 up"
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

export function initialState(seed: number, _settings: FifteenPuzzleSettings): FifteenPuzzleState {
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

export function reducer(state: FifteenPuzzleState, action: FifteenPuzzleAction): FifteenPuzzleState {
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

export function isTerminal(state: FifteenPuzzleState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
