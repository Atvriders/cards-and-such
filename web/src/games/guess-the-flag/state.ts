import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Guess the Flag — multiple choice flag quiz.
// 40 countries with emoji flags. Pick the correct country from 4 choices.

export interface GuessFlagSettings {
  rounds: "10" | "25" | "50";
  difficulty: "easy" | "medium" | "hard";
}

export interface Country {
  name: string;
  flag: string; // emoji
  tier: "easy" | "medium" | "hard";
}

export const COUNTRIES: Country[] = [
  // Easy — very well known
  { name: "United States", flag: "🇺🇸", tier: "easy" },
  { name: "United Kingdom", flag: "🇬🇧", tier: "easy" },
  { name: "Canada", flag: "🇨🇦", tier: "easy" },
  { name: "France", flag: "🇫🇷", tier: "easy" },
  { name: "Germany", flag: "🇩🇪", tier: "easy" },
  { name: "Japan", flag: "🇯🇵", tier: "easy" },
  { name: "Australia", flag: "🇦🇺", tier: "easy" },
  { name: "Brazil", flag: "🇧🇷", tier: "easy" },
  { name: "China", flag: "🇨🇳", tier: "easy" },
  { name: "India", flag: "🇮🇳", tier: "easy" },
  { name: "Italy", flag: "🇮🇹", tier: "easy" },
  { name: "Spain", flag: "🇪🇸", tier: "easy" },
  { name: "Mexico", flag: "🇲🇽", tier: "easy" },
  { name: "Russia", flag: "🇷🇺", tier: "easy" },
  { name: "South Korea", flag: "🇰🇷", tier: "easy" },
  // Medium
  { name: "Argentina", flag: "🇦🇷", tier: "medium" },
  { name: "Sweden", flag: "🇸🇪", tier: "medium" },
  { name: "Norway", flag: "🇳🇴", tier: "medium" },
  { name: "Turkey", flag: "🇹🇷", tier: "medium" },
  { name: "South Africa", flag: "🇿🇦", tier: "medium" },
  { name: "Nigeria", flag: "🇳🇬", tier: "medium" },
  { name: "Egypt", flag: "🇪🇬", tier: "medium" },
  { name: "Netherlands", flag: "🇳🇱", tier: "medium" },
  { name: "Poland", flag: "🇵🇱", tier: "medium" },
  { name: "Portugal", flag: "🇵🇹", tier: "medium" },
  { name: "Greece", flag: "🇬🇷", tier: "medium" },
  { name: "Thailand", flag: "🇹🇭", tier: "medium" },
  { name: "Indonesia", flag: "🇮🇩", tier: "medium" },
  { name: "Saudi Arabia", flag: "🇸🇦", tier: "medium" },
  { name: "Pakistan", flag: "🇵🇰", tier: "medium" },
  // Hard
  { name: "Slovenia", flag: "🇸🇮", tier: "hard" },
  { name: "Slovakia", flag: "🇸🇰", tier: "hard" },
  { name: "Ecuador", flag: "🇪🇨", tier: "hard" },
  { name: "Cameroon", flag: "🇨🇲", tier: "hard" },
  { name: "Kazakhstan", flag: "🇰🇿", tier: "hard" },
  { name: "Uzbekistan", flag: "🇺🇿", tier: "hard" },
  { name: "Madagascar", flag: "🇲🇬", tier: "hard" },
  { name: "Kyrgyzstan", flag: "🇰🇬", tier: "hard" },
  { name: "Chad", flag: "🇹🇩", tier: "hard" },
  { name: "Andorra", flag: "🇦🇩", tier: "hard" },
];

function getPool(difficulty: GuessFlagSettings["difficulty"]): Country[] {
  if (difficulty === "easy") return COUNTRIES.filter((c) => c.tier === "easy");
  if (difficulty === "medium") return COUNTRIES.filter((c) => c.tier !== "hard");
  return COUNTRIES;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export interface FlagQuestion {
  correct: Country;
  choices: readonly Country[];  // 4 choices including correct
}

function makeQuestion(pool: Country[], rng: () => number): FlagQuestion {
  const shuffled = shuffle(pool, rng);
  const correct = shuffled[0]!;
  const distractors = shuffled.slice(1, 4);
  const choices = shuffle([correct, ...distractors], rng);
  return { correct, choices };
}

export interface GuessFlagState {
  settings: GuessFlagSettings;
  rngSeed: number;
  question: FlagQuestion;
  roundNumber: number;
  totalRounds: number;
  selected: Country | null;
  isRevealed: boolean;
  correct: number;
  wrong: number;
  streak: number;
  phase: "playing" | "done";
}

export type GuessFlagAction =
  | { type: "select"; country: Country }
  | { type: "next" };

export function initialState(seed: number, settings: GuessFlagSettings): GuessFlagState {
  const rng = mulberry32(seed);
  const pool = getPool(settings.difficulty);
  const question = makeQuestion(pool, rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    settings,
    rngSeed: nextSeed,
    question,
    roundNumber: 1,
    totalRounds: parseInt(settings.rounds),
    selected: null,
    isRevealed: false,
    correct: 0,
    wrong: 0,
    streak: 0,
    phase: "playing",
  };
}

export function reducer(state: GuessFlagState, action: GuessFlagAction): GuessFlagState {
  if (state.phase === "done") return state;

  if (action.type === "select") {
    if (state.isRevealed) return state;
    const isCorrect = action.country.name === state.question.correct.name;
    return {
      ...state,
      selected: action.country,
      isRevealed: true,
      correct: state.correct + (isCorrect ? 1 : 0),
      wrong: state.wrong + (isCorrect ? 0 : 1),
      streak: isCorrect ? state.streak + 1 : 0,
    };
  }

  if (action.type === "next") {
    if (!state.isRevealed) return state;
    if (state.roundNumber >= state.totalRounds) {
      return { ...state, phase: "done" };
    }
    const rng = mulberry32(state.rngSeed);
    const pool = getPool(state.settings.difficulty);
    const question = makeQuestion(pool, rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return {
      ...state,
      rngSeed: nextSeed,
      question,
      roundNumber: state.roundNumber + 1,
      selected: null,
      isRevealed: false,
    };
  }

  return state;
}

export function isTerminal(state: GuessFlagState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.correct * 4 };
}
