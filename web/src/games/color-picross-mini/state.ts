import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DeductionPuzzle {
  scenario: string;
  clues: string[];
  options: string[];
  correctIndex: number;
}

export interface ColorPicrossMiniSettings { puzzles: "8"; }

export interface ColorPicrossMiniState {
  puzzles: DeductionPuzzle[];
  currentIndex: number;
  selected: number | null;
  resolved: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type ColorPicrossMiniAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_PUZZLES: DeductionPuzzle[] = [
  {
    "scenario": "Row clue: (2 red)(1 blue) in 4-cell row. Cell column 4 — what colour?",
    "clues": [
      "Possible arrangements: RRBB-no, RR_B, _RRB, RRB_. Cell 4 = blank or B in some.",
      "Both RR_B and _RRB place R or _ at col 4 — wait recompute: RR_B: col4=B. _RRB: col4=B. RRB_: col4=blank."
    ],
    "options": [
      "red",
      "blue",
      "blank",
      "green"
    ],
    "correctIndex": 1
  },
  {
    "scenario": "Row (1 red)(2 blue) in 4 cells. Col 1?",
    "clues": [
      "Arrangements: R_BB or RBB_ or _RBB. Col 1: R, R, blank — common is R."
    ],
    "options": [
      "red",
      "blue",
      "blank",
      "green"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Row (1 red)(1 red) in 4 cells. Col 2?",
    "clues": [
      "Same-colour runs need a gap. Arrangements: R_R_, R__R, _R_R. Col 2: blank or R."
    ],
    "options": [
      "blank",
      "red",
      "blue",
      "green"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Row (2 red)(2 blue) in 4 cells. Col 3?",
    "clues": [
      "Only one arrangement: RRBB. Col 3 = B."
    ],
    "options": [
      "blue",
      "red",
      "blank",
      "green"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Row (1 blue)(1 red)(1 blue) in 5 cells. Col 3?",
    "clues": [
      "Possible: BRB__ B_RB_ B__RB _BRB_ _B_RB __BRB. Col 3 always between R and last B... mostly R."
    ],
    "options": [
      "red",
      "blue",
      "blank",
      "green"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Row (3 red) in 4 cells. Col 1?",
    "clues": [
      "Arrangements RRR_ or _RRR. Col 1 = R or blank."
    ],
    "options": [
      "blank",
      "red",
      "blue",
      "green"
    ],
    "correctIndex": 1
  },
  {
    "scenario": "Row (2 blue)(1 red) in 5 cells. Col 5?",
    "clues": [
      "Possible: BB_R_ BB__R BBR__ no different colours touching ok. _BBR_ etc. col 5 mostly blank or R."
    ],
    "options": [
      "blank",
      "red",
      "blue",
      "green"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Row (1 red)(1 blue)(1 red) in 5 cells. Col 1?",
    "clues": [
      "Arrangements R B R _ _ etc. Col 1 = R or blank."
    ],
    "options": [
      "red",
      "blue",
      "blank",
      "green"
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

export function initialState(seed: number, _settings: ColorPicrossMiniSettings): ColorPicrossMiniState {
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

export function reducer(state: ColorPicrossMiniState, action: ColorPicrossMiniAction): ColorPicrossMiniState {
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

export function isTerminal(state: ColorPicrossMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
