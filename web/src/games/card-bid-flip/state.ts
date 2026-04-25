import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CardBidFlipSettings { rounds: "10" | "20"; }

export interface CardBidFlipState {
  deck: number[];
  pos: number;
  currentCard: number | null;
  bid: number;
  coins: number;
  round: number;
  maxRounds: number;
  phase: "bidding" | "flipped" | "gameover";
  lastWin: boolean | null;
}

export type CardBidFlipAction =
  | { type: "bid"; amount: number }
  | { type: "next" };

function makeDeck(rng: () => number): number[] {
  const arr = Array.from({ length: 52 }, (_, i) => i);
  for (let i = 51; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j]!, arr[i]!]; }
  return arr;
}

export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}

export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

export function initialState(seed: number, settings: CardBidFlipSettings): CardBidFlipState {
  const rng = mulberry32(seed);
  const deck = makeDeck(rng);
  return { deck, pos: 0, currentCard: null, bid: 0, coins: 100, round: 1, maxRounds: parseInt(settings.rounds, 10), phase: "bidding", lastWin: null };
}

export function reducer(state: CardBidFlipState, action: CardBidFlipAction): CardBidFlipState {
  if (state.phase === "gameover") return state;
  if (action.type === "bid") {
    if (state.phase !== "bidding") return state;
    const amount = Math.max(1, Math.min(action.amount, state.coins));
    const card = state.deck[state.pos % state.deck.length]!;
    // Win if card rank >= 6 (i.e., 8 or higher face value = cards 4..12 in rank)
    const rank = card % 13;
    const win = rank >= 4; // rank 4 = "8" value, represents roughly half the deck
    const newCoins = win ? state.coins + amount : state.coins - amount;
    const phase = state.round >= state.maxRounds || newCoins <= 0 ? "gameover" : "flipped";
    return { ...state, currentCard: card, bid: amount, lastWin: win, coins: Math.max(0, newCoins), phase };
  }
  if (action.type === "next") {
    if (state.phase !== "flipped") return state;
    return { ...state, pos: state.pos + 1, currentCard: null, round: state.round + 1, phase: "bidding", lastWin: null };
  }
  return state;
}

export function isTerminal(state: CardBidFlipState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.coins } : null;
}
