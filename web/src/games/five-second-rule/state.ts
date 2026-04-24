import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface FiveSecSettings {
  rounds: "10" | "15" | "20";
  timeLimit: "5" | "7" | "10";
}

const PROMPTS: string[] = [
  "Name 3 things you find in a kitchen",
  "Name 3 animals that live in the ocean",
  "Name 3 countries in Europe",
  "Name 3 famous athletes",
  "Name 3 things you bring to the beach",
  "Name 3 types of cheese",
  "Name 3 superheroes",
  "Name 3 things that are yellow",
  "Name 3 board games",
  "Name 3 US states",
  "Name 3 pizza toppings",
  "Name 3 dog breeds",
  "Name 3 types of pasta",
  "Name 3 languages",
  "Name 3 things in a school classroom",
  "Name 3 Olympic sports",
  "Name 3 things you wear on your feet",
  "Name 3 cartoon characters",
  "Name 3 vegetables",
  "Name 3 desserts",
  "Name 3 famous musicians",
  "Name 3 car brands",
  "Name 3 things you find at a campsite",
  "Name 3 types of weather",
  "Name 3 things that are blue",
  "Name 3 fruits that start with A or B",
  "Name 3 things you do in the morning",
  "Name 3 movies with a number in the title",
  "Name 3 things that fly",
  "Name 3 types of music",
  "Name 3 things you find in a bathroom",
  "Name 3 card games",
  "Name 3 space-related things",
  "Name 3 things that are made of glass",
  "Name 3 famous scientists",
];

export interface FiveSecState {
  settings: FiveSecSettings;
  prompts: string[];
  currentIndex: number;
  timeLeft: number;
  succeeded: number;
  failed: number;
  phase: "playing" | "result" | "done";
  lastResult: "success" | "fail" | null;
}

export type FiveSecAction =
  | { type: "tick" }
  | { type: "got-it" }
  | { type: "pass" }
  | { type: "next" };

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: FiveSecSettings): FiveSecState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.rounds, 10);
  const timeLimit = parseInt(settings.timeLimit, 10);
  const prompts = shuffle(PROMPTS, rng).slice(0, Math.min(count, PROMPTS.length));
  return {
    settings,
    prompts,
    currentIndex: 0,
    timeLeft: timeLimit,
    succeeded: 0,
    failed: 0,
    phase: "playing",
    lastResult: null,
  };
}

export function reducer(state: FiveSecState, action: FiveSecAction): FiveSecState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "tick": {
      if (state.phase !== "playing") return state;
      const newTime = state.timeLeft - 1;
      if (newTime <= 0) {
        return { ...state, timeLeft: 0, failed: state.failed + 1, phase: "result", lastResult: "fail" };
      }
      return { ...state, timeLeft: newTime };
    }
    case "got-it": {
      if (state.phase !== "playing") return state;
      return { ...state, succeeded: state.succeeded + 1, phase: "result", lastResult: "success" };
    }
    case "pass": {
      if (state.phase !== "playing") return state;
      return { ...state, failed: state.failed + 1, phase: "result", lastResult: "fail" };
    }
    case "next": {
      if (state.phase !== "result") return state;
      const nextIndex = state.currentIndex + 1;
      const timeLimit = parseInt(state.settings.timeLimit, 10);
      if (nextIndex >= state.prompts.length) return { ...state, phase: "done" };
      return { ...state, currentIndex: nextIndex, timeLeft: timeLimit, phase: "playing", lastResult: null };
    }
    default:
      return state;
  }
}

export function isTerminal(state: FiveSecState): { score: number } | null {
  if (state.phase === "done") return { score: state.succeeded };
  return null;
}
