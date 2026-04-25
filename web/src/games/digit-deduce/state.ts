import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DigitClue {
  type: "equals" | "sum" | "product" | "greater" | "less" | "different" | "between" | "isOdd" | "isEven" | "divisible";
  positions?: number[]; // 1-based
  value?: number;
  description: string;
}

export interface DigitPuzzle {
  id: string;
  title: string;
  length: number;
  /** solution digits array (0-based positions) */
  solution: number[];
  clues: DigitClue[];
}

export interface DigitSettings {
  dummy?: string;
}

export interface DigitState {
  settings: DigitSettings;
  puzzle: DigitPuzzle;
  /** user's current digit entries (null = blank) */
  entries: (number | null)[];
  submitted: boolean;
  correct: boolean;
  moves: number;
  rngSeed: number;
}

export type DigitAction =
  | { type: "setDigit"; pos: number; digit: number | null }
  | { type: "submit" }
  | { type: "reset" };

export const PUZZLES: DigitPuzzle[] = [
  {
    id: "d1",
    title: "The Four Digits",
    length: 4,
    solution: [3, 7, 2, 6],
    clues: [
      { type: "sum", positions: [1, 2], value: 10, description: "Digits 1 and 2 sum to 10." },
      { type: "product", positions: [3, 4], value: 12, description: "Digits 3 and 4 have product 12." },
      { type: "isOdd", positions: [1], description: "Digit 1 is odd." },
      { type: "greater", positions: [2], value: 4, description: "Digit 2 is greater than 4." },
      { type: "less", positions: [3], value: 5, description: "Digit 3 is less than 5." },
      { type: "isEven", positions: [4], description: "Digit 4 is even." },
    ],
  },
  {
    id: "d2",
    title: "The Five Code",
    length: 5,
    solution: [1, 4, 9, 2, 5],
    clues: [
      { type: "sum", positions: [1, 2, 3], value: 14, description: "The sum of digits 1, 2, and 3 is 14." },
      { type: "isOdd", positions: [3], description: "Digit 3 is a perfect square (and odd)." },
      { type: "product", positions: [4, 5], value: 10, description: "Digits 4 and 5 have product 10." },
      { type: "less", positions: [2], value: 5, description: "Digit 2 is less than 5." },
      { type: "isEven", positions: [4], description: "Digit 4 is even." },
      { type: "divisible", positions: [5], value: 5, description: "Digit 5 is divisible by 5." },
    ],
  },
  {
    id: "d3",
    title: "The Triangle",
    length: 3,
    solution: [8, 3, 5],
    clues: [
      { type: "sum", positions: [1, 2, 3], value: 16, description: "The three digits sum to 16." },
      { type: "greater", positions: [1], value: 5, description: "Digit 1 is greater than 5." },
      { type: "between", positions: [2], value: 2, description: "Digit 2 is between 2 and 5 (exclusive)." },
      { type: "isOdd", positions: [3], description: "Digit 3 is odd." },
      { type: "different", positions: [1, 2], description: "Digits 1 and 2 are different." },
    ],
  },
  {
    id: "d4",
    title: "The Ladder",
    length: 6,
    solution: [2, 4, 6, 8, 1, 3],
    clues: [
      { type: "isEven", positions: [1], description: "Digit 1 is even." },
      { type: "isEven", positions: [2], description: "Digit 2 is even." },
      { type: "isEven", positions: [3], description: "Digit 3 is even." },
      { type: "isEven", positions: [4], description: "Digit 4 is even." },
      { type: "isOdd", positions: [5], description: "Digit 5 is odd." },
      { type: "isOdd", positions: [6], description: "Digit 6 is odd." },
      { type: "sum", positions: [1, 2, 3, 4], value: 20, description: "The first four digits sum to 20." },
      { type: "sum", positions: [5, 6], value: 4, description: "The last two digits sum to 4." },
      { type: "less", positions: [1], value: 4, description: "Digit 1 is less than 4." },
      { type: "greater", positions: [4], value: 6, description: "Digit 4 is greater than 6." },
    ],
  },
  {
    id: "d5",
    title: "Prime Path",
    length: 4,
    solution: [2, 3, 5, 7],
    clues: [
      { type: "sum", positions: [1, 2, 3, 4], value: 17, description: "All four digits sum to 17." },
      { type: "isEven", positions: [1], description: "Digit 1 is even." },
      { type: "isOdd", positions: [2], description: "Digit 2 is odd." },
      { type: "isOdd", positions: [3], description: "Digit 3 is odd." },
      { type: "isOdd", positions: [4], description: "Digit 4 is odd." },
      { type: "less", positions: [2], value: 5, description: "Digit 2 is less than 5." },
      { type: "greater", positions: [4], value: 5, description: "Digit 4 is greater than 5." },
      { type: "different", positions: [1, 2], description: "All digits are different prime numbers." },
    ],
  },
  {
    id: "d6",
    title: "The Square",
    length: 4,
    solution: [1, 4, 9, 6],
    clues: [
      { type: "sum", positions: [1, 2, 3, 4], value: 20, description: "All four digits sum to 20." },
      { type: "isOdd", positions: [1], description: "Digit 1 is odd." },
      { type: "isEven", positions: [2], description: "Digit 2 is even." },
      { type: "isOdd", positions: [3], description: "Digit 3 is odd and greater than 5." },
      { type: "isEven", positions: [4], description: "Digit 4 is even and greater than 4." },
      { type: "less", positions: [1], value: 3, description: "Digit 1 is less than 3." },
      { type: "greater", positions: [3], value: 5, description: "Digit 3 is greater than 5." },
    ],
  },
  {
    id: "d7",
    title: "Mirror Digits",
    length: 5,
    solution: [3, 6, 9, 6, 3],
    clues: [
      { type: "equals", positions: [1], value: 3, description: "Digit 1 equals 3." },
      { type: "equals", positions: [5], value: 3, description: "Digit 5 equals digit 1." },
      { type: "sum", positions: [2, 4], value: 12, description: "Digits 2 and 4 sum to 12." },
      { type: "divisible", positions: [3], value: 3, description: "Digit 3 is divisible by 3." },
      { type: "greater", positions: [3], value: 5, description: "Digit 3 is greater than 5." },
      { type: "equals", positions: [2], value: 6, description: "Digit 2 equals 6." },
    ],
  },
  {
    id: "d8",
    title: "Double Trouble",
    length: 4,
    solution: [5, 5, 5, 5],
    clues: [
      { type: "sum", positions: [1, 2, 3, 4], value: 20, description: "All four digits sum to 20." },
      { type: "product", positions: [1, 2], value: 25, description: "Digits 1 and 2 have product 25." },
      { type: "equals", positions: [3], value: 5, description: "Digit 3 is 5." },
      { type: "isOdd", positions: [4], description: "Digit 4 is odd." },
      { type: "divisible", positions: [1], value: 5, description: "Digit 1 is divisible by 5 (and not zero)." },
    ],
  },
];

