// Pepper — Euchre variant with a 'pepper' bid — set trump duel.
// Auto-generated 1v1 trick-taking duel.
import type { Card, Rank, Suit } from "../../engines/deck/index.js";
import { shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type PepperPhase = "playing" | "done";

export interface PepperState {
  rngSeed: number;
  playerHand: readonly Card[];
  botHand: readonly Card[];
  currentTrick: readonly { seat: number; card: Card }[];
  playerTricks: number;
  botTricks: number;
  totalTricks: number;
  winThreshold: number;
  phase: PepperPhase;
  playerLeads: boolean;
  message: string;
}

export type PepperAction = { type: "play"; cardId: string };

function buildDeck(): Card[] {
  const cards: Card[] = [];
  const RANKS: Rank[] = [1, 9, 10, 11, 12, 13];
  const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
  for (const s of SUITS) for (const r of RANKS) {
    cards.push({ suit: s, rank: r, id: `pepper-${s}${r}` });
  }
  return cards;
}

const TRUMP: Suit = "♣";

const HAND_SIZE = 6;
const WIN_THRESHOLD = 3;

function rankOrder(rank: Rank): number {
  return rank === 1 ? 14 : rank;
}

function cardStrength(card: Card, ledSuit: Suit): number {
  if (TRUMP && card.suit === TRUMP) return 200 + rankOrder(card.rank);
  if (card.suit === ledSuit) return 100 + rankOrder(card.rank);
  return rankOrder(card.rank);
}

function trickWinner(trick: readonly { seat: number; card: Card }[]): number {
  const led = trick[0]!.card.suit;
  return trick.reduce((best, cur) =>
    cardStrength(cur.card, led) > cardStrength(best.card, led) ? cur : best
  ).seat;
}

export function legalPlays(hand: readonly Card[], trick: readonly { seat: number; card: Card }[]): Card[] {
  if (trick.length === 0) return [...hand];
  const ledSuit = trick[0]!.card.suit;
  const followers = hand.filter(c => c.suit === ledSuit);
  return followers.length > 0 ? followers : [...hand];
}

function botChoose(hand: readonly Card[], trick: readonly { seat: number; card: Card }[], rng: () => number): Card {
  const legal = legalPlays(hand, trick);
  if (legal.length === 1) return legal[0]!;
  if (trick.length === 0) {
    // Lead a low-ish non-trump if possible
    const led = TRUMP ? legal.filter(c => c.suit !== TRUMP) : legal;
    const pool = led.length > 0 ? led : legal;
    return pool[Math.floor(rng() * pool.length)]!;
  }
  // Try to win cheapest, else dump lowest
  const ledSuit = trick[0]!.card.suit;
  const playerCard = trick[0]!.card;
  const winners = legal.filter(c => cardStrength(c, ledSuit) > cardStrength(playerCard, ledSuit));
  if (winners.length > 0) {
    return winners.reduce((lo, c) => cardStrength(c, ledSuit) < cardStrength(lo, ledSuit) ? c : lo);
  }
  return legal.reduce((lo, c) => cardStrength(c, ledSuit) < cardStrength(lo, ledSuit) ? c : lo);
}

function applyTrick(state: PepperState, trick: readonly { seat: number; card: Card }[]): PepperState {
  const winner = trickWinner(trick);
  const playerTricks = state.playerTricks + (winner === 0 ? 1 : 0);
  const botTricks = state.botTricks + (winner === 1 ? 1 : 0);
  const handSize = state.playerHand.length;
  if (handSize === 0) {
    const won = playerTricks >= state.winThreshold;
    return {
      ...state,
      playerTricks, botTricks,
      currentTrick: [],
      phase: "done",
      message: won
        ? `You won! ${playerTricks}-${botTricks} tricks.`
        : `Bot won. ${botTricks}-${playerTricks} tricks.`,
    };
  }
  return {
    ...state,
    playerTricks, botTricks,
    currentTrick: [],
    playerLeads: winner === 0,
    message: winner === 0 ? "You won the trick — your lead." : "Bot won — bot leads.",
  };
}

export function reducer(state: PepperState, action: PepperAction): PepperState {
  if (state.phase === "done") return state;
  if (action.type !== "play") return state;
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  const card = state.playerHand.find(c => c.id === action.cardId);
  if (!card) return state;
  const legal = legalPlays(state.playerHand, state.currentTrick);
  if (!legal.some(c => c.id === card.id)) return state;

  let s: PepperState = { ...state, rngSeed: nextSeed };
  const newPlayerHand = s.playerHand.filter(c => c.id !== card.id);

  if (s.playerLeads) {
    const trick: { seat: number; card: Card }[] = [{ seat: 0, card }];
    const botCard = botChoose(s.botHand, trick, rng);
    const newBotHand = s.botHand.filter(c => c.id !== botCard.id);
    trick.push({ seat: 1, card: botCard });
    let next: PepperState = { ...s, playerHand: newPlayerHand, botHand: newBotHand, currentTrick: trick };
    next = applyTrick(next, trick);
    // If next trick still being played and bot leads, prepare bot lead card in currentTrick
    if (next.phase === "playing" && !next.playerLeads) {
      const lead = botChoose(next.botHand, [], rng);
      const reducedBot = next.botHand.filter(c => c.id !== lead.id);
      next = { ...next, botHand: reducedBot, currentTrick: [{ seat: 1, card: lead }], message: `Bot led ${lead.suit}${rankLabel(lead.rank)}. Your turn.` };
    }
    return next;
  } else {
    // Bot already has card in currentTrick; player completes
    const trick = [...s.currentTrick, { seat: 0, card }];
    let next: PepperState = { ...s, playerHand: newPlayerHand, currentTrick: trick };
    next = applyTrick(next, trick);
    if (next.phase === "playing" && !next.playerLeads) {
      const lead = botChoose(next.botHand, [], rng);
      const reducedBot = next.botHand.filter(c => c.id !== lead.id);
      next = { ...next, botHand: reducedBot, currentTrick: [{ seat: 1, card: lead }], message: `Bot led ${lead.suit}${rankLabel(lead.rank)}. Your turn.` };
    }
    return next;
  }
}

function rankLabel(rank: Rank): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

export function initialState(seed: number): PepperState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const deck = shuffle(buildDeck(), mulberry32(nextSeed));
  const playerHand = deck.slice(0, HAND_SIZE);
  const botHand = deck.slice(HAND_SIZE, HAND_SIZE * 2);
  return {
    rngSeed: Math.floor(mulberry32(nextSeed)() * 2 ** 31),
    playerHand,
    botHand,
    currentTrick: [],
    playerTricks: 0,
    botTricks: 0,
    totalTricks: HAND_SIZE,
    winThreshold: WIN_THRESHOLD,
    phase: "playing",
    playerLeads: true,
    message: `Trump: ♣. Your lead.`,
  };
}

export function isTerminal(state: PepperState): { score: number } | null {
  if (state.phase !== "done") return null;
  const total = state.playerTricks + state.botTricks;
  return { score: total > 0 ? Math.round((state.playerTricks / total) * 100) : 50 };
}

export const TRUMP_SUIT = TRUMP;
