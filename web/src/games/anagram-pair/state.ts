import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface AnagramPairSettings {
  pairCount: "4" | "6" | "8";
}

export interface AnagramEntry {
  word: string;
  anagram: string;
}

export interface AnagramPairState {
  settings: AnagramPairSettings;
  pairs: AnagramEntry[];
  leftItems: string[];   // scrambled words
  rightItems: string[];  // definitions / original words
  selectedLeft: number | null;
  selectedRight: number | null;
  matched: Set<number>;
  wrong: [number, number] | null;
  score: number;
  attempts: number;
  done: boolean;
}

export type AnagramPairAction =
  | { type: "selectLeft"; index: number }
  | { type: "selectRight"; index: number }
  | { type: "clearWrong" };

// Each pair: word → anagram (both are real words that are anagrams of each other)
const BANK: AnagramEntry[] = [
  { word: "LISTEN", anagram: "SILENT" },
  { word: "EARTH", anagram: "HEART" },
  { word: "ANGEL", anagram: "GLEAN" },
  { word: "DUSTY", anagram: "STUDY" },
  { word: "NIGHT", anagram: "THING" },
  { word: "STALE", anagram: "TALES" },
  { word: "LEAST", anagram: "SLATE" },
  { word: "RACE", anagram: "CARE" },
  { word: "TEAM", anagram: "MATE" },
  { word: "VILE", anagram: "EVIL" },
  { word: "LIME", anagram: "MILE" },
  { word: "POTS", anagram: "STOP" },
  { word: "LEMON", anagram: "MELON" },
  { word: "ENLIST", anagram: "TINSEL" },
  { word: "RESCUES", anagram: "SECURES" },
  { word: "BELOW", anagram: "ELBOW" },
  { word: "SHORE", anagram: "HORSE" },
  { word: "STINK", anagram: "KNITS" },
  { word: "REACT", anagram: "CRATE" },
  { word: "SNARE", anagram: "EARNS" },
  { word: "SKATE", anagram: "STEAK" },
  { word: "ACRES", anagram: "CARES" },
  { word: "SWORD", anagram: "WORDS" },
  { word: "THORN", anagram: "NORTH" },
  { word: "ALTER", anagram: "ALERT" },
  { word: "PEARS", anagram: "SPARE" },
  { word: "NOTES", anagram: "STONE" },
  { word: "VOTES", anagram: "STOVE" },
  { word: "BLEAT", anagram: "TABLE" },
  { word: "CANOE", anagram: "OCEAN" },
  { word: "GROAN", anagram: "ORGAN" },
  { word: "TIMES", anagram: "MITES" },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: AnagramPairSettings): AnagramPairState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.pairCount, 10);
  const shuffledBank = shuffle(BANK, rng);
  const pairs = shuffledBank.slice(0, count);

  const leftItems = shuffle(pairs.map((p) => p.word), rng);
  const rightItems = shuffle(pairs.map((p) => p.anagram), rng);

  return {
    settings,
    pairs,
    leftItems,
    rightItems,
    selectedLeft: null,
    selectedRight: null,
    matched: new Set(),
    wrong: null,
    score: 0,
    attempts: 0,
    done: false,
  };
}

export function reducer(state: AnagramPairState, action: AnagramPairAction): AnagramPairState {
  if (state.done) return state;

  switch (action.type) {
    case "clearWrong":
      return { ...state, wrong: null, selectedLeft: null, selectedRight: null };

    case "selectLeft": {
      if (state.wrong) return state;
      const word = state.leftItems[action.index];
      const pairIdx = state.pairs.findIndex((p) => p.word === word);
      if (state.matched.has(pairIdx)) return state;
      return { ...state, selectedLeft: action.index };
    }

    case "selectRight": {
      if (state.wrong) return state;
      const anagram = state.rightItems[action.index];
      const pairIdx = state.pairs.findIndex((p) => p.anagram === anagram);
      if (state.matched.has(pairIdx)) return state;

      if (state.selectedLeft === null) {
        return { ...state, selectedRight: action.index };
      }

      const leftWord = state.leftItems[state.selectedLeft]!;
      const leftPairIdx = state.pairs.findIndex((p) => p.word === leftWord);
      const rightPairIdx = state.pairs.findIndex((p) => p.anagram === anagram);
      const newAttempts = state.attempts + 1;

      if (leftPairIdx === rightPairIdx) {
        const newMatched = new Set(state.matched);
        newMatched.add(leftPairIdx);
        const allDone = newMatched.size >= state.pairs.length;
        return {
          ...state,
          matched: newMatched,
          selectedLeft: null,
          selectedRight: null,
          wrong: null,
          score: state.score + 10,
          attempts: newAttempts,
          done: allDone,
        };
      } else {
        return { ...state, wrong: [state.selectedLeft, action.index], attempts: newAttempts };
      }
    }

    default:
      return state;
  }
}

export function isTerminal(state: AnagramPairState): { score: number } | null {
  if (state.done) return { score: state.score };
  return null;
}
