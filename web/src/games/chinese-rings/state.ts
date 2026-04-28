import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DeductionPuzzle {
  scenario: string;
  clues: string[];
  options: string[];
  correctIndex: number;
}

export interface ChineseRingsSettings { puzzles: "8"; }

export interface ChineseRingsState {
  puzzles: DeductionPuzzle[];
  currentIndex: number;
  selected: number | null;
  resolved: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type ChineseRingsAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_PUZZLES: DeductionPuzzle[] = [
  {
    "scenario": "5 rings: 1=on, 2=on, 3=on, 4=on, 5=on. All five linked through the loop. Which is the next legal move toward removing all rings?",
    "clues": [
      "Ring 1 can always be removed freely.",
      "Other rings need specific neighbouring states."
    ],
    "options": [
      "Remove ring 1",
      "Remove ring 5",
      "Remove ring 3",
      "Remove ring 2"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "5 rings: 1=off, 2=on, 3=on, 4=on, 5=on. After removing ring 1, what is the next move?",
    "clues": [
      "Ring 2 needs ring 1 on AND rings before 1 off — neither hold.",
      "Ring 3 needs ring 2 on AND ring 1 off — both hold."
    ],
    "options": [
      "Remove ring 2",
      "Remove ring 3",
      "Replace ring 1",
      "Remove ring 4"
    ],
    "correctIndex": 1
  },
  {
    "scenario": "Rings: 1=off, 2=on, 3=off, 4=on, 5=on. Next optimal move?",
    "clues": [
      "Ring 1 can always be replaced or removed.",
      "Optimal solution alternates."
    ],
    "options": [
      "Replace ring 1",
      "Remove ring 2",
      "Remove ring 4",
      "Remove ring 5"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Rings: 1=on, 2=on, 3=off, 4=on, 5=on. Next move?",
    "clues": [
      "Ring 2 needs ring 1 on AND ring before 1 off."
    ],
    "options": [
      "Remove ring 2",
      "Remove ring 1",
      "Replace ring 3",
      "Remove ring 4"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Rings: 1=off, 2=off, 3=off, 4=on, 5=on. Next move on optimal path?",
    "clues": [
      "Ring 4 needs ring 3 on AND rings 1-2 off — currently false.",
      "Ring 1 free."
    ],
    "options": [
      "Remove ring 4",
      "Replace ring 1",
      "Remove ring 5",
      "Replace ring 3"
    ],
    "correctIndex": 1
  },
  {
    "scenario": "Rings: 1=on, 2=off, 3=off, 4=on, 5=on. Next move?",
    "clues": [
      "Ring 4 condition: ring 3 on, rings 1-2 off. Not satisfied.",
      "Ring 1 always free."
    ],
    "options": [
      "Remove ring 1",
      "Remove ring 4",
      "Replace ring 3",
      "Remove ring 5"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Rings: 1=off, 2=off, 3=on, 4=on, 5=on. Next?",
    "clues": [
      "Ring 4 needs ring 3 on AND rings 1-2 off — yes!"
    ],
    "options": [
      "Remove ring 4",
      "Replace ring 1",
      "Remove ring 5",
      "Replace ring 2"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Final: rings 1=off, 2=off, 3=on, 4=off, 5=on. Next move toward solving?",
    "clues": [
      "Ring 1 always free. Ring 5 needs ring 4 on, rings 1-3 off — false."
    ],
    "options": [
      "Replace ring 1",
      "Remove ring 5",
      "Replace ring 4",
      "Remove ring 3"
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

export function initialState(seed: number, _settings: ChineseRingsSettings): ChineseRingsState {
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

export function reducer(state: ChineseRingsState, action: ChineseRingsAction): ChineseRingsState {
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

export function isTerminal(state: ChineseRingsState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
