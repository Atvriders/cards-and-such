import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DeductionPuzzle {
  scenario: string;
  clues: string[];
  options: string[];
  correctIndex: number;
}

export interface EightPuzzleSettings { puzzles: "8"; }

export interface EightPuzzleState {
  puzzles: DeductionPuzzle[];
  currentIndex: number;
  selected: number | null;
  resolved: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type EightPuzzleAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_PUZZLES: DeductionPuzzle[] = [
  {
    "scenario": "Board (X=empty): row1=[1,2,3] row2=[4,5,X] row3=[7,8,6]. Optimal next?",
    "clues": [
      "Empty at (2,3); 6 below needs to be at (3,3) — already there. We want 6 at (3,3) so slide 6 up to (2,3) then... actually 6's goal is (3,3); slide tile 6 up doesn't help. Tile that wants to be at (2,3) is 6."
    ],
    "options": [
      "Slide tile 6 up",
      "Slide tile 5 right",
      "Slide tile 3 down",
      "Slide tile 8 right"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Board: row1=[1,2,3] row2=[4,5,6] row3=[7,X,8]. Next?",
    "clues": [
      "Slide 8 left to finish."
    ],
    "options": [
      "Slide tile 8 left",
      "Slide tile 5 down",
      "Slide tile 7 right",
      "Slide tile 6 down"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Board: row1=[1,2,3] row2=[4,X,6] row3=[7,5,8]. Next?",
    "clues": [
      "Empty at (2,2). Tile 5 below wants to be at (2,2). Slide up."
    ],
    "options": [
      "Slide tile 5 up",
      "Slide tile 6 left",
      "Slide tile 2 down",
      "Slide tile 4 right"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Board: row1=[1,2,3] row2=[X,5,6] row3=[4,7,8]. Next?",
    "clues": [
      "Empty at (2,1); slide 4 up."
    ],
    "options": [
      "Slide tile 4 up",
      "Slide tile 5 left",
      "Slide tile 1 down",
      "Slide tile 7 left"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Board: row1=[1,X,3] row2=[4,2,5] row3=[7,8,6]. Next?",
    "clues": [
      "Empty at (1,2); slide 2 up."
    ],
    "options": [
      "Slide tile 2 up",
      "Slide tile 1 right",
      "Slide tile 3 left",
      "Slide tile 4 right"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Board: row1=[1,2,X] row2=[4,5,3] row3=[7,8,6]. Next?",
    "clues": [
      "Empty at (1,3); slide 3 up."
    ],
    "options": [
      "Slide tile 3 up",
      "Slide tile 2 right",
      "Slide tile 5 right",
      "Slide tile 6 right"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Board: row1=[1,2,3] row2=[4,5,X] row3=[7,8,6]. Next?",
    "clues": [
      "Slide 6 up."
    ],
    "options": [
      "Slide tile 6 up",
      "Slide tile 5 right",
      "Slide tile 3 down",
      "Slide tile 8 right"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Board: row1=[X,1,3] row2=[4,2,5] row3=[7,8,6]. Next?",
    "clues": [
      "Empty at (1,1); slide 1 left."
    ],
    "options": [
      "Slide tile 1 left",
      "Slide tile 4 up",
      "Slide tile 2 left",
      "Slide tile 3 left"
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

export function initialState(seed: number, _settings: EightPuzzleSettings): EightPuzzleState {
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

export function reducer(state: EightPuzzleState, action: EightPuzzleAction): EightPuzzleState {
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

export function isTerminal(state: EightPuzzleState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
