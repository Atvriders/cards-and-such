import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface HomophoneMatchSettings {
  pairCount: "4" | "6" | "8";
}

export interface HomophonePair {
  word: string;
  homophone: string;
  hint: string; // short meaning for the word card
}

export interface HomophoneMatchState {
  settings: HomophoneMatchSettings;
  pairs: HomophonePair[];
  leftItems: string[];
  rightItems: string[];
  selectedLeft: number | null;
  selectedRight: number | null;
  matched: Set<number>;
  wrong: [number, number] | null;
  score: number;
  attempts: number;
  done: boolean;
}

export type HomophoneMatchAction =
  | { type: "selectLeft"; index: number }
  | { type: "selectRight"; index: number }
  | { type: "clearWrong" };

const BANK: HomophonePair[] = [
  { word: "THEIR", homophone: "THERE", hint: "belonging to them" },
  { word: "TO", homophone: "TWO", hint: "toward" },
  { word: "WRITE", homophone: "RIGHT", hint: "put words on paper" },
  { word: "KNIGHT", homophone: "NIGHT", hint: "armored warrior" },
  { word: "FLOUR", homophone: "FLOWER", hint: "baking powder" },
  { word: "SEA", homophone: "SEE", hint: "ocean" },
  { word: "BARE", homophone: "BEAR", hint: "naked / uncovered" },
  { word: "PEACE", homophone: "PIECE", hint: "calm / no war" },
  { word: "WEEK", homophone: "WEAK", hint: "seven days" },
  { word: "KNEW", homophone: "NEW", hint: "past tense of know" },
  { word: "PAIR", homophone: "PEAR", hint: "two of a kind" },
  { word: "SAIL", homophone: "SALE", hint: "travel by wind" },
  { word: "TALE", homophone: "TAIL", hint: "a story" },
  { word: "MALE", homophone: "MAIL", hint: "masculine" },
  { word: "PLANE", homophone: "PLAIN", hint: "aircraft" },
  { word: "MEET", homophone: "MEAT", hint: "to encounter" },
  { word: "STEAL", homophone: "STEEL", hint: "to take unlawfully" },
  { word: "SIGHT", homophone: "SITE", hint: "sense of vision" },
  { word: "THRONE", homophone: "THROWN", hint: "royal seat" },
  { word: "WAIST", homophone: "WASTE", hint: "middle of the body" },
  { word: "KNOT", homophone: "NOT", hint: "tied loop" },
  { word: "ALOUD", homophone: "ALLOWED", hint: "out loud" },
  { word: "BLEW", homophone: "BLUE", hint: "past tense of blow" },
  { word: "BRAKE", homophone: "BREAK", hint: "stop a vehicle" },
  { word: "COARSE", homophone: "COURSE", hint: "rough texture" },
  { word: "DESERT", homophone: "DESSERT", hint: "dry sandy land" },
  { word: "FOUL", homophone: "FOWL", hint: "unfair / bad smell" },
  { word: "HARE", homophone: "HAIR", hint: "wild rabbit" },
  { word: "HOLE", homophone: "WHOLE", hint: "an opening" },
  { word: "MANOR", homophone: "MANNER", hint: "large country house" },
  { word: "MOOSE", homophone: "MOUSSE", hint: "large deer" },
  { word: "PORE", homophone: "POUR", hint: "skin opening" },
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: HomophoneMatchSettings): HomophoneMatchState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.pairCount, 10);
  const shuffledBank = shuffle(BANK, rng);
  const pairs = shuffledBank.slice(0, count);

  const leftItems = shuffle(pairs.map((p) => p.word), rng);
  const rightItems = shuffle(pairs.map((p) => p.homophone), rng);

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

export function reducer(state: HomophoneMatchState, action: HomophoneMatchAction): HomophoneMatchState {
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
      const homophone = state.rightItems[action.index];
      const pairIdx = state.pairs.findIndex((p) => p.homophone === homophone);
      if (state.matched.has(pairIdx)) return state;

      if (state.selectedLeft === null) {
        return { ...state, selectedRight: action.index };
      }

      const leftWord = state.leftItems[state.selectedLeft]!;
      const leftPairIdx = state.pairs.findIndex((p) => p.word === leftWord);
      const rightPairIdx = state.pairs.findIndex((p) => p.homophone === homophone);
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

export function isTerminal(state: HomophoneMatchState): { score: number } | null {
  if (state.done) return { score: state.score };
  return null;
}
