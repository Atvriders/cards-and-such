import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CardBlastSettings {
  rounds: "5" | "8" | "12";
}

export type Suit = "♠" | "♥" | "♦" | "♣";
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

export interface Card {
  rank: Rank;
  suit: Suit;
  id: number;
}

export interface CardBlastState {
  settings: CardBlastSettings;
  hand: Card[];
  selected: number[];
  score: number;
  round: number;
  totalRounds: number;
  lastBlast: string;
  gameOver: boolean;
  message: string;
  rngSeed: number;
}

export type CardBlastAction =
  | { type: "toggle"; id: number }
  | { type: "blast" }
  | { type: "discard" }
  | { type: "restart" };

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const RANK_VALUES: Record<Rank, number> = {
  A: 14, K: 13, Q: 12, J: 11, "10": 10, "9": 9, "8": 8, "7": 7,
  "6": 6, "5": 5, "4": 4, "3": 3, "2": 2,
};

function makeDeck(rng: () => number): Card[] {
  const deck: Card[] = [];
  let id = 0;
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit, id: id++ });
    }
  }
  // shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j]!, deck[i]!];
  }
  return deck;
}

function dealHand(deck: Card[], count: number): Card[] {
  return deck.splice(0, count);
}

function evaluateBlast(cards: Card[]): { name: string; points: number } {
  if (cards.length === 0) return { name: "None", points: 0 };
  const ranks = cards.map(c => c.rank);
  const suits = cards.map(c => c.suit);
  const rankCounts: Record<string, number> = {};
  for (const r of ranks) rankCounts[r] = (rankCounts[r] ?? 0) + 1;
  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  const allSameSuit = suits.every(s => s === suits[0]);

  if (cards.length === 5) {
    if (allSameSuit && counts[0] === 1) return { name: "Flush Blast!", points: 500 };
    if (counts[0] === 4) return { name: "Four of a Kind!", points: 400 };
    if (counts[0] === 3 && counts[1] === 2) return { name: "Full House!", points: 350 };
    if (allSameSuit) return { name: "Flush!", points: 300 };
    if (counts[0] === 3) return { name: "Three Blast!", points: 200 };
    if (counts[0] === 2 && counts[1] === 2) return { name: "Two Pair!", points: 150 };
  }
  if (counts[0] === cards.length) {
    return { name: `${cards.length}-of-a-Kind!`, points: cards.length * 80 };
  }
  if (allSameSuit && cards.length >= 3) return { name: "Suit Blast!", points: cards.length * 40 };
  if (counts[0] === 2) return { name: "Pair!", points: 60 };

  const total = cards.reduce((sum, c) => sum + RANK_VALUES[c.rank], 0);
  return { name: "High Cards", points: Math.floor(total / cards.length) };
}

export function initialState(seed: number, settings: CardBlastSettings): CardBlastState {
  const rng = mulberry32(seed);
  const deck = makeDeck(rng);
  const hand = dealHand(deck, 7);
  return {
    settings,
    hand,
    selected: [],
    score: 0,
    round: 1,
    totalRounds: parseInt(settings.rounds, 10),
    lastBlast: "",
    gameOver: false,
    message: "Select cards to blast!",
    rngSeed: seed,
  };
}

export function reducer(state: CardBlastState, action: CardBlastAction): CardBlastState {
  if (action.type === "restart") {
    return initialState(Math.floor(Math.random() * 99999), state.settings);
  }
  if (action.type === "toggle" && !state.gameOver) {
    const { selected, hand } = state;
    const card = hand.find(c => c.id === action.id);
    if (!card) return state;
    const alreadySelected = selected.includes(action.id);
    const newSelected = alreadySelected
      ? selected.filter(id => id !== action.id)
      : selected.length < 5 ? [...selected, action.id] : selected;
    return { ...state, selected: newSelected };
  }
  if (action.type === "blast" && !state.gameOver) {
    const { selected, hand, score, round, totalRounds } = state;
    if (selected.length === 0) return { ...state, message: "Select at least 1 card!" };
    const blastCards = hand.filter(c => selected.includes(c.id));
    const { name, points } = evaluateBlast(blastCards);
    const newScore = score + points;
    const newRound = round + 1;
    const gameOver = newRound > totalRounds;
    const rng = mulberry32(state.rngSeed + round * 13);
    const deck = makeDeck(rng);
    const newHand = hand.filter(c => !selected.includes(c.id));
    const refill = dealHand(deck, Math.min(7 - newHand.length, 7));
    return {
      ...state,
      hand: [...newHand, ...refill],
      selected: [],
      score: newScore,
      round: newRound,
      totalRounds,
      lastBlast: `${name} +${points}pts`,
      gameOver,
      message: gameOver ? `Game Over! Final: ${newScore}pts` : `Round ${newRound}/${totalRounds}`,
    };
  }
  if (action.type === "discard" && !state.gameOver) {
    const { selected, hand, round, totalRounds } = state;
    if (selected.length === 0) return { ...state, message: "Select cards to discard!" };
    const newRound = round + 1;
    const gameOver = newRound > totalRounds;
    const rng = mulberry32(state.rngSeed + round * 17);
    const deck = makeDeck(rng);
    const newHand = hand.filter(c => !selected.includes(c.id));
    const refill = dealHand(deck, Math.min(7 - newHand.length, 7));
    return {
      ...state,
      hand: [...newHand, ...refill],
      selected: [],
      round: newRound,
      totalRounds,
      lastBlast: "Discarded",
      gameOver,
      message: gameOver ? `Game Over! Final: ${state.score}pts` : `Round ${newRound}/${totalRounds}`,
    };
  }
  return state;
}

export function isTerminal(state: CardBlastState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: Math.min(1000, Math.floor(state.score / 5)) };
}
