import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface WheelSpinSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface WheelSpinPuzzle {
  word: string;
  category: string;
}

export type WheelSpinPhase = "spinning" | "guessing" | "buy_vowel" | "reveal" | "won" | "lost";

export interface WheelSpinState {
  settings: WheelSpinSettings;
  puzzle: WheelSpinPuzzle;
  revealed: boolean[]; // which letters are revealed
  score: number;
  spinValue: number | null; // current spin result
  phase: WheelSpinPhase;
  guessedLetters: string[]; // all letters tried
  wrongGuesses: number;
  maxWrong: number;
  round: number;
  totalRounds: number;
  lastGuessCorrect: boolean | null;
  seed: number;
}

export type WheelSpinAction =
  | { type: "spin" }
  | { type: "guess_consonant"; letter: string }
  | { type: "buy_vowel"; letter: string }
  | { type: "solve"; word: string }
  | { type: "next_round" };

const WHEEL_VALUES = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 300, 500, 700, 200, 400, 600];

const PUZZLES: WheelSpinPuzzle[] = [
  { word: "ELEPHANT", category: "Animals" },
  { word: "VOLCANO", category: "Nature" },
  { word: "LIBRARY", category: "Places" },
  { word: "CHOCOLATE", category: "Food" },
  { word: "TELESCOPE", category: "Science" },
  { word: "BUTTERFLY", category: "Animals" },
  { word: "MOUNTAIN", category: "Nature" },
  { word: "HOSPITAL", category: "Places" },
  { word: "SANDWICH", category: "Food" },
  { word: "MICROSCOPE", category: "Science" },
  { word: "PENGUIN", category: "Animals" },
  { word: "WATERFALL", category: "Nature" },
  { word: "BAKERY", category: "Places" },
  { word: "PANCAKE", category: "Food" },
  { word: "COMPASS", category: "Science" },
  { word: "DOLPHIN", category: "Animals" },
  { word: "RAINBOW", category: "Nature" },
  { word: "MUSEUM", category: "Places" },
  { word: "BROCCOLI", category: "Food" },
  { word: "ASTEROID", category: "Science" },
  { word: "GIRAFFE", category: "Animals" },
  { word: "GLACIER", category: "Nature" },
  { word: "THEATER", category: "Places" },
  { word: "MUFFIN", category: "Food" },
  { word: "GRAVITY", category: "Science" },
  { word: "CROCODILE", category: "Animals" },
  { word: "TORNADO", category: "Nature" },
  { word: "CEMETERY", category: "Places" },
  { word: "NOODLES", category: "Food" },
  { word: "MOLECULE", category: "Science" },
];

const VOWELS = new Set(["A", "E", "I", "O", "U"]);

export function isVowel(ch: string): boolean {
  return VOWELS.has(ch.toUpperCase());
}

export function initialState(seed: number, settings: WheelSpinSettings): WheelSpinState {
  const rng = mulberry32(seed);
  const totalRounds = settings.difficulty === "easy" ? 3 : settings.difficulty === "medium" ? 5 : 7;
  const maxWrong = settings.difficulty === "easy" ? 8 : settings.difficulty === "medium" ? 6 : 5;

  const idx = Math.floor(rng() * PUZZLES.length);
  const puzzle = PUZZLES[idx]!;

  return {
    settings,
    puzzle,
    revealed: puzzle.word.split("").map(() => false),
    score: 0,
    spinValue: null,
    phase: "spinning",
    guessedLetters: [],
    wrongGuesses: 0,
    maxWrong,
    round: 1,
    totalRounds,
    lastGuessCorrect: null,
    seed,
  };
}

function nextPuzzle(state: WheelSpinState): WheelSpinState {
  const rng = mulberry32(state.seed + state.round * 1000);
  const used = new Set<number>();
  // pick a different puzzle
  let idx = Math.floor(rng() * PUZZLES.length);
  used.add(idx);
  // ensure we don't repeat the same puzzle if possible
  for (let i = 0; i < 10; i++) {
    const candidate = Math.floor(rng() * PUZZLES.length);
    if (!used.has(candidate)) { idx = candidate; break; }
  }
  const puzzle = PUZZLES[idx]!;
  return {
    ...state,
    puzzle,
    revealed: puzzle.word.split("").map(() => false),
    spinValue: null,
    phase: "spinning",
    guessedLetters: [],
    wrongGuesses: 0,
    lastGuessCorrect: null,
    round: state.round + 1,
  };
}

