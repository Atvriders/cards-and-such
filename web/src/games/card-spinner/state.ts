import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CardSpinnerSettings {
  rounds: "5" | "10" | "15";
}

export type Suit = "♠" | "♥" | "♦" | "♣";
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";
export type Color = "red" | "black";

export interface Card {
  suit: Suit;
  rank: Rank;
  color: Color;
}

export type BetType = "color" | "suit" | "rank";

export interface Bet {
  type: BetType;
  value: string;
}

export interface RoundResult {
  card: Card;
  bets: Bet[];
  wins: number;
  loss: number;
  net: number;
}

export interface CardSpinnerState {
  settings: CardSpinnerSettings;
  rngSeed: number;
  round: number;
  totalRounds: number;
  spunCard: Card | null;
  spinning: boolean;
  bets: Bet[];
  score: number;
  history: RoundResult[];
  gameOver: boolean;
}

export type CardSpinnerAction =
  | { type: "placeBet"; bet: Bet }
  | { type: "removeBet"; index: number }
  | { type: "spin" }
  | { type: "nextRound" }
  | { type: "restart" };

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const SUIT_COLOR: Record<Suit, Color> = { "♠": "black", "♣": "black", "♥": "red", "♦": "red" };

function nextSeed(seed: number): number {
  return (mulberry32(seed)() * 2 ** 31) >>> 0;
}

function drawCard(seed: number): Card {
  const rng = mulberry32(seed);
  const suitIdx = Math.floor(rng() * 4);
  const rankIdx = Math.floor(rng() * 13);
  const suit = SUITS[suitIdx]!;
  return { suit, rank: RANKS[rankIdx]!, color: SUIT_COLOR[suit] };
}

function evalBet(bet: Bet, card: Card): boolean {
  if (bet.type === "color") return card.color === bet.value;
  if (bet.type === "suit") return card.suit === bet.value;
  if (bet.type === "rank") return card.rank === bet.value;
  return false;
}

const BET_PAYOUTS: Record<BetType, number> = {
  color: 10,  // 1:1 roughly, pays 10
  suit: 30,   // 4:1 roughly, pays 30
  rank: 130,  // 13:1 roughly, pays 130
};

const BET_COSTS: Record<BetType, number> = {
  color: 5,
  suit: 10,
  rank: 20,
};

export function initialState(seed: number, settings: CardSpinnerSettings): CardSpinnerState {
  return {
    settings,
    rngSeed: seed >>> 0,
    round: 1,
    totalRounds: parseInt(settings.rounds, 10),
    spunCard: null,
    spinning: false,
    bets: [],
    score: 0,
    history: [],
    gameOver: false,
  };
}

export function reducer(state: CardSpinnerState, action: CardSpinnerAction): CardSpinnerState {
  if (action.type === "restart") {
    return initialState(nextSeed(state.rngSeed), state.settings);
  }
  if (state.gameOver) return state;

  if (action.type === "placeBet") {
    // Limit to 3 bets per round
    if (state.bets.length >= 3) return state;
    // No duplicate bet types
    if (state.bets.some(b => b.type === action.bet.type && b.value === action.bet.value)) return state;
    return { ...state, bets: [...state.bets, action.bet] };
  }

  if (action.type === "removeBet") {
    const bets = state.bets.filter((_, i) => i !== action.index);
    return { ...state, bets };
  }

  if (action.type === "nextRound") {
    if (state.spunCard === null) return state;
    return { ...state, spunCard: null, bets: [] };
  }

  if (action.type === "spin") {
    if (state.spunCard !== null) return state; // already spun this round
    const card = drawCard(state.rngSeed);
    const newSeed = nextSeed(state.rngSeed);

    let wins = 0;
    let totalCost = 0;
    for (const bet of state.bets) {
      totalCost += BET_COSTS[bet.type];
      if (evalBet(bet, card)) wins += BET_PAYOUTS[bet.type];
    }
    const net = wins - totalCost;
    const result: RoundResult = { card, bets: [...state.bets], wins, loss: totalCost, net };
    const round = state.round + 1;
    const gameOver = round > state.totalRounds;

    return {
      ...state,
      rngSeed: newSeed,
      spunCard: card,
      score: state.score + net,
      history: [result, ...state.history],
      round,
      gameOver,
    };
  }

  return state;
}

export function isTerminal(state: CardSpinnerState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: Math.max(0, state.score + 500) }; // base 500 so score is always positive-ish
}

export { BET_PAYOUTS, BET_COSTS, SUITS, RANKS };
