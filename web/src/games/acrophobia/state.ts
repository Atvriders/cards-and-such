import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PHRASES, getAcronym } from "./phrases.js";

export interface AcrophobiaSettings {
  difficulty: "easy" | "hard";
}

export interface AcrophobiaState {
  settings: AcrophobiaSettings;
  /** The canonical words of the phrase */
  canonicalWords: string[];
  /** The acronym (derived from canonical words) */
  acronym: string;
  /** Player's typed answers, one per slot */
  playerWords: string[];
  /** Which slot is currently focused */
  activeSlot: number;
  /** Partial text for the active slot */
  inputText: string;
  /** Whether the player has submitted */
  submitted: boolean;
  /** Number of correct slots (first-letter match) */
  correctSlots: number;
  /** Exact match (all words match) */
  exactMatch: boolean;
  won: boolean;
  score: number;
  round: number;
  maxRounds: number;
  totalScore: number;
}

export type AcrophobiaAction =
  | { type: "typeChar"; char: string }
  | { type: "backspace" }
  | { type: "nextSlot" }
  | { type: "prevSlot" }
  | { type: "selectSlot"; slot: number }
  | { type: "submit" }
  | { type: "nextRound" };

function pickPhrase(rng: () => number, excludeIdx?: number): { entry: (typeof PHRASES)[0]; idx: number } {
  let idx = Math.floor(rng() * PHRASES.length);
  if (idx === excludeIdx) idx = (idx + 1) % PHRASES.length;
  return { entry: PHRASES[idx]!, idx };
}

function scoreRound(playerWords: string[], canonicalWords: string[], exact: boolean): number {
  if (exact) return 500;
  const correct = playerWords.filter((w, i) =>
    w.length > 0 && w[0]!.toUpperCase() === canonicalWords[i]![0]!.toUpperCase()
  ).length;
  return correct * 50;
}

export function initialState(seed: number, settings: AcrophobiaSettings): AcrophobiaState {
  const rng = mulberry32(seed);
  const { entry } = pickPhrase(rng);
  const canonicalWords = entry.words;
  const acronym = getAcronym(entry);

  return {
    settings,
    canonicalWords,
    acronym,
    playerWords: new Array(acronym.length).fill("") as string[],
    activeSlot: 0,
    inputText: "",
    submitted: false,
    correctSlots: 0,
    exactMatch: false,
    won: false,
    score: 0,
    round: 1,
    maxRounds: 5,
    totalScore: 0,
  };
}

export function reducer(state: AcrophobiaState, action: AcrophobiaAction): AcrophobiaState {
  if (state.submitted && action.type !== "nextRound") return state;

  switch (action.type) {
    case "typeChar": {
      const ch = action.char.toUpperCase();
      if (!/^[A-Z\s'-]$/.test(ch)) return state;
      return { ...state, inputText: state.inputText + ch };
    }

    case "backspace": {
      if (state.inputText.length === 0) return state;
      return { ...state, inputText: state.inputText.slice(0, -1) };
    }

    case "nextSlot": {
      // Commit current text to slot and move forward
      const playerWords = [...state.playerWords];
      playerWords[state.activeSlot] = state.inputText.trim();
      const nextSlot = Math.min(state.activeSlot + 1, state.acronym.length - 1);
      return {
        ...state,
        playerWords,
        activeSlot: nextSlot,
        inputText: playerWords[nextSlot] ?? "",
      };
    }

    case "prevSlot": {
      const playerWords = [...state.playerWords];
      playerWords[state.activeSlot] = state.inputText.trim();
      const prevSlot = Math.max(state.activeSlot - 1, 0);
      return {
        ...state,
        playerWords,
        activeSlot: prevSlot,
        inputText: playerWords[prevSlot] ?? "",
      };
    }

    case "selectSlot": {
      const playerWords = [...state.playerWords];
      playerWords[state.activeSlot] = state.inputText.trim();
      const slot = Math.max(0, Math.min(action.slot, state.acronym.length - 1));
      return {
        ...state,
        playerWords,
        activeSlot: slot,
        inputText: playerWords[slot] ?? "",
      };
    }

    case "submit": {
      // Commit current slot
      const playerWords = [...state.playerWords];
      playerWords[state.activeSlot] = state.inputText.trim();

      const correctSlots = playerWords.filter((w, i) =>
        w.length > 0 && w[0]!.toUpperCase() === state.canonicalWords[i]![0]!.toUpperCase()
      ).length;

      const exactMatch = playerWords.every((w, i) =>
        w.toUpperCase() === state.canonicalWords[i]!.toUpperCase()
      );

      const won = correctSlots === state.acronym.length;
      const roundScore = scoreRound(playerWords, state.canonicalWords, exactMatch);

      return {
        ...state,
        playerWords,
        submitted: true,
        correctSlots,
        exactMatch,
        won,
        score: roundScore,
        totalScore: state.totalScore + roundScore,
      };
    }

    case "nextRound": {
      if (state.round >= state.maxRounds) return state;
      // Pick a new phrase deterministically based on round
      const rng = mulberry32(state.round * 31337);
      const { entry } = pickPhrase(rng);
      const canonicalWords = entry.words;
      const acronym = getAcronym(entry);

      return {
        ...state,
        canonicalWords,
        acronym,
        playerWords: new Array(acronym.length).fill("") as string[],
        activeSlot: 0,
        inputText: "",
        submitted: false,
        correctSlots: 0,
        exactMatch: false,
        won: false,
        score: 0,
        round: state.round + 1,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: AcrophobiaState): { score: number } | null {
  if (state.submitted && state.round >= state.maxRounds) {
    return { score: state.totalScore };
  }
  return null;
}
