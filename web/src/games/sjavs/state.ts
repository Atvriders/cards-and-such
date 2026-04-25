// Sjavs – Faroese trick-taking game (4 players, 2 teams), fixed trump (clubs)
import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SjavsSettings {
  botDifficulty: "easy" | "hard";
}

export type SjavsPhase = "playing" | "done";

export interface SjavsState {
  settings: SjavsSettings;
  rngSeed: number;
  hands: readonly (readonly Card[])[];
  trumpSuit: Suit; // fixed to ♣ (clubs) in Sjavs
  currentTrick: readonly { seat: number; card: Card }[];
  leadSeat: number;
  turn: number;
  phase: SjavsPhase;
  tricks: readonly number[];
  teamTricks: readonly [number, number]; // team0(0+2), team1(1+3)
  teamScore: readonly [number, number];
  message: string;
}

export type SjavsAction = { type: "play"; cardId: string };

const HAND_SIZE = 8;
const TRUMP: Suit = "♣";

function rankOrder(rank: Card["rank"]): number {
  return rank === 1 ? 14 : rank;
}

function cardStrength(card: Card, trump: Suit, ledSuit: Suit): number {
  if (card.suit === trump) return 200 + rankOrder(card.rank);
  if (card.suit === ledSuit) return 100 + rankOrder(card.rank);
  return rankOrder(card.rank);
}

function trickWinner(trick: readonly { seat: number; card: Card }[], trump: Suit): number {
  const led = trick[0]!.card.suit;
  return trick.reduce((best, cur) =>
    cardStrength(cur.card, trump, led) > cardStrength(best.card, trump, led) ? cur : best
  ).seat;
}

export function legalPlays(state: SjavsState, seat: number): Card[] {
  const hand = [...(state.hands[seat] ?? [])];
  if (state.currentTrick.length === 0) return hand;
  const ledSuit = state.currentTrick[0]!.card.suit;
  const followers = hand.filter(c => c.suit === ledSuit);
  return followers.length > 0 ? followers : hand;
}

function botPlay(state: SjavsState, seat: number): Card {
  const legal = legalPlays(state, seat);
  if (legal.length === 1) return legal[0]!;
  const trump = state.trumpSuit;
  const trick = state.currentTrick;
  const teamMate = (seat + 2) % 4;

  if (trick.length === 0) {
    const trumpCards = legal.filter(c => c.suit === trump).sort((a, b) => rankOrder(b.rank) - rankOrder(a.rank));
    if (trumpCards.length > 1) return trumpCards[0]!;
    return legal.reduce((hi, c) => rankOrder(c.rank) > rankOrder(hi.rank) ? c : hi);
  }
  const led = trick[0]!.card.suit;
  const best = trick.reduce((b, cur) =>
    cardStrength(cur.card, trump, led) > cardStrength(b.card, trump, led) ? cur : b
  );
  if (best.seat === teamMate) {
    return legal.reduce((lo, c) => cardStrength(c, trump, led) < cardStrength(lo, trump, led) ? c : lo);
  }
  const winCards = legal.filter(c => cardStrength(c, trump, led) > cardStrength(best.card, trump, led));
  if (winCards.length > 0) return winCards.reduce((lo, c) => cardStrength(c, trump, led) < cardStrength(lo, trump, led) ? c : lo);
  return legal.reduce((lo, c) => cardStrength(c, trump, led) < cardStrength(lo, trump, led) ? c : lo);
}

function applyPlay(state: SjavsState, seat: number, card: Card): SjavsState {
  const trump = state.trumpSuit;
  const newHands = state.hands.map((h, i) => i === seat ? h.filter(c => c.id !== card.id) : h);
  const newTrick = [...state.currentTrick, { seat, card }];
  let s: SjavsState = { ...state, hands: newHands, currentTrick: newTrick };

  if (newTrick.length === 4) {
    const winner = trickWinner(newTrick, trump);
    const newTricks = state.tricks.map((t, i) => i === winner ? t + 1 : t);
    const team0 = newTricks[0]! + newTricks[2]!;
    const team1 = newTricks[1]! + newTricks[3]!;
    s = { ...s, currentTrick: [], tricks: newTricks, teamTricks: [team0, team1], leadSeat: winner, turn: winner };

    if (newHands[0]!.length === 0) {
      const won0 = team0 > team1;
      s = {
        ...s,
        teamScore: [state.teamScore[0] + (won0 ? 1 : 0), state.teamScore[1] + (won0 ? 0 : 1)],
        phase: "done",
        message: `Team 0: ${team0} tricks | Team 1: ${team1} tricks. ${won0 ? "Your team wins!" : "Bot team wins!"}`,
      };
    }
  } else {
    s = { ...s, turn: (seat + 1) % 4 };
  }
  return s;
}

export function reducer(state: SjavsState, action: SjavsAction): SjavsState {
  if (state.phase === "done") return state;
  if (action.type !== "play") return state;
  if (state.turn !== 0) return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const card = state.hands[0]!.find(c => c.id === action.cardId);
  if (!card) return state;
  if (!legalPlays(state, 0).some(c => c.id === card.id)) return state;

  let s: SjavsState = { ...state, rngSeed: nextSeed };
  s = applyPlay(s, 0, card);
  while (s.phase === "playing" && s.turn !== 0) {
    const botCard = botPlay(s, s.turn);
    s = applyPlay(s, s.turn, botCard);
  }
  return s;
}

export function initialState(seed: number, settings: SjavsSettings): SjavsState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);
  const deck = shuffle(newDeck(), dealRng);
  const hands: Card[][] = [
    deck.slice(0, HAND_SIZE),
    deck.slice(HAND_SIZE, HAND_SIZE * 2),
    deck.slice(HAND_SIZE * 2, HAND_SIZE * 3),
    deck.slice(HAND_SIZE * 3, HAND_SIZE * 4),
  ];
  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    hands,
    trumpSuit: TRUMP,
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "playing",
    tricks: [0, 0, 0, 0],
    teamTricks: [0, 0],
    teamScore: [0, 0],
    message: `Sjavs: Trump is always ${TRUMP}. You & Bot 2 vs Bot 1 & Bot 3. Most tricks wins!`,
  };
}

export function isTerminal(state: SjavsState): { score: number } | null {
  if (state.phase !== "done") return null;
  const [t0, t1] = state.teamScore;
  const total = t0 + t1;
  return { score: total > 0 ? Math.round((t0 / total) * 100) : 50 };
}
