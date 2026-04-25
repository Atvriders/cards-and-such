import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CardPileStackSettings { rounds: "5" | "10" | "15"; }
export interface CardPileStackState {
  settings: CardPileStackSettings;
  deck: number[];
  pile: number[];      // cards added to pile
  score: number;
  round: number;
  totalRounds: number;
  lastAdded: number | null;
  phase: "playing" | "gameover";
}
export type CardPileStackAction = { type: "draw" } | { type: "bank" };

export function cardRank(card: number): number { return card % 13; }
export function cardSuit(card: number): number { return Math.floor(card / 13); }
export const SUIT_SYMS = ["♠", "♥", "♦", "♣"];
export const RANK_NAMES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
export function cardValue(card: number): number { const r = cardRank(card); return r === 0 ? 11 : r >= 10 ? 10 : r + 1; }

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

function pileTotal(pile: number[]): number { return pile.reduce((s, c) => s + cardValue(c), 0); }

export function initialState(seed: number, settings: CardPileStackSettings): CardPileStackState {
  const rng = mulberry32(seed);
  const deck = shuffle(Array.from({ length: 52 }, (_, i) => i), rng);
  return { settings, deck, pile: [], score: 0, round: 1, totalRounds: parseInt(settings.rounds, 10), lastAdded: null, phase: "playing" };
}

export function reducer(state: CardPileStackState, action: CardPileStackAction): CardPileStackState {
  if (state.phase === "gameover") return state;
  switch (action.type) {
    case "draw": {
      if (state.deck.length === 0) return { ...state, phase: "gameover" };
      const deck = [...state.deck];
      const card = deck.shift()!;
      const pile = [...state.pile, card];
      const total = pileTotal(pile);
      if (total > 21) {
        // bust — lose pile, start new round
        const nextRound = state.round + 1;
        if (nextRound > state.totalRounds) return { ...state, deck, pile: [], phase: "gameover", lastAdded: card };
        return { ...state, deck, pile: [], round: nextRound, lastAdded: card };
      }
      return { ...state, deck, pile, lastAdded: card };
    }
    case "bank": {
      if (state.pile.length === 0) return state;
      const earned = pileTotal(state.pile);
      const nextRound = state.round + 1;
      if (nextRound > state.totalRounds) return { ...state, pile: [], score: state.score + earned, phase: "gameover" };
      return { ...state, pile: [], score: state.score + earned, round: nextRound };
    }
    default: return state;
  }
}

export function isTerminal(state: CardPileStackState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
