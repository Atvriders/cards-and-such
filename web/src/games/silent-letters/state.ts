import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SilentLettersSettings {
  questionCount: "5" | "10" | "15";
}

export interface SilentLettersEntry {
  word: string;
  silentLetter: string;
  choices: string[];
}

export interface SilentLettersState {
  settings: SilentLettersSettings;
  entries: SilentLettersEntry[];
  current: number;
  selected: number | null;
  score: number;
  done: boolean;
}

export type SilentLettersAction =
  | { type: "select"; index: number }
  | { type: "next" };

const BANK: { word: string; silentLetter: string }[] = [
  { word: "KNIGHT", silentLetter: "K" },
  { word: "GNOME", silentLetter: "G" },
  { word: "WRECK", silentLetter: "W" },
  { word: "THUMB", silentLetter: "B" },
  { word: "ISLAND", silentLetter: "S" },
  { word: "PSALM", silentLetter: "P" },
  { word: "KNIFE", silentLetter: "K" },
  { word: "HOUR", silentLetter: "H" },
  { word: "WRITE", silentLetter: "W" },
  { word: "SALMON", silentLetter: "L" },
  { word: "DOUBT", silentLetter: "B" },
  { word: "CASTLE", silentLetter: "T" },
  { word: "KNEEL", silentLetter: "K" },
  { word: "WRAP", silentLetter: "W" },
  { word: "WRONG", silentLetter: "W" },
  { word: "PNEUMONIA", silentLetter: "P" },
  { word: "SCISSORS", silentLetter: "C" },
  { word: "HONEST", silentLetter: "H" },
  { word: "CHALK", silentLetter: "L" },
  { word: "MUSCLE", silentLetter: "C" },
  { word: "CLIMB", silentLetter: "B" },
  { word: "COLONEL", silentLetter: "L" },
  { word: "DEBT", silentLetter: "B" },
  { word: "GNARL", silentLetter: "G" },
  { word: "KNOB", silentLetter: "K" },
  { word: "WRIST", silentLetter: "W" },
  { word: "SUBTLE", silentLetter: "B" },
  { word: "LISTEN", silentLetter: "T" },
  { word: "FASTEN", silentLetter: "T" },
  { word: "SOFTEN", silentLetter: "T" },
  { word: "HALF", silentLetter: "L" },
  { word: "CALM", silentLetter: "L" },
  { word: "PALM", silentLetter: "L" },
  { word: "SIGN", silentLetter: "G" },
  { word: "GNAW", silentLetter: "G" },
];

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "K", "L", "M", "N", "O", "P", "R", "S", "T", "U", "W"];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: SilentLettersSettings): SilentLettersState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const shuffledBank = shuffle(BANK, rng);
  const chosen = shuffledBank.slice(0, count);

  const entries: SilentLettersEntry[] = chosen.map((item) => {
    // Pick 3 wrong letter options from LETTERS that are not the correct silent letter
    // and ARE present in the word (to make it tricky) or just different letters
    const wordLetters = [...new Set(item.word.split(""))].filter((l) => l !== item.silentLetter);
    const wrongs: string[] = [];
    // Prefer using actual letters in the word as distractors
    for (const l of shuffle(wordLetters, rng)) {
      if (wrongs.length >= 3) break;
      if (l !== item.silentLetter) wrongs.push(l);
    }
    // Fill remaining with random letters
    for (const l of shuffle(LETTERS.filter((l) => l !== item.silentLetter && !wrongs.includes(l)), rng)) {
      if (wrongs.length >= 3) break;
      wrongs.push(l);
    }
    const choices = shuffle([item.silentLetter, ...wrongs.slice(0, 3)], rng);
    return { word: item.word, silentLetter: item.silentLetter, choices };
  });

  return {
    settings,
    entries,
    current: 0,
    selected: null,
    score: 0,
    done: false,
  };
}

export function reducer(state: SilentLettersState, action: SilentLettersAction): SilentLettersState {
  if (state.done) return state;
  switch (action.type) {
    case "select": {
      if (state.selected !== null) return state;
      const entry = state.entries[state.current]!;
      const correct = entry.choices[action.index] === entry.silentLetter;
      return {
        ...state,
        selected: action.index,
        score: correct ? state.score + 10 : state.score,
      };
    }
    case "next": {
      if (state.selected === null) return state;
      const nextIdx = state.current + 1;
      if (nextIdx >= state.entries.length) {
        return { ...state, done: true };
      }
      return { ...state, current: nextIdx, selected: null };
    }
    default:
      return state;
  }
}

export function isTerminal(state: SilentLettersState): { score: number } | null {
  if (state.done) return { score: state.score };
  return null;
}
