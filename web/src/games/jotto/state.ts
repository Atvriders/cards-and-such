import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DeductionPuzzle {
  scenario: string;
  clues: string[];
  options: string[];
  correctIndex: number;
}

export interface JottoSettings { puzzles: "8"; }

export interface JottoState {
  puzzles: DeductionPuzzle[];
  currentIndex: number;
  selected: number | null;
  resolved: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type JottoAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_PUZZLES: DeductionPuzzle[] = [
  {
    "scenario": "5-letter secret word (no repeats). Trial counts:",
    "clues": [
      "AUDIO → 2 letters in common",
      "STAGE → 1 letter in common"
    ],
    "options": [
      "RADIO",
      "PIANO",
      "MOUTH",
      "CLOUD"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "5-letter secret word.",
    "clues": [
      "CRANE → 3 in common",
      "SLATE → 2 in common"
    ],
    "options": [
      "BRACE",
      "TRADE",
      "CHASE",
      "PLANT"
    ],
    "correctIndex": 1
  },
  {
    "scenario": "5-letter secret.",
    "clues": [
      "LIGHT → 4 in common",
      "NIGHT → 4 in common"
    ],
    "options": [
      "FLIGHT",
      "EIGHT",
      "RIGHT",
      "MIGHT"
    ],
    "correctIndex": 2
  },
  {
    "scenario": "Secret word.",
    "clues": [
      "WATER → 1 in common",
      "BRICK → 2 in common"
    ],
    "options": [
      "BLOCK",
      "BLINK",
      "BRACE",
      "PRICE"
    ],
    "correctIndex": 3
  },
  {
    "scenario": "Logic word.",
    "clues": [
      "MUSIC → 0 in common",
      "PLANT → 5 in common"
    ],
    "options": [
      "GRADE",
      "PLANT",
      "BRAVE",
      "QUEEN"
    ],
    "correctIndex": 1
  },
  {
    "scenario": "Hard puzzle.",
    "clues": [
      "HOUSE → 3 in common",
      "STONE → 2 in common"
    ],
    "options": [
      "MOUSE",
      "HORSE",
      "PHONE",
      "ABOVE"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Five-letter mystery.",
    "clues": [
      "DREAM → 2 in common",
      "FRAME → 3 in common"
    ],
    "options": [
      "BLAME",
      "GRAPE",
      "FLAKE",
      "GRADE"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Final puzzle.",
    "clues": [
      "ABOUT → 0 in common",
      "GRIND → 4 in common"
    ],
    "options": [
      "FLINT",
      "GRIND",
      "GRINS",
      "BRING"
    ],
    "correctIndex": 3
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

export function initialState(seed: number, _settings: JottoSettings): JottoState {
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

export function reducer(state: JottoState, action: JottoAction): JottoState {
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

export function isTerminal(state: JottoState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
