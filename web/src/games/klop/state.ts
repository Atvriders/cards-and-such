// Klop – Slovenian trick-taking game, 4 players, avoid taking tricks (misère-style)
import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface KlopSettings {
  botDifficulty: "easy" | "hard";
}

export type KlopPhase = "playing" | "done";

export interface KlopState {
  settings: KlopSettings;
  rngSeed: number;
  hands: readonly (readonly Card[])[];
  currentTrick: readonly { seat: number; card: Card }[];
  leadSeat: number;
  turn: number;
  phase: KlopPhase;
  tricksWon: readonly number[]; // per seat
  penalty: readonly number[];   // penalty points per seat
  score: readonly [number, number]; // [player, bots total]
  message: string;
}

export type KlopAction = { type: "play"; cardId: string };

const HAND_SIZE = 8;

function rankOrder(rank: Card["rank"]): number {
  return rank === 1 ? 14 : rank;
}

// No trump in Klop — highest of led suit wins
function trickWinner(trick: readonly { seat: number; card: Card }[]): number {
  const led = trick[0]!.card.suit;
  return trick.reduce((best, cur) => {
    if (cur.card.suit !== led) return best;
    return rankOrder(cur.card.rank) > rankOrder(best.card.rank) ? cur : best;
  }).seat;
}

export function legalPlays(state: KlopState, seat: number): Card[] {
  const hand = [...(state.hands[seat] ?? [])];
  if (state.currentTrick.length === 0) return hand;
  const ledSuit = state.currentTrick[0]!.card.suit;
  const followers = hand.filter(c => c.suit === ledSuit);
  return followers.length > 0 ? followers : hand;
}

function botPlay(state: KlopState, seat: number): Card {
  const legal = legalPlays(state, seat);
  if (legal.length === 1) return legal[0]!;
  const trick = state.currentTrick;

  if (trick.length === 0) {
    // Lead lowest card to avoid winning
    return legal.reduce((lo, c) => rankOrder(c.rank) < rankOrder(lo.rank) ? c : lo);
  }
  const led = trick[0]!.card.suit;
  const currentBest = trick.filter(t => t.card.suit === led).reduce((b, cur) =>
    rankOrder(cur.card.rank) > rankOrder(b.card.rank) ? cur : b
  );
  // Try to play under the winning card (avoid winning)
  const underCards = legal.filter(c => c.suit === led && rankOrder(c.rank) < rankOrder(currentBest.card.rank));
  if (underCards.length > 0) {
    return underCards.reduce((hi, c) => rankOrder(c.rank) > rankOrder(hi.rank) ? c : hi); // highest under
  }
  // Can't beat without winning, discard highest off-suit or lowest
  const offSuit = legal.filter(c => c.suit !== led);
  if (offSuit.length > 0) return offSuit.reduce((hi, c) => rankOrder(c.rank) > rankOrder(hi.rank) ? c : hi);
  // Must win — play lowest
  return legal.reduce((lo, c) => rankOrder(c.rank) < rankOrder(lo.rank) ? c : lo);
}

function applyPlay(state: KlopState, seat: number, card: Card): KlopState {
  const newHands = state.hands.map((h, i) => i === seat ? h.filter(c => c.id !== card.id) : h);
  const newTrick = [...state.currentTrick, { seat, card }];
  let s: KlopState = { ...state, hands: newHands, currentTrick: newTrick };

  if (newTrick.length === 4) {
    const winner = trickWinner(newTrick);
    const newTricksWon = state.tricksWon.map((t, i) => i === winner ? t + 1 : t);
    s = { ...s, currentTrick: [], tricksWon: newTricksWon, leadSeat: winner, turn: winner };

    if (newHands[0]!.length === 0) {
      // Penalty: 1 pt per trick won; if all 8 tricks taken by one player = Klop = 0 pts (others get 8)
      let newPenalty = [...state.penalty];
      let allByOne = -1;
      for (let i = 0; i < 4; i++) {
        if (newTricksWon[i]! === HAND_SIZE) { allByOne = i; break; }
      }
      if (allByOne !== -1) {
        for (let i = 0; i < 4; i++) {
          if (i !== allByOne) newPenalty[i] = (newPenalty[i] ?? 0) + 8;
        }
      } else {
        for (let i = 0; i < 4; i++) {
          newPenalty[i] = (newPenalty[i] ?? 0) + (newTricksWon[i] ?? 0);
        }
      }
      const playerPen = newPenalty[0]!;
      const botPen = newPenalty[1]! + newPenalty[2]! + newPenalty[3]!;
      s = {
        ...s,
        penalty: newPenalty,
        score: [state.score[0] - playerPen, state.score[1] - botPen],
        phase: "done",
        message: `You took ${newTricksWon[0]} tricks (−${newPenalty[0]} pts). ${playerPen < botPen / 3 ? "You did well!" : "Avoid tricks next time!"}`,
      };
    }
  } else {
    s = { ...s, turn: (seat + 1) % 4 };
  }
  return s;
}

export function reducer(state: KlopState, action: KlopAction): KlopState {
  if (state.phase === "done") return state;
  if (action.type !== "play") return state;
  if (state.turn !== 0) return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const card = state.hands[0]!.find(c => c.id === action.cardId);
  if (!card) return state;
  if (!legalPlays(state, 0).some(c => c.id === card.id)) return state;

  let s: KlopState = { ...state, rngSeed: nextSeed };
  s = applyPlay(s, 0, card);
  while (s.phase === "playing" && s.turn !== 0) {
    const botCard = botPlay(s, s.turn);
    s = applyPlay(s, s.turn, botCard);
  }
  return s;
}

export function initialState(seed: number, settings: KlopSettings): KlopState {
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
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "playing",
    tricksWon: [0, 0, 0, 0],
    penalty: [0, 0, 0, 0],
    score: [0, 0],
    message: "Avoid winning tricks! No trump — highest led suit card wins.",
  };
}

export function isTerminal(state: KlopState): { score: number } | null {
  if (state.phase !== "done") return null;
  // Lower penalty = better; invert scoring
  const playerPen = state.penalty[0] ?? 0;
  return { score: Math.max(0, Math.min(100, 100 - playerPen * 10)) };
}