export function initialState(seed: number, settings: DigitSettings): DigitState {
  const rng = mulberry32(seed);
  const puzzle = PUZZLES[Math.floor(rng() * PUZZLES.length)]!;
  return {
    settings,
    puzzle,
    entries: new Array<null>(puzzle.length).fill(null),
    submitted: false,
    correct: false,
    moves: 0,
    rngSeed: seed,
  };
}

export function reducer(state: DigitState, action: DigitAction): DigitState {
  if (state.submitted && action.type !== "reset") return state;
  switch (action.type) {
    case "setDigit": {
      const next = [...state.entries];
      next[action.pos] = action.digit;
      return { ...state, entries: next, moves: state.moves + 1 };
    }
    case "submit": {
      if (state.entries.some((e) => e === null)) return state;
      const correct = state.entries.every((e, i) => e === state.puzzle.solution[i]);
      return { ...state, submitted: true, correct };
    }
    case "reset": {
      const rng = mulberry32(state.rngSeed + 1);
      const puzzle = PUZZLES[Math.floor(rng() * PUZZLES.length)]!;
      return {
        ...state,
        puzzle,
        entries: new Array<null>(puzzle.length).fill(null),
        submitted: false,
        correct: false,
        moves: 0,
        rngSeed: state.rngSeed + 1,
      };
    }
    default:
      return state;
  }
}

export function isTerminal(state: DigitState): { score: number } | null {
  if (!state.submitted) return null;
  return { score: state.correct ? Math.max(100, 1000 - state.moves * 20) : 0 };
}
