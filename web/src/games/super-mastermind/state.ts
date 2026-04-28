import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DeductionPuzzle {
  scenario: string;
  clues: string[];
  options: string[];
  correctIndex: number;
}

export interface SuperMastermindSettings { puzzles: "8"; }

export interface SuperMastermindState {
  puzzles: DeductionPuzzle[];
  currentIndex: number;
  selected: number | null;
  resolved: boolean;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type SuperMastermindAction =
  | { type: "select"; index: number }
  | { type: "submit" }
  | { type: "next" };

const ALL_PUZZLES: DeductionPuzzle[] = [
  {
    "scenario": "5-peg 8-color secret code (colors: R O Y G B P W K).",
    "clues": [
      "Trial RYBGW: 2 black pegs, 1 white peg.",
      "Trial OYGBP: 1 black peg, 2 white pegs."
    ],
    "options": [
      "RYBGP",
      "OYBGW",
      "RBGYW",
      "ROYGB"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "5-peg secret using R G B Y W (5 colors).",
    "clues": [
      "Trial RRRRR: 1 black peg.",
      "Trial GGGGG: 1 black peg."
    ],
    "options": [
      "RGYWB",
      "BWYGR",
      "YRGWB",
      "BRYWG"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "5-peg secret with possible repeats.",
    "clues": [
      "Trial WWWWW: 2 black pegs.",
      "Trial RBWGY: 1 black peg, 2 white pegs."
    ],
    "options": [
      "WGWBY",
      "WBWGR",
      "RWBWY",
      "GWWYR"
    ],
    "correctIndex": 1
  },
  {
    "scenario": "Code uses 8 possible colors (no repeats).",
    "clues": [
      "Trial ROYGB: 0 black, 3 white.",
      "Trial PWKOG: 1 black, 2 white."
    ],
    "options": [
      "YOPGW",
      "OYPWG",
      "PWGYO",
      "BPWGY"
    ],
    "correctIndex": 1
  },
  {
    "scenario": "Detective scenario: 5 colors RGBPW.",
    "clues": [
      "Trial RGBPW: 2 black pegs.",
      "Trial PWBGR: 1 black peg."
    ],
    "options": [
      "RGPBW",
      "RBPGW",
      "RBPWG",
      "WRGBP"
    ],
    "correctIndex": 1
  },
  {
    "scenario": "5-peg challenge.",
    "clues": [
      "Trial YGRWP: 0 black, 2 white.",
      "Trial BPWYG: 1 black, 1 white."
    ],
    "options": [
      "RPGYB",
      "BRPGY",
      "WGRBP",
      "PRYBG"
    ],
    "correctIndex": 0
  },
  {
    "scenario": "Tough deduction.",
    "clues": [
      "Trial OOOOO: 0 black pegs.",
      "Trial RYBGP: 5 black pegs."
    ],
    "options": [
      "YBGRP",
      "RYBGP",
      "RGBYP",
      "PYBGR"
    ],
    "correctIndex": 1
  },
  {
    "scenario": "Mixed feedback.",
    "clues": [
      "Trial WPGRY: 1 black peg.",
      "Trial GYWRP: 1 black peg, 3 white pegs."
    ],
    "options": [
      "YPWGR",
      "GPWYR",
      "GWPYR",
      "PWYGR"
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

export function initialState(seed: number, _settings: SuperMastermindSettings): SuperMastermindState {
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

export function reducer(state: SuperMastermindState, action: SuperMastermindAction): SuperMastermindState {
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

export function isTerminal(state: SuperMastermindState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
