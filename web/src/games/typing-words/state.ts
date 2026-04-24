import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

const WORD_POOL = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "it",
  "for", "not", "on", "with", "he", "as", "you", "do", "at", "this",
  "but", "his", "by", "from", "they", "we", "say", "her", "she", "or",
  "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know",
  "take", "people", "into", "year", "your", "good", "some", "could",
  "them", "see", "other", "than", "then", "now", "look", "only", "come",
  "its", "over", "think", "also", "back", "after", "use", "two", "how",
  "our", "work", "first", "well", "way", "even", "new", "want", "because",
  "any", "these", "give", "day", "most", "us", "great", "between", "need",
  "large", "often", "hand", "high", "place", "hold", "turn", "such",
  "here", "why", "help", "talk", "small", "number", "off", "always",
  "move", "live", "where", "much", "through", "before", "right", "too",
  "mean", "old", "same", "tell", "boys", "following", "came", "want",
  "show", "also", "around", "form", "three", "small", "set", "put",
  "every", "both", "those", "though", "might", "own", "down", "let",
  "near", "keep", "children", "side", "feet", "car", "mile", "night",
  "walk", "white", "sea", "began", "grow", "took", "river", "four",
  "carry", "state", "once", "book", "hear", "stop", "without", "second",
  "later", "miss", "idea", "enough", "eat", "face", "watch", "far",
  "Indian", "real", "almost", "let", "above", "girl", "sometimes", "mountain",
  "cut", "young", "talk", "soon", "list", "song", "being", "leave",
];

const HARD_WORDS = [
  "acknowledge", "circumstance", "consequently", "deteriorate", "enthusiasm",
  "exaggerate", "fluctuating", "guarantee", "immediately", "indispensable",
  "maintenance", "necessary", "occasionally", "particularly", "questionnaire",
  "rehabilitation", "simultaneous", "specifically", "susceptible", "thoroughly",
  "tremendous", "unconscious", "vocabulary", "approximately", "benevolent",
  "catastrophic", "deliberately", "embarrassment", "exhilarating", "fundamental",
  "government", "helicopter", "imagination", "knowledge", "lightning",
  "mysterious", "neighborhood", "opportunity", "perseverance", "qualification",
];

function buildWordList(seed: number, difficulty: "easy" | "medium" | "hard"): string[] {
  const rng = mulberry32(seed);
  const pool = difficulty === "hard" ? [...HARD_WORDS] : [...WORD_POOL];
  const count = 120;
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    words.push(pool[Math.floor(rng() * pool.length)]!);
  }
  return words;
}

export interface TypingWordsState {
  settings: { duration: "30" | "60" | "120"; difficulty: "easy" | "medium" | "hard" };
  words: string[];
  currentIndex: number;
  input: string;
  correct: number;
  incorrect: number;
  elapsed: number;
  ended: boolean;
  rngSeed: number;
}

export type TypingWordsAction =
  | { type: "tick"; dt: number }
  | { type: "type"; text: string }
  | { type: "submit" };

export function initialState(
  seed: number,
  settings: { duration: "30" | "60" | "120"; difficulty: "easy" | "medium" | "hard" },
): TypingWordsState {
  return {
    settings,
    words: buildWordList(seed, settings.difficulty),
    currentIndex: 0,
    input: "",
    correct: 0,
    incorrect: 0,
    elapsed: 0,
    ended: false,
    rngSeed: seed,
  };
}

export function reducer(state: TypingWordsState, action: TypingWordsAction): TypingWordsState {
  if (state.ended) return state;

  switch (action.type) {
    case "tick": {
      const duration = parseInt(state.settings.duration, 10);
      const newElapsed = state.elapsed + action.dt;
      if (newElapsed >= duration) {
        return { ...state, elapsed: duration, ended: true };
      }
      return { ...state, elapsed: newElapsed };
    }
    case "type": {
      // Auto-submit on space
      if (action.text.endsWith(" ")) {
        const typed = action.text.trim();
        const target = state.words[state.currentIndex]!;
        const isCorrect = typed === target;
        return {
          ...state,
          input: "",
          currentIndex: state.currentIndex + 1,
          correct: state.correct + (isCorrect ? 1 : 0),
          incorrect: state.incorrect + (isCorrect ? 0 : 1),
        };
      }
      return { ...state, input: action.text };
    }
    case "submit": {
      const typed = state.input.trim();
      if (!typed) return state;
      const target = state.words[state.currentIndex]!;
      const isCorrect = typed === target;
      return {
        ...state,
        input: "",
        currentIndex: state.currentIndex + 1,
        correct: state.correct + (isCorrect ? 1 : 0),
        incorrect: state.incorrect + (isCorrect ? 0 : 1),
      };
    }
    default:
      return state;
  }
}

export function isTerminal(state: TypingWordsState): { score: number } | null {
  if (!state.ended) return null;
  const total = state.correct + state.incorrect;
  const acc = total === 0 ? 100 : Math.round((state.correct / total) * 100);
  return { score: Math.round(state.correct * (acc / 100)) };
}
