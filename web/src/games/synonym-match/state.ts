import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SynonymMatchSettings {
  pairCount: "4" | "6" | "8";
}

export interface SynonymPair {
  word: string;
  synonym: string;
}

export interface SynonymMatchState {
  settings: SynonymMatchSettings;
  pairs: SynonymPair[];
  leftItems: string[];    // shuffled words
  rightItems: string[];   // shuffled synonyms
  selectedLeft: number | null;
  selectedRight: number | null;
  matched: Set<number>;   // indices into pairs[] that are matched
  wrong: [number, number] | null; // [leftIdx in leftItems, rightIdx in rightItems] of wrong attempt
  score: number;
  attempts: number;
  done: boolean;
}

export type SynonymMatchAction =
  | { type: "selectLeft"; index: number }
  | { type: "selectRight"; index: number }
  | { type: "clearWrong" };

const SYNONYM_BANK: SynonymPair[] = [
  { word: "HAPPY", synonym: "JOYFUL" },
  { word: "SAD", synonym: "GLOOMY" },
  { word: "FAST", synonym: "SWIFT" },
  { word: "SLOW", synonym: "SLUGGISH" },
  { word: "BIG", synonym: "LARGE" },
  { word: "SMALL", synonym: "TINY" },
  { word: "SMART", synonym: "CLEVER" },
  { word: "ANGRY", synonym: "FURIOUS" },
  { word: "BRAVE", synonym: "COURAGEOUS" },
  { word: "COLD", synonym: "FRIGID" },
  { word: "HOT", synonym: "SCORCHING" },
  { word: "OLD", synonym: "ANCIENT" },
  { word: "NEW", synonym: "NOVEL" },
  { word: "TIRED", synonym: "WEARY" },
  { word: "SHOUT", synonym: "YELL" },
  { word: "WALK", synonym: "STROLL" },
  { word: "LOOK", synonym: "GAZE" },
  { word: "HIDE", synonym: "CONCEAL" },
  { word: "HELP", synonym: "AID" },
  { word: "BREAK", synonym: "SHATTER" },
  { word: "CLEAN", synonym: "SPOTLESS" },
  { word: "DARK", synonym: "GLOOMY" },
  { word: "RICH", synonym: "WEALTHY" },
  { word: "POOR", synonym: "NEEDY" },
  { word: "KIND", synonym: "GENTLE" },
  { word: "RUDE", synonym: "IMPOLITE" },
  { word: "SCARY", synonym: "DREADFUL" },
  { word: "FUNNY", synonym: "HUMOROUS" },
  { word: "QUIET", synonym: "SILENT" },
  { word: "LOUD", synonym: "NOISY" },
  { word: "EMPTY", synonym: "VACANT" },
  { word: "FULL", synonym: "PACKED" },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: SynonymMatchSettings): SynonymMatchState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.pairCount, 10);
  const shuffledBank = shuffle(SYNONYM_BANK, rng);
  const pairs = shuffledBank.slice(0, count);

  const leftItems = shuffle(pairs.map(p => p.word), rng);
  const rightItems = shuffle(pairs.map(p => p.synonym), rng);

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

export function reducer(state: SynonymMatchState, action: SynonymMatchAction): SynonymMatchState {
  if (state.done) return state;

  switch (action.type) {
    case "clearWrong": {
      return { ...state, wrong: null, selectedLeft: null, selectedRight: null };
    }
    case "selectLeft": {
      if (state.wrong) return state;
      // Find the pair index for this word
      const word = state.leftItems[action.index];
      const pairIdx = state.pairs.findIndex(p => p.word === word);
      if (state.matched.has(pairIdx)) return state;
      return { ...state, selectedLeft: action.index };
    }
    case "selectRight": {
      if (state.wrong) return state;
      const synonym = state.rightItems[action.index];
      const pairIdx = state.pairs.findIndex(p => p.synonym === synonym);
      if (state.matched.has(pairIdx)) return state;

      const newSelected = action.index;

      if (state.selectedLeft === null) {
        return { ...state, selectedRight: newSelected };
      }

      // We have both sides selected — try to match
      const leftWord = state.leftItems[state.selectedLeft]!;
      const leftPairIdx = state.pairs.findIndex(p => p.word === leftWord);
      const rightSynonym = state.rightItems[action.index]!;
      const rightPairIdx = state.pairs.findIndex(p => p.synonym === rightSynonym);

      const newAttempts = state.attempts + 1;

      if (leftPairIdx === rightPairIdx) {
        // Correct match
        const newMatched = new Set(state.matched);
        newMatched.add(leftPairIdx);
        const allDone = newMatched.size >= state.pairs.length;
        const scoreGain = 10;
        return {
          ...state,
          matched: newMatched,
          selectedLeft: null,
          selectedRight: null,
          wrong: null,
          score: state.score + scoreGain,
          attempts: newAttempts,
          done: allDone,
        };
      } else {
        // Wrong match — highlight briefly
        return {
          ...state,
          wrong: [state.selectedLeft, action.index],
          attempts: newAttempts,
        };
      }
    }
    default:
      return state;
  }
}

export function isTerminal(state: SynonymMatchState): { score: number } | null {
  if (state.done) return { score: state.score };
  return null;
}
