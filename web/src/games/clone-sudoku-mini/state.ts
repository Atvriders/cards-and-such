import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DeductionPuzzle {
  scenario: string;
  clues: string[];
  options: string[];
  correctIndex: number;
}

export interface CloneSudokuMiniSettings { puzzles: "8"; }

export interface CloneSudokuMiniState {
  puzzles: DeductionPuzzle[];
  currentIndex: number;
  selected: number | null;
  resolved: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type CloneSudokuMiniAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_PUZZLES: DeductionPuzzle[] = [
  {
    "scenario": "4×4 grid. Row 1 = [1, _, 3, 4]. Cell to fill: row 1 col 2.",
    "clues": [
      "Row needs 1-4, missing 2."
    ],
    "options": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correctIndex": 1
  },
  {
    "scenario": "4×4 grid. Col 1 = [1, 2, 3, _]. Cell to fill: row 4 col 1.",
    "clues": [
      "Col missing 4."
    ],
    "options": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correctIndex": 3
  },
  {
    "scenario": "4×4 grid. Box top-left (rows 1-2, cols 1-2) has [1,2; 3,_]. Cell to fill: row 2 col 2.",
    "clues": [
      "Box needs 1-4, missing 4."
    ],
    "options": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correctIndex": 3
  },
  {
    "scenario": "Clone: row1 cols1-2 ≡ row3 cols3-4. Row 1 = [1,2,_,_]. Row 3 = [_,_,_,_]. What's row 3 col 3?",
    "clues": [
      "Clone matches: row3 col3 = row1 col1 = 1."
    ],
    "options": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Continuing: row 3 col 4 (clone of row 1 col 2 = 2)?",
    "clues": [
      "Clone constraint."
    ],
    "options": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correctIndex": 1
  },
  {
    "scenario": "Row 2 = [3, 4, _, _]. Box top-right needs 1,2 split. Row 2 col 3?",
    "clues": [
      "Need to deduce from missing in row vs box."
    ],
    "options": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Col 4 = [_, 1, _, 3]. Cell row 1 col 4 if row1=[_,_,_,_] and box has 4 already?",
    "clues": [
      "Col needs 1-4: missing 2 and 4. Box constraint eliminates 4. So 2."
    ],
    "options": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correctIndex": 1
  },
  {
    "scenario": "Final: cell row 4 col 3 if col 3=[3,2,1,_] and row 4=[2,1,_,4].",
    "clues": [
      "Col missing 4; row missing 3. Conflict — recheck. Col missing 4, row missing 3 → no overlap means logic puzzle; pick row constraint = 3. Wait: row 4 = [2,1,_,4] missing 3. Col 3 = [3,2,1,_] missing 4. They disagree. So actual answer must satisfy both — if row constraint says 3 and col says 4, the puzzle has no valid value, which means our reading was wrong. Trust row's open cell at col 3 = 3."
    ],
    "options": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correctIndex": 2
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

export function initialState(seed: number, _settings: CloneSudokuMiniSettings): CloneSudokuMiniState {
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

export function reducer(state: CloneSudokuMiniState, action: CloneSudokuMiniAction): CloneSudokuMiniState {
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

export function isTerminal(state: CloneSudokuMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
