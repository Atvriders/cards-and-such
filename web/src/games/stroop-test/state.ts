import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type ColorName = "red" | "green" | "blue" | "yellow" | "purple" | "orange";

const ALL_COLORS: ColorName[] = ["red", "green", "blue", "yellow", "purple", "orange"];

export interface StroopCard {
  word: ColorName;  // the text shown
  ink: ColorName;   // the actual color of the ink
}

function makeCard(rng: () => number, congruent: boolean): StroopCard {
  const word = ALL_COLORS[Math.floor(rng() * ALL_COLORS.length)]!;
  if (congruent) {
    return { word, ink: word };
  }
  // Ensure ink differs from word
  let ink: ColorName;
  do {
    ink = ALL_COLORS[Math.floor(rng() * ALL_COLORS.length)]!;
  } while (ink === word);
  return { word, ink };
}

function buildDeck(seed: number, count: number, difficulty: "easy" | "medium" | "hard"): StroopCard[] {
  const rng = mulberry32(seed);
  // easy: 40% congruent, medium: 20%, hard: 5%
  const congruentRate = difficulty === "easy" ? 0.4 : difficulty === "medium" ? 0.2 : 0.05;
  return Array.from({ length: count }, () => makeCard(rng, rng() < congruentRate));
}

export interface StroopTestState {
  settings: { rounds: "20" | "30" | "40"; difficulty: "easy" | "medium" | "hard" };
  deck: StroopCard[];
  currentIndex: number;
  correct: number;
  incorrect: number;
  elapsed: number;
  ended: boolean;
  lastResult: "correct" | "wrong" | null;
  rngSeed: number;
}

export type StroopTestAction =
  | { type: "answer"; color: ColorName }
  | { type: "tick"; dt: number };

export function initialState(
  seed: number,
  settings: { rounds: "20" | "30" | "40"; difficulty: "easy" | "medium" | "hard" },
): StroopTestState {
  const count = parseInt(settings.rounds, 10);
  return {
    settings,
    deck: buildDeck(seed, count, settings.difficulty),
    currentIndex: 0,
    correct: 0,
    incorrect: 0,
    elapsed: 0,
    ended: false,
    lastResult: null,
    rngSeed: seed,
  };
}

export function reducer(state: StroopTestState, action: StroopTestAction): StroopTestState {
  if (state.ended) return state;

  switch (action.type) {
    case "tick": {
      return { ...state, elapsed: state.elapsed + action.dt };
    }
    case "answer": {
      const card = state.deck[state.currentIndex];
      if (!card) return { ...state, ended: true };
      const isCorrect = action.color === card.ink;
      const newIndex = state.currentIndex + 1;
      const ended = newIndex >= state.deck.length;
      return {
        ...state,
        currentIndex: newIndex,
        correct: state.correct + (isCorrect ? 1 : 0),
        incorrect: state.incorrect + (isCorrect ? 0 : 1),
        ended,
        lastResult: isCorrect ? "correct" : "wrong",
      };
    }
    default:
      return state;
  }
}

export function calcScore(state: StroopTestState): number {
  const total = state.correct + state.incorrect;
  const acc = total === 0 ? 0 : state.correct / total;
  const speed = state.elapsed > 0 ? total / state.elapsed : 0; // cards per second
  return Math.round(state.correct * (1 + speed) * 10);
}

export function isTerminal(state: StroopTestState): { score: number } | null {
  if (!state.ended) return null;
  return { score: calcScore(state) };
}
