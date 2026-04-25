import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface ValentineMatchSettings {
  pairs: "6" | "8" | "10";
}

const SYMBOLS = ["💕", "💖", "💗", "💘", "💝", "🌹", "🍫", "💌", "🎀", "🫶"];

export interface ValentineMatchState {
  settings: ValentineMatchSettings;
  cards: number[];
  flipped: boolean[];
  matched: boolean[];
  firstPick: number | null;
  lockBoard: boolean;
  moves: number;
  score: number;
  combo: number;   // consecutive matches
  over: boolean;
}

export type ValentineMatchAction =
  | { type: "flip"; index: number }
  | { type: "resolve" };

export { SYMBOLS };

export function initialState(seed: number, settings: ValentineMatchSettings): ValentineMatchState {
  const numPairs = parseInt(settings.pairs, 10);
  const rng = mulberry32(seed);
  const pool: number[] = [];
  for (let i = 0; i < numPairs; i++) {
    const t = i % SYMBOLS.length;
    pool.push(t, t);
  }
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
    combo: 0,
    over: false,
  };
}

export function reducer(state: ValentineMatchState, action: ValentineMatchAction): ValentineMatchState {
  if (state.over) return state;

  if (action.type === "flip") {
    const { index } = action;
    if (state.lockBoard || state.flipped[index] || state.matched[index]) return state;
    const flipped = [...state.flipped];
    flipped[index] = true;
    if (state.firstPick === null) {
      return { ...state, flipped, firstPick: index };
    }
    return { ...state, flipped, lockBoard: true, moves: state.moves + 1 };
  }

  if (action.type === "resolve") {
    if (!state.lockBoard || state.firstPick === null) return state;
    const flipped = [...state.flipped];
    const matched = [...state.matched];
    const secondIdx = flipped.findIndex((f, i) => f && i !== state.firstPick && !matched[i]);
    if (secondIdx === -1) return state;

    if (state.cards[state.firstPick] === state.cards[secondIdx]) {
      matched[state.firstPick!] = true;
      matched[secondIdx] = true;
      const combo = state.combo + 1;
      const allMatched = matched.every(Boolean);
      const numPairs = parseInt(state.settings.pairs, 10);
      const bonus = combo * 50 + Math.max(0, numPairs * 10 - state.moves);
      return {
        ...state,
        flipped,
        matched,
        firstPick: null,
        lockBoard: false,
        score: state.score + 100 + bonus,
        combo,
        over: allMatched,
      };
    } else {
      flipped[state.firstPick!] = false;
      flipped[secondIdx] = false;
      return { ...state, flipped, firstPick: null, lockBoard: false, combo: 0 };
    }
  }

  return state;
}

export function isTerminal(state: ValentineMatchState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}
