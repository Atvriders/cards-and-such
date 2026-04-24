import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Farmyard Match — match animals to their homes in a drag-and-drop style guessing game

export type Animal = "cow" | "pig" | "sheep" | "chicken" | "horse" | "duck";
export type Home = "barn" | "sty" | "pen" | "coop" | "stable" | "pond";

export interface FarmSettings {
  count: "4" | "6";
}

export interface FarmState {
  settings: FarmSettings;
  rngSeed: number;
  animals: Animal[];
  homes: Home[];
  userGuesses: (Home | null)[]; // guess for each animal slot
  submitted: boolean;
  correctCount: number;
  message: string;
}

export type FarmAction =
  | { type: "guess"; animalIndex: number; home: Home }
  | { type: "submit" };

const ANIMAL_HOME: Record<Animal, Home> = {
  cow: "barn",
  pig: "sty",
  sheep: "pen",
  chicken: "coop",
  horse: "stable",
  duck: "pond",
};

const ALL_ANIMALS: Animal[] = ["cow", "pig", "sheep", "chicken", "horse", "duck"];

export function initialState(seed: number, settings: FarmSettings): FarmState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.count);

  // Shuffle animals and pick count of them
  const shuffled = [...ALL_ANIMALS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = shuffled[i]!;
    shuffled[i] = shuffled[j]!;
    shuffled[j] = tmp;
  }
  const animals = shuffled.slice(0, count);
  const homes = animals.map(a => ANIMAL_HOME[a]);

  // Shuffle homes for display
  const shuffledHomes = [...homes];
  for (let i = shuffledHomes.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = shuffledHomes[i]!;
    shuffledHomes[i] = shuffledHomes[j]!;
    shuffledHomes[j] = tmp;
  }

  return {
    settings,
    rngSeed: seed,
    animals,
    homes: shuffledHomes,
    userGuesses: new Array(count).fill(null),
    submitted: false,
    correctCount: 0,
    message: "Match each animal to its home, then Submit!",
  };
}

export function reducer(state: FarmState, action: FarmAction): FarmState {
  if (state.submitted) return state;

  if (action.type === "guess") {
    const newGuesses = [...state.userGuesses];
    newGuesses[action.animalIndex] = action.home;
    return { ...state, userGuesses: newGuesses, message: "Match each animal to its home, then Submit!" };
  }

  if (action.type === "submit") {
    const correctCount = state.animals.reduce((acc, animal, i) => {
      return acc + (state.userGuesses[i] === ANIMAL_HOME[animal] ? 1 : 0);
    }, 0);
    const total = state.animals.length;
    return {
      ...state,
      submitted: true,
      correctCount,
      message: `${correctCount}/${total} correct! ${correctCount === total ? "Perfect!" : "Keep practicing!"}`,
    };
  }

  return state;
}

export function isTerminal(state: FarmState): { score: number } | null {
  if (!state.submitted) return null;
  return { score: Math.round((state.correctCount / state.animals.length) * 100) };
}

export { ANIMAL_HOME };
