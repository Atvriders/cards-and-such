import type { Card, Suit } from "../../engines/deck/index.js";
import { shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// 40-card Italian deck: A,2,3,4,5,6,7,J(11),Q(12),K(13) — no 8,9,10
const ITALIAN_RANKS = [1, 2, 3, 4, 5, 6, 7, 11, 12, 13] as const;
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

export function italianDeck(): Card[] {
  const cards: Card[] = [];
  for (const s of SUITS) {
    for (const r of ITALIAN_RANKS) {
      cards.push({ suit: s, rank: r as Card["rank"], id: `br-${s}${r}` });
    }
  }
  return cards;
}

/** Point value of a card in Briscola */
export function briscolaValue(rank: Card["rank"]): number {
  if (rank === 1) return 11;   // Ace
  if (rank === 3) return 10;   // 3
  if (rank === 13) return 4;   // King
  if (rank === 12) return 3;   // Queen (Cavallo)
  if (rank === 11) return 2;   // Jack
  return 0;
}

export type BriscolaPhase = "playing" | "done";

export interface BriscolaState {
  rngSeed: number;
  playerHand: readonly Card[];
  botHand: readonly Card[];
  stock: readonly Card[];
  trump: Card;       // the briscola card (flipped from stock bottom)
  trumpSuit: Suit;
  currentTrick: readonly { seat: number; card: Card }[];
  playerPoints: number;
  botPoints: number;
  phase: BriscolaPhase;
  playerFirst: boolean;  // who leads this trick
  message: string;
}

export type BriscolaAction = { type: "play"; cardId: string };

function cardStrength(card: Card, trumpSuit: Suit, ledSuit: Suit): number {
  const isTrump = card.suit === trumpSuit;
  const isLed = card.suit === ledSuit;
  const rankPower = briscolaValue(card.rank) * 100 + rankOrder(card.rank);
  if (isTrump) return 2000 + rankPower;
  if (isLed) return 1000 + rankPower;
  return rankPower;
}

function rankOrder(rank: Card["rank"]): number {
  // For tie-breaking: Ace > 3 > K > Q > J > 7 > 6 > ... > 2
  if (rank === 1) return 10;
  if (rank === 3) return 9;
  if (rank === 13) return 8;
  if (rank === 12) return 7;
  if (rank === 11) return 6;
  return rank; // 7,6,5,4,2
}

function trickWinner(
  trick: readonly { seat: number; card: Card }[],
  trumpSuit: Suit
): number {
  const led = trick[0]!.card.suit;
  return trick.reduce((best, cur) =>
    cardStrength(cur.card, trumpSuit, led) > cardStrength(best.card, trumpSuit, led) ? cur : best
  ).seat;
}

function botChoose(hand: readonly Card[], trumpSuit: Suit, trick: readonly { seat: number; card: Card }[]): Card {
  if (trick.length === 0) {
    // Lead lowest non-trump if possible
    const nonTrump = hand.filter(c => c.suit !== trumpSuit);
    const pool = nonTrump.length > 0 ? nonTrump : [...hand];
    return pool.reduce((lo, c) => briscolaValue(c.rank) < briscolaValue(lo.rank) ? c : lo);
  }
  const led = trick[0]!.card.suit;
  // Try to win with a trump if can't follow and trick has points
  const trickPoints = trick.reduce((s, e) => s + briscolaValue(e.card.rank), 0);
  if (trickPoints >= 10) {
    const trumps = hand.filter(c => c.suit === trumpSuit);
    if (trumps.length > 0) {
      return trumps.reduce((lo, c) => briscolaValue(c.rank) < briscolaValue(lo.rank) ? c : lo);
    }
  }
  // Otherwise play lowest value card
  return hand.reduce((lo, c) => briscolaValue(c.rank) < briscolaValue(lo.rank) ? c : lo);
}

function applyTrick(state: BriscolaState, trick: readonly { seat: number; card: Card }[], rng: () => number): BriscolaState {
  const winner = trickWinner(trick, state.trumpSuit);
  const pts = trick.reduce((s, e) => s + briscolaValue(e.card.rank), 0);
  let playerPoints = state.playerPoints + (winner === 0 ? pts : 0);
  let botPoints = state.botPoints + (winner === 1 ? pts : 0);

  // Draw cards: winner draws first
  let stock = [...state.stock];
  let playerHand = [...state.playerHand];
  let botHand = [...state.botHand];

  if (stock.length > 0) {
    if (winner === 0) {
      playerHand = [...playerHand, stock[0]!];
      stock = stock.slice(1);
      if (stock.length > 0) {
        botHand = [...botHand, stock[0]!];
        stock = stock.slice(1);
      }
    } else {
      botHand = [...botHand, stock[0]!];
      stock = stock.slice(1);
      if (stock.length > 0) {
        playerHand = [...playerHand, stock[0]!];
        stock = stock.slice(1);
      }
    }
  }

  if (playerHand.length === 0 && botHand.length === 0) {
    const msg = playerPoints >= 61
      ? `You win! ${playerPoints}-${botPoints}`
      : playerPoints === 60
      ? `Draw! Both 60 points`
      : `Bot wins! ${botPoints}-${playerPoints}`;
    return { ...state, playerHand, botHand, stock, playerPoints, botPoints, phase: "done", currentTrick: [], message: msg };
  }

  let s: BriscolaState = {
    ...state,
    playerHand,
    botHand,
    stock,
    playerPoints,
    botPoints,
    currentTrick: [],
    playerFirst: winner === 0,
    message: winner === 0 ? "You won the trick! Your lead." : "Bot won the trick. Bot leads.",
  };

  // If bot leads, auto-play bot's lead card
  if (winner === 1 && s.playerHand.length > 0) {
    const botCard = botChoose(s.botHand, s.trumpSuit, []);
    s = {
      ...s,
      botHand: s.botHand.filter(c => c.id !== botCard.id),
      currentTrick: [{ seat: 1, card: botCard }],
      message: `Bot played ${botCard.suit}${rankLabel(botCard.rank)}. Your turn.`,
    };
  }

  return s;
}

function rankLabel(rank: Card["rank"]): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

export function reducer(state: BriscolaState, action: BriscolaAction): BriscolaState {
  if (state.phase === "done") return state;
  if (action.type !== "play") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  const card = state.playerHand.find(c => c.id === action.cardId);
  if (!card) return state;

  const s: BriscolaState = { ...state, rngSeed: nextSeed };

  const newPlayerHand = s.playerHand.filter(c => c.id !== card.id);

  if (s.playerFirst) {
    // Player leads
    const trick: { seat: number; card: Card }[] = [{ seat: 0, card }];
    const botCard = botChoose(s.botHand, s.trumpSuit, trick);
    const newBotHand = s.botHand.filter(c => c.id !== botCard.id);
    trick.push({ seat: 1, card: botCard });
    return applyTrick({ ...s, playerHand: newPlayerHand, botHand: newBotHand }, trick, rng);
  } else {
    // Bot already played (currentTrick has bot's card)
    const trick = [...s.currentTrick, { seat: 0, card }];
    return applyTrick({ ...s, playerHand: newPlayerHand }, trick, rng);
  }
}

export function initialState(seed: number): BriscolaState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const deck = shuffle(italianDeck(), mulberry32(nextSeed));

  const playerHand = deck.slice(0, 3);
  const botHand = deck.slice(3, 6);
  const trump = deck[deck.length - 1]!;
  // Stock is cards 6..37 + trump at bottom (trump stays in stock until last)
  const stock = deck.slice(6);

  return {
    rngSeed: Math.floor(mulberry32(nextSeed)() * 2 ** 31),
    playerHand,
    botHand,
    stock,
    trump,
    trumpSuit: trump.suit,
    currentTrick: [],
    playerPoints: 0,
    botPoints: 0,
    phase: "playing",
    playerFirst: true,
    message: `Trump suit: ${trump.suit} (${trump.suit}${rankLabel(trump.rank)}). Your lead!`,
  };
}

export function isTerminal(state: BriscolaState): { score: number } | null {
  if (state.phase !== "done") return null;
  const diff = state.playerPoints - state.botPoints;
  return { score: Math.max(0, Math.min(100, 50 + diff)) };
}
