import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface WordScrambleSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface WordScrambleState {
  settings: WordScrambleSettings;
  targetWord: string;
  scrambled: string;
  input: string;
  solved: boolean;
  skipped: boolean;
  score: number;
  questionIndex: number;
  totalQuestions: number;
  hintsUsed: number;
  hintsRevealed: number; // how many letters hinted
}

export type WordScrambleAction =
  | { type: "type"; char: string }
  | { type: "backspace" }
  | { type: "submit" }
  | { type: "hint" }
  | { type: "skip" };

const EASY_WORDS = [
  "CAT", "DOG", "SUN", "MAP", "CUP", "JAR", "FAN", "LOG", "PAN", "BED",
  "HAT", "NET", "MOP", "POT", "GUM", "BAT", "RUN", "HOP", "FLY", "DIG",
  "LIT", "PIG", "ANT", "FOX", "OWL", "EGG", "ICE", "OAK", "ARM", "AXE",
];

const MEDIUM_WORDS = [
  "PLANE", "TIGER", "STONE", "WATER", "FLAME", "GLOBE", "MUSIC", "SPORT",
  "BEACH", "CLOUD", "BRUSH", "DANCE", "FENCE", "GRACE", "HEART", "JOKER",
  "KNAVE", "LANCE", "MERIT", "NIGHT", "OCEAN", "PLUMB", "QUEEN", "ROBIN",
  "SHARK", "TRAIL", "UMBRA", "VALVE", "WHEAT", "YACHT", "ZEBRA", "BLAZE",
];

const HARD_WORDS = [
  "PLANET", "BRIDGE", "CASTLE", "DRAGON", "EMPIRE", "FROZEN", "GOBLIN",
  "HUNTER", "INSECT", "JUNGLE", "KNIGHT", "LOCKET", "MARKET", "NARWHAL",
  "OSPREY", "PURPLE", "QUARTZ", "ROCKET", "SALMON", "THATCH", "UNIQUE",
  "VIOLET", "WALRUS", "XYSTER", "YELLOW", "ZIPPER", "ABRUPT", "CLEVER",
  "DEVOUT", "FROSTY",
];

function getPool(difficulty: WordScrambleSettings["difficulty"]): string[] {
  switch (difficulty) {
    case "easy": return EASY_WORDS;
    case "hard": return HARD_WORDS;
    default: return MEDIUM_WORDS;
  }
}

function scramble(word: string, rng: () => number): string {
  const arr = word.split("");
  // Fisher-Yates shuffle — retry if result matches original
  for (let attempt = 0; attempt < 10; attempt++) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
    }
    const result = shuffled.join("");
    if (result !== word) return result;
  }
  // fallback: reverse
  return arr.reverse().join("");
}

export function initialState(seed: number, settings: WordScrambleSettings): WordScrambleState {
  const pool = getPool(settings.difficulty);
  const rng = mulberry32(seed);
  const idx = Math.floor(rng() * pool.length);
  const target = pool[idx]!;
  return {
    settings,
    targetWord: target,
    scrambled: scramble(target, rng),
    input: "",
    solved: false,
    skipped: false,
    score: 0,
    questionIndex: 0,
    totalQuestions: 10,
    hintsUsed: 0,
    hintsRevealed: 0,
  };
}

function nextQuestion(state: WordScrambleState, bonusScore: number, seed: number): WordScrambleState {
  const pool = getPool(state.settings.difficulty);
  // Use a derived seed per question index
  const rng = mulberry32(seed + (state.questionIndex + 1) * 1000);
  const idx = Math.floor(rng() * pool.length);
  const target = pool[idx]!;
  return {
    ...state,
    targetWord: target,
    scrambled: scramble(target, rng),
    input: "",
    solved: false,
    skipped: false,
    score: state.score + bonusScore,
    questionIndex: state.questionIndex + 1,
    hintsUsed: 0,
    hintsRevealed: 0,
  };
}

export function reducer(state: WordScrambleState, action: WordScrambleAction, seed: number = 0): WordScrambleState {
  if (state.solved || state.skipped) return state;

  switch (action.type) {
    case "type": {
      if (state.input.length >= state.targetWord.length) return state;
      return { ...state, input: state.input + action.char.toUpperCase() };
    }
    case "backspace": {
      return { ...state, input: state.input.slice(0, -1) };
    }
    case "submit": {
      if (state.input.toUpperCase() !== state.targetWord) return state;
      const bonus = Math.max(10, 50 - state.hintsUsed * 10);
      if (state.questionIndex + 1 >= state.totalQuestions) {
        return { ...state, solved: true, score: state.score + bonus };
      }
      return nextQuestion(state, bonus, seed);
    }
    case "hint": {
      if (state.hintsRevealed >= state.targetWord.length - 1) return state;
      const newRevealed = state.hintsRevealed + 1;
      const hintPart = state.targetWord.slice(0, newRevealed);
      return {
        ...state,
        hintsUsed: state.hintsUsed + 1,
        hintsRevealed: newRevealed,
        input: hintPart,
      };
    }
    case "skip": {
      if (state.questionIndex + 1 >= state.totalQuestions) {
        return { ...state, skipped: true };
      }
      return nextQuestion({ ...state, skipped: false }, 0, seed);
    }
    default:
      return state;
  }
}

export function isTerminal(state: WordScrambleState): { score: number } | null {
  if (state.solved || state.skipped) {
    return { score: state.score };
  }
  return null;
}
