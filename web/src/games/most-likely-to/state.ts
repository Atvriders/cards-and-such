import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface MLTSettings {
  rounds: "10" | "20" | "30";
}

const PROMPTS: string[] = [
  "Most likely to become famous",
  "Most likely to survive a zombie apocalypse",
  "Most likely to become a millionaire",
  "Most likely to be late to their own wedding",
  "Most likely to eat the last slice of pizza without asking",
  "Most likely to go viral on social media",
  "Most likely to forget where they parked",
  "Most likely to talk to a stranger at a party",
  "Most likely to binge-watch a whole series in one day",
  "Most likely to cry at a movie",
  "Most likely to start their own business",
  "Most likely to move to another country",
  "Most likely to get a tattoo on impulse",
  "Most likely to become a teacher",
  "Most likely to get lost without GPS",
  "Most likely to win a eating contest",
  "Most likely to become a social media influencer",
  "Most likely to still be awake at 3 a.m.",
  "Most likely to adopt 10 cats",
  "Most likely to write a book",
  "Most likely to forget a birthday",
  "Most likely to start a food fight",
  "Most likely to be a secret genius",
  "Most likely to be caught singing in the car",
  "Most likely to try every item on a restaurant menu",
  "Most likely to be the life of the party",
  "Most likely to trip over nothing",
  "Most likely to become a doctor",
  "Most likely to say something they immediately regret",
  "Most likely to be caught taking selfies",
  "Most likely to fall asleep in a meeting",
  "Most likely to send a meme instead of a response",
  "Most likely to start a new hobby and abandon it in a week",
  "Most likely to give excellent life advice they don't follow themselves",
  "Most likely to win a trivia night",
];

export interface MLTState {
  settings: MLTSettings;
  prompts: string[];
  currentIndex: number;
  votes: number;
  phase: "playing" | "done";
}

export type MLTAction =
  | { type: "vote"; count: number }
  | { type: "next" };

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: MLTSettings): MLTState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.rounds, 10);
  const prompts = shuffle(PROMPTS, rng).slice(0, Math.min(count, PROMPTS.length));
  return { settings, prompts, currentIndex: 0, votes: 0, phase: "playing" };
}

export function reducer(state: MLTState, action: MLTAction): MLTState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "vote":
      return { ...state, votes: state.votes + action.count };
    case "next": {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.prompts.length) return { ...state, phase: "done" };
      return { ...state, currentIndex: nextIndex };
    }
    default:
      return state;
  }
}

export function isTerminal(state: MLTState): { score: number } | null {
  if (state.phase === "done") return { score: state.votes };
  return null;
}
