import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface PriceGuessSettings {
  items: "10" | "15" | "20";
}

export interface PriceItem {
  name: string;
  target: number; // true price in dollars
}

export interface PriceGuessState {
  settings: PriceGuessSettings;
  items: PriceItem[];
  currentIndex: number;
  guessInput: string;
  submitted: boolean;
  lastGuess: number | null;
  roundScore: number; // points this item
  totalScore: number;
  won: number; // items won (within 10%)
  phase: "guessing" | "result" | "done";
  seed: number;
}

export type PriceGuessAction =
  | { type: "set_input"; value: string }
  | { type: "submit" }
  | { type: "next" };

const ALL_ITEMS: PriceItem[] = [
  { name: "Box of breakfast cereal", target: 5 },
  { name: "Gallon of milk", target: 4 },
  { name: "Dozen eggs", target: 4 },
  { name: "Loaf of bread", target: 4 },
  { name: "Pound of ground beef", target: 6 },
  { name: "Can of soup", target: 2 },
  { name: "Bag of apples (3 lb)", target: 5 },
  { name: "Bag of potato chips", target: 4 },
  { name: "Jar of peanut butter", target: 4 },
  { name: "Bar of chocolate", target: 3 },
  { name: "Bottle of ketchup", target: 3 },
  { name: "Tube of toothpaste", target: 5 },
  { name: "Bar of hand soap", target: 3 },
  { name: "Bottle of shampoo", target: 7 },
  { name: "Roll of paper towels (4 pk)", target: 8 },
  { name: "Box of tissues", target: 4 },
  { name: "Can of coffee (12 oz)", target: 9 },
  { name: "Orange juice (64 oz)", target: 5 },
  { name: "Frozen pizza", target: 6 },
  { name: "Bag of rice (5 lb)", target: 6 },
  { name: "Pasta (1 lb)", target: 2 },
  { name: "Jar of pasta sauce", target: 3 },
  { name: "Block of cheddar cheese", target: 5 },
  { name: "Container of yogurt", target: 5 },
  { name: "Bottle of olive oil", target: 9 },
  { name: "Pack of AA batteries (4)", target: 6 },
  { name: "Roll of aluminum foil", target: 4 },
  { name: "Dish soap (25 oz)", target: 4 },
  { name: "Laundry detergent (50 oz)", target: 12 },
  { name: "Disposable razor 4-pack", target: 8 },
];

function scoreGuess(guess: number, target: number): { points: number; win: boolean } {
  const pct = Math.abs(guess - target) / target;
  if (pct <= 0.10) return { points: 1000, win: true };
  if (pct <= 0.25) return { points: 500, win: false };
  if (pct <= 0.50) return { points: 200, win: false };
  return { points: 0, win: false };
}

export function initialState(seed: number, settings: PriceGuessSettings): PriceGuessState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.items);
  const pool = [...ALL_ITEMS];
  // shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return {
    settings,
    items: pool.slice(0, count),
    currentIndex: 0,
    guessInput: "",
    submitted: false,
    lastGuess: null,
    roundScore: 0,
    totalScore: 0,
    won: 0,
    phase: "guessing",
    seed,
  };
}

export function reducer(state: PriceGuessState, action: PriceGuessAction): PriceGuessState {
  switch (action.type) {
    case "set_input":
      if (state.phase !== "guessing") return state;
      return { ...state, guessInput: action.value };

    case "submit": {
      if (state.phase !== "guessing") return state;
      const guess = parseFloat(state.guessInput);
      if (isNaN(guess) || guess <= 0) return state;
      const item = state.items[state.currentIndex]!;
      const { points, win } = scoreGuess(guess, item.target);
      return {
        ...state,
        submitted: true,
        lastGuess: guess,
        roundScore: points,
        totalScore: state.totalScore + points,
        won: state.won + (win ? 1 : 0),
        phase: "result",
      };
    }

    case "next": {
      if (state.phase !== "result") return state;
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.items.length) {
        return { ...state, phase: "done" };
      }
      return {
        ...state,
        currentIndex: nextIndex,
        guessInput: "",
        submitted: false,
        lastGuess: null,
        roundScore: 0,
        phase: "guessing",
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: PriceGuessState): { score: number } | null {
  if (state.phase === "done") return { score: state.totalScore };
  return null;
}
