import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface ChristmasCookieSettings {
  pairs: "6" | "8" | "10";
}

export interface ChristmasCookieState {
  settings: ChristmasCookieSettings;
  cards: number[];        // cookie type index for each card
  flipped: boolean[];     // currently face-up
  matched: boolean[];     // permanently matched
  firstPick: number | null;
  lockBoard: boolean;
  moves: number;
  score: number;
  over: boolean;
}

export type ChristmasCookieAction =
  | { type: "flip"; index: number }
  | { type: "resolve" };

const COOKIE_TYPES = 10;

export function initialState(seed: number, settings: ChristmasCookieSettings): ChristmasCookieState {
  const numPairs = parseInt(settings.pairs, 10);
  const rng = mulberry32(seed);
  const pool: number[] = [];
  for (let i = 0; i < numPairs; i++) {
    const t = i % COOKIE_TYPES;
    pool.push(t, t);
  }
  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return {
    settings,
    cards: pool,
    flipped: Array(pool.length).fill(false),
    matched: Array(pool.length).fill(false),
    firstPick: null,
    lockBoard: false,
    moves: 0,
    score: 0,
    over: false,
  };
}

export function reducer(state: ChristmasCookieState, action: ChristmasCookieAction): ChristmasCookieState {
  if (state.over) return state;

  if (action.type === "resolve") {
    if (!state.lockBoard || state.firstPick === null) return state;
    const flipped = [...state.flipped];
    const matched = [...state.matched];
    const secondIdx = flipped.findIndex((f, i) => f && i !== state.firstPick && !matched[i]);
    if (secondIdx === -1) return state;
    if (state.cards[state.firstPick] === state.cards[secondIdx]) {
      matched[state.firstPick!] = true;
      matched[secondIdx] = true;
      const allMatched = matched.every(Boolean);
      const numPairs = parseInt(state.settings.pairs, 10);
      const bonus = Math.max(0, numPairs * 10 - state.moves);
      return {
        ...state,
        flipped,
        matched,
        firstPick: null,
        lockBoard: false,
        score: state.score + 100 + bonus,
        over: allMatched,
      };
    } else {
      flipped[state.firstPick!] = false;
      flipped[secondIdx] = false;
      return { ...state, flipped, firstPick: null, lockBoard: false };
    }
  }

  if (action.type === "flip") {
    const { index } = action;
    if (state.lockBoard) return state;
    if (state.flipped[index] || state.matched[index]) return state;
    const flipped = [...state.flipped];
    flipped[index] = true;
    if (state.firstPick === null) {
      return { ...state, flipped, firstPick: index };
    } else {
      return { ...state, flipped, lockBoard: true, moves: state.moves + 1 };
    }
  }

  return state;
}

export function isTerminal(state: ChristmasCookieState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}