export function reducer(state: WheelSpinState, action: WheelSpinAction): WheelSpinState {
  switch (action.type) {
    case "spin": {
      if (state.phase !== "spinning") return state;
      const rng = mulberry32(state.seed ^ (Date.now() & 0xffff));
      const val = WHEEL_VALUES[Math.floor(rng() * WHEEL_VALUES.length)]!;
      return { ...state, spinValue: val, phase: "guessing" };
    }

    case "guess_consonant": {
      if (state.phase !== "guessing" || !state.spinValue) return state;
      const letter = action.letter.toUpperCase();
      if (isVowel(letter)) return state;
      if (state.guessedLetters.includes(letter)) return state;

      const newGuessed = [...state.guessedLetters, letter];
      const positions = state.puzzle.word.split("").map((ch, i) => ({ ch, i })).filter(x => x.ch === letter);
      const newRevealed = [...state.revealed];
      positions.forEach(({ i }) => { newRevealed[i] = true; });

      const correct = positions.length > 0;
      const gained = correct ? positions.length * state.spinValue : 0;
      const wrongGuesses = correct ? state.wrongGuesses : state.wrongGuesses + 1;
      const newScore = state.score + gained;

      const allRevealed = state.puzzle.word.split("").every((ch, i) => newRevealed[i] || ch === " ");
      if (allRevealed) {
        return { ...state, guessedLetters: newGuessed, revealed: newRevealed, score: newScore, phase: "won", wrongGuesses, lastGuessCorrect: correct, spinValue: null };
      }
      if (wrongGuesses >= state.maxWrong) {
        return { ...state, guessedLetters: newGuessed, revealed: newRevealed, score: newScore, phase: "lost", wrongGuesses, lastGuessCorrect: false, spinValue: null };
      }
      const newPhase = correct ? "spinning" : "spinning";
      return { ...state, guessedLetters: newGuessed, revealed: newRevealed, score: newScore, phase: newPhase, wrongGuesses, lastGuessCorrect: correct, spinValue: null };
    }

    case "buy_vowel": {
      if (state.score < 250) return state;
      const letter = action.letter.toUpperCase();
      if (!isVowel(letter)) return state;
      if (state.guessedLetters.includes(letter)) return state;

      const newGuessed = [...state.guessedLetters, letter];
      const newRevealed = [...state.revealed];
      state.puzzle.word.split("").forEach((ch, i) => {
        if (ch === letter) newRevealed[i] = true;
      });
      const newScore = Math.max(0, state.score - 250);
      const allRevealed = state.puzzle.word.split("").every((ch, i) => newRevealed[i] || ch === " ");

      if (allRevealed) {
        return { ...state, guessedLetters: newGuessed, revealed: newRevealed, score: newScore, phase: "won", lastGuessCorrect: null };
      }
      return { ...state, guessedLetters: newGuessed, revealed: newRevealed, score: newScore, phase: "spinning", lastGuessCorrect: null };
    }

    case "solve": {
      const guess = action.word.toUpperCase().trim();
      if (guess === state.puzzle.word) {
        const newRevealed = state.puzzle.word.split("").map(() => true);
        return { ...state, revealed: newRevealed, phase: "won", score: state.score + 500 };
      }
      const wrongGuesses = state.wrongGuesses + 1;
      if (wrongGuesses >= state.maxWrong) {
        return { ...state, wrongGuesses, phase: "lost" };
      }
      return { ...state, wrongGuesses, phase: "spinning", lastGuessCorrect: false };
    }

    case "next_round": {
      if (state.round >= state.totalRounds) {
        return { ...state, phase: "won" }; // game done
      }
      return nextPuzzle(state);
    }

    default:
      return state;
  }
}

export function isTerminal(state: WheelSpinState): { score: number } | null {
  if ((state.phase === "won" || state.phase === "lost") && state.round >= state.totalRounds) {
    return { score: state.score };
  }
  return null;
}
