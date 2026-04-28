import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DeductionPuzzle {
  scenario: string;
  clues: string[];
  options: string[];
  correctIndex: number;
}

export interface HashiwokakeroMiniSettings { puzzles: "8"; }

export interface HashiwokakeroMiniState {
  puzzles: DeductionPuzzle[];
  currentIndex: number;
  selected: number | null;
  resolved: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type HashiwokakeroMiniAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_PUZZLES: DeductionPuzzle[] = [
  {
    "scenario": "3 islands at A=(1,1)deg2, B=(1,3)deg1, C=(3,1)deg1. Next bridge?",
    "clues": [
      "B has degree 1 with one neighbour A → single bridge.",
      "C has degree 1 with one neighbour A → single bridge."
    ],
    "options": [
      "A-B single",
      "A-B double",
      "A-C double",
      "B-C single"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Same as above; A-B already drawn (single). Next?",
    "clues": [
      "C deg 1, only neighbour A → single bridge."
    ],
    "options": [
      "A-C single",
      "A-C double",
      "B-C single",
      "A-B another single"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Islands A=(1,1)deg4, B=(1,5)deg2, C=(5,1)deg2. Next?",
    "clues": [
      "A degree 4 with 2 neighbours forces 2 bridges each.",
      "Double bridges fill A entirely."
    ],
    "options": [
      "A-B double",
      "A-C single",
      "B-C single",
      "A-B single"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "After A-B double drawn. Next on same puzzle?",
    "clues": [
      "A still needs 2 more bridges; only neighbour is C."
    ],
    "options": [
      "A-C double",
      "A-C single",
      "B-C single",
      "Done"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "A=(1,1)deg2, B=(1,3)deg2 (only neighbour). Next?",
    "clues": [
      "Each side needs degree 2; one neighbour means double bridge."
    ],
    "options": [
      "A-B double",
      "A-B single",
      "Skip",
      "Add island"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "A=(1,1)deg3, B=(1,3)deg2, C=(3,1)deg2. Next?",
    "clues": [
      "A's degree must split among B and C; degrees say A-B uses 2 (double) and A-C uses 1 (single).",
      "B fills with 2 from A. C still needs 1 more."
    ],
    "options": [
      "A-B double",
      "A-C double",
      "A-B single",
      "B-C single"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "After A-B double: A still has 1 left, C still 2 left. Next?",
    "clues": [
      "A-C single fills A's last bridge.",
      "C still needs 1 more from elsewhere."
    ],
    "options": [
      "A-C single",
      "A-C double",
      "Skip",
      "Done"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Final: A=(1,1)deg1, B=(1,3)deg1. Next?",
    "clues": [
      "Single bridge between only pair."
    ],
    "options": [
      "A-B single",
      "A-B double",
      "Skip",
      "Add"
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

export function initialState(seed: number, _settings: HashiwokakeroMiniSettings): HashiwokakeroMiniState {
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

export function reducer(state: HashiwokakeroMiniState, action: HashiwokakeroMiniAction): HashiwokakeroMiniState {
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

export function isTerminal(state: HashiwokakeroMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
