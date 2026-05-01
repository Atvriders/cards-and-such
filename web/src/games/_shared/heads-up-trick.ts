// Generic heads-up (player vs CPU) trick-taking template.
// Used by many simple trick-taking variants. Returns reducer/initialState.
import type { Card, Suit, Rank } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import {
  buildDeck, defaultRankOrder, dealHands, shuffleDeck,
  legalPlays, trickWinner, cpuPlayCard,
} from "./trick-engine.js";

export interface HuTrickConfig {
  ranks: readonly Rank[];      // ranks in deck
  copies?: number;             // 1 default, 2 for pinochle
  perHand: number;             // cards per hand
  hasTrump: boolean;           // if true, last stock card or top card sets trump
  trumpFromStock?: boolean;    // if true, top of stock becomes trump
  fixedTrump?: Suit | null;    // optional preset trump
  rankOrder?: (r: Rank) => number;
  pointsPerTrick?: number;     // simple scoring
  cardPoints?: (c: Card) => number; // card-based points (briscola)
}

export interface HuTrickState {
  rngSeed: number;
  hands: readonly (readonly Card[])[];   // [you, cpu]
  stock: readonly Card[];
  trump: Suit | null;
  trick: readonly { seat: number; card: Card }[];
  leadSeat: number;
  turn: number;
  phase: "playing" | "done";
  score: readonly [number, number];      // points [you, cpu]
  tricksWon: readonly [number, number];  // tricks [you, cpu]
  message: string;
}

export type HuTrickAction = { type: "play"; cardId: string };

export function makeHuTrick(cfg: HuTrickConfig) {
  const rankOrder = cfg.rankOrder ?? defaultRankOrder;
  const cardPoints = cfg.cardPoints;
  const pointsPerTrick = cfg.pointsPerTrick ?? 1;

  function initialState(seed: number): HuTrickState {
    const rng = mulberry32(seed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const dealRng = mulberry32(nextSeed);
    const deck = shuffleDeck(buildDeck({ ranks: cfg.ranks, copies: cfg.copies ?? 1 }, "hu"), dealRng);
    const { hands, stock } = dealHands(deck, 2, cfg.perHand);
    let trump: Suit | null = cfg.fixedTrump ?? null;
    let stockArr = [...stock];
    if (cfg.hasTrump && cfg.trumpFromStock && stockArr.length > 0) {
      trump = stockArr[stockArr.length - 1]!.suit;
    }
    return {
      rngSeed: Math.floor(dealRng() * 2 ** 31),
      hands,
      stock: stockArr,
      trump,
      trick: [],
      leadSeat: 0,
      turn: 0,
      phase: "playing",
      score: [0, 0],
      tricksWon: [0, 0],
      message: trump ? `Trump: ${trump}` : `No trump`,
    };
  }

  function reducer(state: HuTrickState, action: HuTrickAction): HuTrickState {
    if (state.phase !== "playing") return state;
    if (action.type !== "play") return state;
    if (state.turn !== 0) return state;

    const card = state.hands[0]!.find(c => c.id === action.cardId);
    if (!card) return state;
    const legal = legalPlays(state.hands[0]!, state.trick);
    if (!legal.some(c => c.id === card.id)) return state;

    let s = applyPlay(state, 0, card);
    while (s.phase === "playing" && s.turn !== 0) {
      const cpuCard = cpuPlayCard(s.hands[1]!, s.trick, s.trump, 1, null, rankOrder);
      s = applyPlay(s, 1, cpuCard);
    }
    return s;
  }

  function applyPlay(state: HuTrickState, seat: number, card: Card): HuTrickState {
    const newHands = state.hands.map((h, i) => i === seat ? h.filter(c => c.id !== card.id) : h);
    const newTrick = [...state.trick, { seat, card }];

    let s: HuTrickState = { ...state, hands: newHands, trick: newTrick };
    if (newTrick.length < 2) {
      return { ...s, turn: (seat + 1) % 2 };
    }

    // Trick complete
    const winner = trickWinner(newTrick, s.trump, rankOrder);
    let pts = pointsPerTrick;
    if (cardPoints) {
      pts = newTrick.reduce((acc, t) => acc + cardPoints(t.card), 0);
    }
    const score: [number, number] = [s.score[0], s.score[1]];
    score[winner as 0 | 1] += pts;
    const tricksWon: [number, number] = [s.tricksWon[0], s.tricksWon[1]];
    tricksWon[winner as 0 | 1]++;

    // Refill from stock if available
    let stock = [...s.stock];
    let hands = s.hands.map(h => [...h]);
    if (stock.length >= 2) {
      // Winner draws first
      hands[winner]!.push(stock.shift()!);
      const other = (winner + 1) % 2;
      hands[other]!.push(stock.shift()!);
    }

    s = {
      ...s,
      hands,
      stock,
      trick: [],
      score,
      tricksWon,
      leadSeat: winner,
      turn: winner,
      message: winner === 0 ? "You won the trick!" : "CPU won the trick.",
    };

    // Check end
    if (s.hands.every(h => h.length === 0)) {
      s = { ...s, phase: "done", message: s.score[0] > s.score[1]
        ? `You win ${s.score[0]} - ${s.score[1]}!`
        : s.score[0] === s.score[1]
        ? `Tie ${s.score[0]}-${s.score[1]}`
        : `CPU wins ${s.score[1]}-${s.score[0]}`
      };
    }
    return s;
  }

  function isTerminal(state: HuTrickState): { score: number } | null {
    if (state.phase !== "done") return null;
    const diff = state.score[0] - state.score[1];
    return { score: Math.max(0, Math.min(100, 50 + diff * 2)) };
  }

  return { initialState, reducer, isTerminal };
}
