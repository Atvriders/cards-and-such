// Hokm – Persian trick-taking game, 4 players (2 teams), trump chosen by Hakem
import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface HokmSettings {
  botDifficulty: "easy" | "hard";
}

export type HokmPhase = "chooseTrump" | "playing" | "done";

export interface HokmState {
  settings: HokmSettings;
  rngSeed: number;
  hands: readonly (readonly Card[])[];
  trumpSuit: Suit | null;
  hakem: number; // seat that chooses trump (wins first 5 cards)
  currentTrick: readonly { seat: number; card: Card }[];
  leadSeat: number;
  turn: number;
  phase: HokmPhase;
  tricks: readonly number[]; // per seat
  teamTricks: readonly [number, number]; // [team0(0+2), team1(1+3)]
  teamScore: readonly [number, number];
  message: string;
}

export type HokmAction =
  | { type: "chooseTrump"; suit: Suit }
  | { type: "play"; cardId: string };

const HAND_SIZE = 13;

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

export function legalPlays(state: HokmState, seat: number): Card[] {
  const hand = [...(state.hands[seat] ?? [])];
  if (state.currentTrick.length === 0) return hand;
  const ledSuit = state.currentTrick[0]!.card.suit;
  const followers = hand.filter(c => c.suit === ledSuit);
  return followers.length > 0 ? followers : hand;
}

function botPlay(state: HokmState, seat: number): Card {
  const legal = legalPlays(state, seat);
  if (legal.length === 1) return legal[0]!;
  const trump = state.trumpSuit!;
  const trick = state.currentTrick;
  const teamMate = (seat + 2) % 4;

  if (trick.length === 0) {
    const trumpCards = legal.filter(c => c.suit === trump).sort((a, b) => rankOrder(b.rank) - rankOrder(a.rank));
    if (trumpCards.length > 0 && trumpCards[0]!.rank === 1) return trumpCards[0]!;
    return legal.reduce((hi, c) => rankOrder(c.rank) > rankOrder(hi.rank) ? c : hi);
  }
  const led = trick[0]!.card.suit;
  const best = trick.reduce((b, cur) =>
    cardStrength(cur.card, trump, led) > cardStrength(b.card, trump, led) ? cur : b
  );
  // If teammate is winning, play low
  if (best.seat === teamMate) {
    return legal.reduce((lo, c) => cardStrength(c, trump, led) < cardStrength(lo, trump, led) ? c : lo);
  }
  const winCards = legal.filter(c => cardStrength(c, trump, led) > cardStrength(best.card, trump, led));
  if (winCards.length > 0) return winCards.reduce((lo, c) => cardStrength(c, trump, led) < cardStrength(lo, trump, led) ? c : lo);
  return legal.reduce((lo, c) => cardStrength(c, trump, led) < cardStrength(lo, trump, led) ? c : lo);
}

function applyPlay(state: HokmState, seat: number, card: Card): HokmState {
  const trump = state.trumpSuit!;
  const newHands = state.hands.map((h, i) => i === seat ? h.filter(c => c.id !== card.id) : h);
  const newTrick = [...state.currentTrick, { seat, card }];
  let s: HokmState = { ...state, hands: newHands, currentTrick: newTrick };

  if (newTrick.length === 4) {
    const winner = trickWinner(newTrick, trump);
    const newTricks = state.tricks.map((t, i) => i === winner ? t + 1 : t);
    const team0 = newTricks[0]! + newTricks[2]!;
    const team1 = newTricks[1]! + newTricks[3]!;
    s = { ...s, currentTrick: [], tricks: newTricks, teamTricks: [team0, team1], leadSeat: winner, turn: winner };

    if (newHands[0]!.length === 0) {
      const won0 = team0 >= 7;
      const delta = won0 ? 1 : -1;
      s = {
        ...s,
        teamScore: [state.teamScore[0] + (won0 ? 1 : 0), state.teamScore[1] + (won0 ? 0 : 1)],
        phase: "done",
        message: `Team 0: ${team0} tricks | Team 1: ${team1} tricks. ${won0 ? "Your team wins!" : "Bot team wins!"}`,
      };
      void delta;
    }
  } else {
    s = { ...s, turn: (seat + 1) % 4 };
  }
  return s;
}

export function reducer(state: HokmState, action: HokmAction): HokmState {
  if (state.phase === "done") return state;
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  if (state.phase === "chooseTrump" && action.type === "chooseTrump") {
    if (state.hakem !== 0) return state;
    return {
      ...state, rngSeed: nextSeed,
      trumpSuit: action.suit,
      phase: "playing",
      turn: state.hakem,
      leadSeat: state.hakem,
      message: `Trump: ${action.suit}. Hakem leads first.`,
    };
  }

  if (state.phase === "playing" && action.type === "play") {
    if (state.turn !== 0) return state;
    const card = state.hands[0]!.find(c => c.id === action.cardId);
    if (!card) return state;
    if (!legalPlays(state, 0).some(c => c.id === card.id)) return state;

    let s: HokmState = { ...state, rngSeed: nextSeed };
    s = applyPlay(s, 0, card);
    while (s.phase === "playing" && s.turn !== 0) {
      const botCard = botPlay(s, s.turn);
      s = applyPlay(s, s.turn, botCard);
    }
    return s;
  }
  return state;
}

export function initialState(seed: number, settings: HokmSettings): HokmState {
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
  // Hakem = player 0 for simplicity
  const hakem = 0;
  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    hands,
    trumpSuit: null,
    hakem,
    currentTrick: [],
    leadSeat: hakem,
    turn: hakem,
    phase: "chooseTrump",
    tricks: [0, 0, 0, 0],
    teamTricks: [0, 0],
    teamScore: [0, 0],
    message: "You are Hakem. Choose the trump suit.",
  };
}

export function isTerminal(state: HokmState): { score: number } | null {
  if (state.phase !== "done") return null;
  const [t0, t1] = state.teamScore;
  const total = t0 + t1;
  return { score: total > 0 ? Math.round((t0 / total) * 100) : 50 };
}
