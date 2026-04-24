// Bezique – French/British 2-player melding + trick game
// Uses 64-card double Piquet deck (7-A × 2 in all 4 suits)
// Simplified: trump by first marriage, tricks then score melds
import type { Card, Suit } from "../../engines/deck/index.js";
import { shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface BeziqueSettings {
  botDifficulty: "easy" | "hard";
}

export type BeziquePhase = "stock" | "tricks" | "done";
// stock phase: non-follow-suit allowed, draw after each trick
// tricks phase: no more stock, must follow suit

export interface BeziqueState {
  settings: BeziqueSettings;
  rngSeed: number;
  hands: readonly (readonly Card[])[];
  stock: readonly Card[];
  currentTrick: readonly { seat: number; card: Card }[];
  leadSeat: number;
  turn: number;
  phase: BeziquePhase;
  trumpSuit: Suit | null;
  playerScore: number;
  botScore: number;
  lastTrickWinner: number | null;
  message: string;
  // Meld tracking
  usedMelds: ReadonlySet<string>; // card ids used in scored melds
}

export type BeziqueAction =
  | { type: "play"; cardId: string };

// 64-card double Piquet deck (7-A, two copies)
const PIQUET_RANKS = [7, 8, 9, 10, 11, 12, 13, 1] as const;
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

function piquet64Deck(): Card[] {
  const cards: Card[] = [];
  for (let copy = 0; copy < 2; copy++) {
    for (const s of SUITS) {
      for (const r of PIQUET_RANKS) {
        cards.push({ suit: s, rank: r as Card["rank"], id: `bz${copy}-${s}${r}` });
      }
    }
  }
  return cards;
}

function rankOrder(rank: Card["rank"]): number {
  if (rank === 1) return 14; // Ace high
  if (rank === 10) return 10;
  return rank;
}

function cardStrength(card: Card, trump: Suit | null, ledSuit: Suit): number {
  if (trump && card.suit === trump) return 200 + rankOrder(card.rank);
  if (card.suit === ledSuit) return 100 + rankOrder(card.rank);
  return rankOrder(card.rank);
}

function trickWinner(trick: readonly { seat: number; card: Card }[], trump: Suit | null): number {
  const led = trick[0]!.card.suit;
  return trick.reduce((best, cur) =>
    cardStrength(cur.card, trump, led) > cardStrength(best.card, trump, led) ? cur : best
  ).seat;
}

export function legalPlays(state: BeziqueState, seat: number): Card[] {
  const hand = [...(state.hands[seat] ?? [])];
  if (state.phase === "stock") return hand; // no follow-suit requirement in stock phase
  const trick = state.currentTrick;
  if (trick.length === 0) return hand;
  const led = trick[0]!.card.suit;
  const matching = hand.filter(c => c.suit === led);
  return matching.length > 0 ? matching : hand;
}

// Meld scoring
function scoreMelds(hand: readonly Card[], trump: Suit): number {
  let pts = 0;
  const hasSuit = (suit: Suit, rank: number) =>
    hand.some(c => c.suit === suit && c.rank === rank);
  const trumpQ = hasSuit(trump, 12);
  const trumpJ = hasSuit(trump, 11);
  const spadeQ = hasSuit("♠", 12);
  const diamondJ = hasSuit("♦", 11);
  // Bezique: Q♠ + J♦
  if (spadeQ && diamondJ) pts += 40;
  // Marriage in trump
  if (trumpQ && trumpJ) pts += 40;
  // Marriage in plain suit (pick one non-trump suit)
  for (const s of SUITS) {
    if (s !== trump) {
      if (hasSuit(s, 12) && hasSuit(s, 11)) pts += 20;
    }
  }
  return pts;
}

function botPlay(state: BeziqueState, seat: number): Card {
  const legal = legalPlays(state, seat);
  if (legal.length === 0) return state.hands[seat]![0]!;
  if (legal.length === 1) return legal[0]!;
  const trick = state.currentTrick;
  const trump = state.trumpSuit;

  if (trick.length === 0) {
    // Lead highest non-trump to save trump
    const nonTrump = legal.filter(c => !trump || c.suit !== trump);
    if (nonTrump.length > 0) return nonTrump.reduce((hi, c) => rankOrder(c.rank) > rankOrder(hi.rank) ? c : hi);
    return legal.reduce((hi, c) => rankOrder(c.rank) > rankOrder(hi.rank) ? c : hi);
  }

  const led = trick[0]!.card.suit;
  const best = trick.reduce((b, cur) =>
    cardStrength(cur.card, trump, led) > cardStrength(b.card, trump, led) ? cur : b
  );
  const winCards = legal.filter(c => cardStrength(c, trump, led) > cardStrength(best.card, trump, led));
  if (winCards.length > 0) return winCards.reduce((lo, c) => rankOrder(c.rank) < rankOrder(lo.rank) ? c : lo);
  return legal.reduce((lo, c) => rankOrder(c.rank) < rankOrder(lo.rank) ? c : lo);
}

// Card point values for tricks (Aces and Tens = 10 pts each; last trick bonus omitted for simplicity)
function trickCardPts(cards: readonly { seat: number; card: Card }[]): number {
  return cards.reduce((sum, e) => {
    if (e.card.rank === 1 || e.card.rank === 10) return sum + 10;
    return sum;
  }, 0);
}

function applyTrick(state: BeziqueState, winnerSeat: number): BeziqueState {
  const trick = state.currentTrick;
  const pts = trickCardPts(trick);
  let playerScore = state.playerScore;
  let botScore = state.botScore;
  if (winnerSeat === 0) playerScore += pts;
  else botScore += pts;

  let newStock = [...state.stock];
  let newHands = [...state.hands.map(h => [...h])];

  // Draw in stock phase
  if (state.phase === "stock" && newStock.length > 0) {
    newHands[winnerSeat] = [...newHands[winnerSeat]!, newStock.shift()!];
    const other = 1 - winnerSeat;
    if (newStock.length > 0) {
      newHands[other] = [...newHands[other]!, newStock.shift()!];
    }
  }

  // Check trump via first marriage
  let trumpSuit = state.trumpSuit;
  if (!trumpSuit && winnerSeat === 0) {
    const hand = newHands[0]!;
    for (const s of SUITS) {
      if (hand.some(c => c.suit === s && c.rank === 12) && hand.some(c => c.suit === s && c.rank === 11)) {
        trumpSuit = s;
        playerScore += 40; // marriage meld
        break;
      }
    }
  }

  const phase: BeziquePhase = newStock.length === 0 ? "tricks" : "stock";

  let msg = ``;
  if (winnerSeat === 0) msg = `You win the trick (+${pts} pts). Score: You ${playerScore} | Bot ${botScore}`;
  else msg = `Bot wins the trick (+${pts} pts). Score: You ${playerScore} | Bot ${botScore}`;

  // Check end of hand
  if (newHands[0]!.length === 0 || (phase === "tricks" && newHands[0]!.length === 0)) {
    return {
      ...state,
      hands: newHands,
      stock: newStock,
      currentTrick: [],
      leadSeat: winnerSeat,
      turn: winnerSeat,
      phase: "done",
      trumpSuit,
      playerScore,
      botScore,
      lastTrickWinner: winnerSeat,
      message: `Game over! You: ${playerScore} | Bot: ${botScore}`,
      usedMelds: state.usedMelds,
    };
  }

  return {
    ...state,
    hands: newHands,
    stock: newStock,
    currentTrick: [],
    leadSeat: winnerSeat,
    turn: winnerSeat,
    phase,
    trumpSuit,
    playerScore,
    botScore,
    lastTrickWinner: winnerSeat,
    message: msg,
    usedMelds: state.usedMelds,
  };
}

export function reducer(state: BeziqueState, action: BeziqueAction): BeziqueState {
  if (state.phase === "done") return state;
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  if (action.type === "play") {
    if (state.turn !== 0) return state;
    const card = state.hands[0]!.find(c => c.id === action.cardId);
    if (!card) return state;
    if (!legalPlays(state, 0).some(c => c.id === card.id)) return state;

    // Player plays
    const newHands0 = state.hands[0]!.filter(c => c.id !== card.id);
    const newTrick = [{ seat: 0, card }];
    let s: BeziqueState = {
      ...state,
      rngSeed: nextSeed,
      hands: [newHands0, ...state.hands.slice(1)] as typeof state.hands,
      currentTrick: newTrick,
      turn: 1,
    };

    // Bot plays (guard empty hand)
    if (s.hands[1]!.length === 0) {
      return { ...s, phase: "done", message: `Game over! You: ${s.playerScore} | Bot: ${s.botScore}` };
    }
    const botCard = botPlay(s, 1);
    if (!botCard) {
      return { ...s, phase: "done", message: `Game over! You: ${s.playerScore} | Bot: ${s.botScore}` };
    }
    const newHands1 = s.hands[1]!.filter(c => c.id !== botCard.id);
    const fullTrick = [...newTrick, { seat: 1, card: botCard }];
    s = {
      ...s,
      hands: [s.hands[0]!, newHands1] as typeof state.hands,
      currentTrick: fullTrick,
    };

    const winner = trickWinner(fullTrick, s.trumpSuit);
    s = applyTrick(s, winner);

    // If bot wins and game not done, bot leads next
    if (s.phase !== "done" && s.leadSeat === 1 && s.hands[1]!.length > 0) {
      const botLead = botPlay(s, 1);
      if (botLead) {
        const bh1 = s.hands[1]!.filter(c => c.id !== botLead.id);
        s = {
          ...s,
          hands: [s.hands[0]!, bh1] as typeof state.hands,
          currentTrick: [{ seat: 1, card: botLead }],
          turn: 0,
        };
      }
    }

    return s;
  }
  return state;
}

export function initialState(seed: number, settings: BeziqueSettings): BeziqueState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);
  const deck = shuffle(piquet64Deck(), dealRng);
  const hand0 = deck.slice(0, 8);
  const hand1 = deck.slice(8, 16);
  const stock = deck.slice(16);
  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    hands: [hand0, hand1],
    stock,
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "stock",
    trumpSuit: null,
    playerScore: 0,
    botScore: 0,
    lastTrickWinner: null,
    message: "Play a card. Trump is set by first marriage (Q+J same suit you win).",
    usedMelds: new Set<string>(),
  };
}

export function isTerminal(state: BeziqueState): { score: number } | null {
  if (state.phase !== "done") return null;
  const diff = state.playerScore - state.botScore;
  return { score: Math.max(0, Math.min(100, 50 + Math.round(diff / 10))) };
}
