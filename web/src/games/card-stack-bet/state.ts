import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Card Stack Bet: A growing stack of cards. Bet whether the next card is higher or lower than the top.

export interface CardStackBetSettings { rounds: "10" | "15"; }

export interface CardStackBetState {
  deck: number[];
  pos: number;
  topCard: number;
  coins: number;
  bid: number;
  round: number;
  maxRounds: number;
  phase: "betting" | "revealed" | "gameover";
  lastResult: "win" | "lose" | "tie" | null;
  revealedCard: number | null;
}

export type CardStackBetAction =
  | { type: "bet"; amount: number; dir: "higher" | "lower" }
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

export function initialState(seed: number, settings: CardStackBetSettings): CardStackBetState {
  const rng = mulberry32(seed);
  const deck = makeDeck(rng);
  return { deck, pos: 1, topCard: deck[0]!, coins: 100, bid: 0, round: 1, maxRounds: parseInt(settings.rounds, 10), phase: "betting", lastResult: null, revealedCard: null };
}

export function reducer(state: CardStackBetState, action: CardStackBetAction): CardStackBetState {
  if (state.phase === "gameover") return state;
  if (action.type === "bet") {
    if (state.phase !== "betting") return state;
    const amount = Math.max(1, Math.min(action.amount, state.coins));
    const nextCard = state.deck[state.pos % state.deck.length]!;
    const topRank = state.topCard % 13;
    const nextRank = nextCard % 13;
    let result: "win" | "lose" | "tie";
    if (nextRank === topRank) result = "tie";
    else result = (action.dir === "higher") === (nextRank > topRank) ? "win" : "lose";
    const delta = result === "win" ? amount : result === "tie" ? 0 : -amount;
    const newCoins = Math.max(0, state.coins + delta);
    const phase = (state.round >= state.maxRounds || newCoins <= 0) ? "gameover" : "revealed";
    return { ...state, bid: amount, revealedCard: nextCard, lastResult: result, coins: newCoins, phase };
  }
  if (action.type === "next") {
    if (state.phase !== "revealed") return state;
    return { ...state, topCard: state.revealedCard!, pos: state.pos + 1, revealedCard: null, round: state.round + 1, phase: "betting", lastResult: null };
  }
  return state;
}

export function isTerminal(state: CardStackBetState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.coins } : null;
}
