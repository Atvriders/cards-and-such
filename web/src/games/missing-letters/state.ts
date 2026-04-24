import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface MissingLettersSettings {
  blanks: "1" | "2" | "3";
}

export interface MissingLettersState {
  settings: MissingLettersSettings;
  word: string;
  hiddenIndices: number[];
  input: string[]; // one char per hidden slot
  focusedSlot: number;
  submitted: boolean;
  correct: boolean;
  score: number;
  questionIndex: number;
  totalQuestions: number;
}

export type MissingLettersAction =
  | { type: "type"; char: string }
  | { type: "backspace" }
  | { type: "focusSlot"; slotIndex: number }
  | { type: "submit" }
  | { type: "next"; seed: number };

const WORD_BANK: string[] = [
  "APPLE", "BEACH", "CHAIR", "DANCE", "EARTH", "FLAME", "GRAPE", "HOUSE",
  "IMAGE", "JOKER", "KNIFE", "LEMON", "MANGO", "NIGHT", "OCEAN", "PIANO",
  "QUEEN", "RIVER", "STONE", "TRAIN", "UNDER", "VOICE", "WALTZ", "XENON",
  "YACHT", "ZEBRA", "BREAD", "CLOCK", "DREAM", "EAGLE", "FROST", "GIANT",
  "HONEY", "IVORY", "JEWEL", "KIOSK", "LUNAR", "MAPLE", "NURSE", "ORBIT",
  "PAPER", "QUOTA", "RIDGE", "SPINE", "TOWER", "ULTRA", "VAPOR", "WATER",
];

function pickHiddenIndices(word: string, count: number, rng: () => number): number[] {
  const indices = Array.from({ length: word.length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j]!, indices[i]!];
  }
  return indices.slice(0, Math.min(count, word.length - 1)).sort((a, b) => a - b);
}

function makeQuestionState(
  base: Partial<MissingLettersState>,
  seed: number,
  questionIndex: number,
  settings: MissingLettersSettings,
): MissingLettersState {
  const rng = mulberry32(seed + questionIndex * 1000);
  const wordIdx = Math.floor(rng() * WORD_BANK.length);
  const word = WORD_BANK[wordIdx]!;
  const blanks = parseInt(settings.blanks, 10);
  const hiddenIndices = pickHiddenIndices(word, blanks, rng);

  return {
    settings,
    word,
    hiddenIndices,
    input: hiddenIndices.map(() => ""),
    focusedSlot: 0,
    submitted: false,
    correct: false,
    score: (base as MissingLettersState).score ?? 0,
    questionIndex,
    totalQuestions: 10,
  };
}

export function initialState(seed: number, settings: MissingLettersSettings): MissingLettersState {
  return makeQuestionState({}, seed, 0, settings);
}

export function reducer(state: MissingLettersState, action: MissingLettersAction): MissingLettersState {
  switch (action.type) {
    case "type": {
      if (state.submitted) return state;
      const ch = action.char.toUpperCase();
      if (!/^[A-Z]$/.test(ch)) return state;
      const newInput = [...state.input];
      newInput[state.focusedSlot] = ch;
      const nextSlot = Math.min(state.focusedSlot + 1, state.input.length - 1);
      return { ...state, input: newInput, focusedSlot: nextSlot };
    }
    case "backspace": {
      if (state.submitted) return state;
      const newInput = [...state.input];
      if (newInput[state.focusedSlot] !== "") {
        newInput[state.focusedSlot] = "";
      } else if (state.focusedSlot > 0) {
        const prevSlot = state.focusedSlot - 1;
        newInput[prevSlot] = "";
        return { ...state, input: newInput, focusedSlot: prevSlot };
      }
      return { ...state, input: newInput };
    }
    case "focusSlot": {
      return { ...state, focusedSlot: action.slotIndex };
    }
    case "submit": {
      if (state.submitted) return state;
      if (state.input.some(ch => ch === "")) return state;
      const correct = state.hiddenIndices.every(
        (idx, i) => state.input[i] === state.word[idx],
      );
      const scoreGain = correct ? 10 : 0;
      return { ...state, submitted: true, correct, score: state.score + scoreGain };
    }
    case "next": {
      if (!state.submitted) return state;
      const nextIndex = state.questionIndex + 1;
      return makeQuestionState(state, action.seed, nextIndex, state.settings);
    }
    default:
      return state;
  }
}

export function isTerminal(state: MissingLettersState): { score: number } | null {
  if (state.submitted && state.questionIndex + 1 >= state.totalQuestions) {
    return { score: state.score };
  }
  return null;
}
