import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface WeighingPuzzle {
  title: string;
  description: string;
  numBalls: number;
  oddBallIndex: number; // 0-based
  oddBallHeavy: boolean; // true = heavier, false = lighter
  /** pre-scripted weighing results for this puzzle */
  weighings: WeighingResult[];
  /** correct answer = ball number (1-based) and whether heavier */
  answer: { ball: number; heavier: boolean };
}

export interface WeighingResult {
  left: number[];
  right: number[];
  result: "left" | "right" | "equal";
}

export interface WeighingSettings {
  dummy?: string;
}

export interface WeighingState {
  settings: WeighingSettings;
  puzzle: WeighingPuzzle;
  /** user's current guess: which ball (1-based, 0=not selected) and heavier/lighter */
  guessedBall: number;
  guessedHeavier: boolean;
  submitted: boolean;
  correct: boolean;
  rngSeed: number;
}

export type WeighingAction =
  | { type: "selectBall"; ball: number }
  | { type: "selectWeight"; heavier: boolean }
  | { type: "submit" }
  | { type: "reset" };

export const PUZZLES: WeighingPuzzle[] = [
  {
    title: "12 Balls – 3 Weighings",
    description: "You have 12 balls. One is either heavier or lighter. Using 3 balance weighings, find the odd ball.",
    numBalls: 12,
    oddBallIndex: 7,
    oddBallHeavy: true,
    weighings: [
      { left: [1, 2, 3, 4], right: [5, 6, 7, 8], result: "right" },
      { left: [5, 6, 7], right: [9, 10, 11], result: "left" },
      { left: [5, 6], right: [7, 8], result: "right" },
    ],
    answer: { ball: 8, heavier: true },
  },
  {
    title: "8 Balls – 2 Weighings",
    description: "8 balls, one is heavier. Find it in 2 weighings.",
    numBalls: 8,
    oddBallIndex: 4,
    oddBallHeavy: true,
    weighings: [
      { left: [1, 2, 3], right: [4, 5, 6], result: "right" },
      { left: [4, 5], right: [6, 7], result: "left" },
    ],
    answer: { ball: 4, heavier: true },
  },
  {
    title: "9 Balls – 2 Weighings",
    description: "9 balls, one is heavier. Find it in 2 weighings.",
    numBalls: 9,
    oddBallIndex: 8,
    oddBallHeavy: true,
    weighings: [
      { left: [1, 2, 3], right: [4, 5, 6], result: "equal" },
      { left: [7, 8], right: [9, 1], result: "left" },
    ],
    answer: { ball: 7, heavier: true },
  },
  {
    title: "6 Balls – Light Impostor",
    description: "6 balls, one is lighter. Find it in 2 weighings.",
    numBalls: 6,
    oddBallIndex: 2,
    oddBallHeavy: false,
    weighings: [
      { left: [1, 2], right: [3, 4], result: "right" },
      { left: [1], right: [2], result: "equal" },
    ],
    answer: { ball: 3, heavier: false },
  },
  {
    title: "10 Balls – Unknown Odd",
    description: "10 balls, one may be heavier or lighter. Use the clues to deduce which.",
    numBalls: 10,
    oddBallIndex: 9,
    oddBallHeavy: false,
    weighings: [
      { left: [1, 2, 3, 4], right: [5, 6, 7, 8], result: "left" },
      { left: [1, 2, 5], right: [3, 6, 9], result: "equal" },
      { left: [7], right: [10], result: "right" },
    ],
    answer: { ball: 10, heavier: false },
  },
  {
    title: "3 Balls – Warmup",
    description: "3 balls, one is heavier. Find it in 1 weighing.",
    numBalls: 3,
    oddBallIndex: 1,
    oddBallHeavy: true,
    weighings: [
      { left: [1], right: [2], result: "right" },
    ],
    answer: { ball: 2, heavier: true },
  },
  {
    title: "4 Balls – Lighter Imposter",
    description: "4 balls, one is lighter. Use 2 weighings.",
    numBalls: 4,
    oddBallIndex: 3,
    oddBallHeavy: false,
    weighings: [
      { left: [1, 2], right: [3, 4], result: "left" },
      { left: [3], right: [4], result: "right" },
    ],
    answer: { ball: 4, heavier: false },
  },
  {
    title: "5 Balls – Mystery",
    description: "5 balls, one differs in weight. Use the scale results to find it.",
    numBalls: 5,
    oddBallIndex: 0,
    oddBallHeavy: true,
    weighings: [
      { left: [1, 2], right: [3, 4], result: "left" },
      { left: [1], right: [2], result: "left" },
    ],
    answer: { ball: 1, heavier: true },
  },
];

export function initialState(seed: number, settings: WeighingSettings): WeighingState {
  const rng = mulberry32(seed);
  const puzzle = PUZZLES[Math.floor(rng() * PUZZLES.length)]!;
  return {
    settings,
    puzzle,
    guessedBall: 0,
    guessedHeavier: true,
    submitted: false,
    correct: false,
    rngSeed: seed,
  };
}

export function reducer(state: WeighingState, action: WeighingAction): WeighingState {
  if (state.submitted && action.type !== "reset") return state;
  switch (action.type) {
    case "selectBall":
      return { ...state, guessedBall: action.ball };
    case "selectWeight":
      return { ...state, guessedHeavier: action.heavier };
    case "submit": {
      if (state.guessedBall === 0) return state;
      const { ball, heavier } = state.puzzle.answer;
      const correct = state.guessedBall === ball && state.guessedHeavier === heavier;
      return { ...state, submitted: true, correct };
    }
    case "reset": {
      const rng = mulberry32(state.rngSeed + 1);
      const puzzle = PUZZLES[Math.floor(rng() * PUZZLES.length)]!;
      return {
        ...state,
        puzzle,
        guessedBall: 0,
        guessedHeavier: true,
        submitted: false,
        correct: false,
        rngSeed: state.rngSeed + 1,
      };
    }
    default:
      return state;
  }
}

export function isTerminal(state: WeighingState): { score: number } | null {
  if (!state.submitted) return null;
  return { score: state.correct ? 1000 : 0 };
}
