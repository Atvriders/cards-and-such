import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CardFlipThreeSettings { rounds: "5" | "10" | "15"; }
export interface CardFlipThreeState {
  settings: CardFlipThreeSettings;
  deck: number[];       // 0-51
  hand: number[];       // current 3 face-down
  revealed: boolean[];  // which are flipped
  score: number;
  round: number;
  totalRounds: number;
  phase: "playing" | "gameover";
}
export type CardFlipThreeAction = { type: "flip"; index: number } | { type: "next" };

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export function cardRank(card: number): number { return card % 13; } // 0=A,1=2,...,12=K
export function cardSuit(card: number): number { return Math.floor(card / 13); }
export const SUIT_SYMS = ["♠", "♥", "♦", "♣"];
export const RANK_NAMES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export function initialState(seed: number, settings: CardFlipThreeSettings): CardFlipThreeState {
  const rng = mulberry32(seed);
  const deck = shuffle(Array.from({ length: 52 }, (_, i) => i), rng);
  const totalRounds = parseInt(settings.rounds, 10);
  const hand = deck.splice(0, 3);
  return { settings, deck, hand, revealed: [false, false, false], score: 0, round: 1, totalRounds, phase: "playing" };
}

export function reducer(state: CardFlipThreeState, action: CardFlipThreeAction): CardFlipThreeState {
  if (state.phase === "gameover") return state;
  switch (action.type) {
    case "flip": {
      if (state.revealed[action.index]) return state;
      const revealed = [...state.revealed];
      revealed[action.index] = true;
      // score: face cards (J/Q/K) = 10, Ace = 11, others = rank+1
      const rank = cardRank(state.hand[action.index]!);
      const pts = rank === 0 ? 11 : rank >= 10 ? 10 : rank + 1;
      return { ...state, revealed, score: state.score + pts };
    }
    case "next": {
      if (!state.revealed.every(Boolean)) return state;
      const nextRound = state.round + 1;
      if (nextRound > state.totalRounds) return { ...state, phase: "gameover" };
      const deck = [...state.deck];
      const hand = deck.splice(0, 3);
      return { ...state, deck, hand, revealed: [false, false, false], round: nextRound };
    }
    default: return state;
  }
}

export function isTerminal(state: CardFlipThreeState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
