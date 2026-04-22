import type { Card, Suit } from "../../engines/deck/index.js";
import { shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Tressette: 40-card Italian deck mapped to standard cards
// Ranks used: A(1), 2, 3, 4, 5, 6, 7, J(11), Q(12), K(13) — no 8, 9, 10
const TRES_RANKS = [1, 2, 3, 4, 5, 6, 7, 11, 12, 13] as const;
const SUITS: Suit[] = ["♣", "♠", "♥", "♦"];

export function tressetteDeck(): Card[] {
  const cards: Card[] = [];
  for (const s of SUITS) {
    for (const r of TRES_RANKS) {
      cards.push({ suit: s, rank: r as Card["rank"], id: `tr-${s}${r}` });
    }
  }
  return cards;
}

// Card ordering high→low: 3, 2, A, K, Q, J, 7, 6, 5, 4
export function tressetteStrength(rank: Card["rank"]): number {
  if (rank === 3) return 10;
  if (rank === 2) return 9;
  if (rank === 1) return 8; // Ace
  if (rank === 13) return 7; // K
  if (rank === 12) return 6; // Q
  if (rank === 11) return 5; // J
  if (rank === 7) return 4;
  if (rank === 6) return 3;
  if (rank === 5) return 2;
  return 1; // 4
}

// Point values: 3, 2, A = 1 point each; K, Q, J count together (1 pt per 3)
// We accumulate face cards per team and floor(count/3) is the bonus.
// For simplicity: Ace=1, 2=1, 3=1, K/Q/J=0 (bonus computed at end per team).
export function cardPoints(rank: Card["rank"]): number {
  if (rank === 1 || rank === 2 || rank === 3) return 1;
  return 0; // K, Q, J scored separately as face-card bonus
}

export function isFaceCard(rank: Card["rank"]): boolean {
  return rank === 11 || rank === 12 || rank === 13;
}

// No trump in Tressette — must follow suit
export function trickWinner(trick: readonly { seat: number; card: Card }[]): number {
  const ledSuit = trick[0]!.card.suit;
  return trick.reduce((best, cur) => {
    if (cur.card.suit !== ledSuit) return best;
    return tressetteStrength(cur.card.rank) > tressetteStrength(best.card.rank) ? cur : best;
  }).seat;
}

export type TressettePhase = "playing" | "done";

export interface TressetteState {
  rngSeed: number;
  hands: readonly (readonly Card[])[];  // 4 seats
  currentTrick: readonly { seat: number; card: Card }[];
  wonCards: readonly (readonly Card[])[];
  trickCount: number;
  currentLeader: number;
  phase: TressettePhase;
  message: string;
}

function botPlay(hand: readonly Card[], trick: readonly { seat: number; card: Card }[]): Card {
  if (trick.length === 0) {
    // Lead lowest-value card
    return [...hand].sort((a, b) => tressetteStrength(a.rank) - tressetteStrength(b.rank))[0]!;
  }
  const ledSuit = trick[0]!.card.suit;
  const follow = hand.filter(c => c.suit === ledSuit);
  if (follow.length > 0) {
    // Play highest if we can win, otherwise lowest
    const currentBest = trick.reduce((b, e) =>
      e.card.suit === ledSuit && tressetteStrength(e.card.rank) > tressetteStrength(b.card.rank) ? e : b
    );
    const canWin = follow.filter(c => tressetteStrength(c.rank) > tressetteStrength(currentBest.card.rank));
    if (canWin.length > 0) return canWin.sort((a, b) => tressetteStrength(a.rank) - tressetteStrength(b.rank))[0]!;
    return follow.sort((a, b) => tressetteStrength(a.rank) - tressetteStrength(b.rank))[0]!;
  }
  // Discard lowest
  return [...hand].sort((a, b) => tressetteStrength(a.rank) - tressetteStrength(b.rank))[0]!;
}

function computeScore(cards: readonly Card[]): number {
  const base = cards.reduce((s, c) => s + cardPoints(c.rank), 0);
  const faces = cards.filter(c => isFaceCard(c.rank)).length;
  return base + Math.floor(faces / 3);
}

function runBots(state: TressetteState): TressetteState {
  let s = state;
  while (s.phase === "playing") {
    const tLen = s.currentTrick.length;
    let nextSeat: number;
    if (tLen === 0) nextSeat = s.currentLeader;
    else nextSeat = (s.currentTrick[tLen - 1]!.seat + 1) % 4;

    if (nextSeat === 0) break;

    const hand = s.hands[nextSeat]!;
    if (hand.length === 0) break;

    const card = botPlay(hand, s.currentTrick);
    const newHands = s.hands.map((h, i) => i === nextSeat ? h.filter(c => c.id !== card.id) : h);
    const newTrick = [...s.currentTrick, { seat: nextSeat, card }];

    if (newTrick.length === 4) {
      const winner = trickWinner(newTrick);
      const newWon = s.wonCards.map((w, i) => i === winner ? [...w, ...newTrick.map(e => e.card)] : w);
      const done = newHands[0]!.length === 0;
      if (done) {
        const lastBonus = winner === 0 || winner === 2 ? 1 : 0; // last trick bonus
        const team02 = newWon[0]!.concat(newWon[2]!);
        const team13 = newWon[1]!.concat(newWon[3]!);
        const pts02 = computeScore(team02) + lastBonus;
        const pts13 = computeScore(team13) + (lastBonus === 0 ? 1 : 0);
        const youWin = pts02 > pts13;
        const msg = youWin
          ? `Your team wins! You+S3: ${pts02} pts, Opp: ${pts13} pts.`
          : `Opponents win. ${pts13}–${pts02}.`;
        s = { ...s, hands: newHands as readonly (readonly Card[])[], wonCards: newWon, currentTrick: [], phase: "done", message: msg };
        break;
      } else {
        s = {
          ...s, hands: newHands as readonly (readonly Card[])[],
          wonCards: newWon, currentTrick: [], currentLeader: winner, trickCount: s.trickCount + 1,
          message: winner === 0 ? "You won the trick!" : `Seat ${winner + 1} won the trick.`,
        };
      }
    } else {
      s = { ...s, hands: newHands as readonly (readonly Card[])[], currentTrick: newTrick };
    }
  }
  return s;
}

export type TressetteAction = { type: "play"; cardId: string };

export function reducer(state: TressetteState, action: TressetteAction): TressetteState {
  if (state.phase === "done") return state;
  if (action.type !== "play") return state;

  const hand = state.hands[0]!;
  const card = hand.find(c => c.id === action.cardId);
  if (!card) return state;

  // Must follow suit if possible
  const trick = state.currentTrick;
  if (trick.length > 0) {
    const ledSuit = trick[0]!.card.suit;
    const canFollow = hand.filter(c => c.suit === ledSuit);
    if (canFollow.length > 0 && card.suit !== ledSuit) return state;
  }

  const newHand = hand.filter(c => c.id !== card.id);
  const newHands = state.hands.map((h, i) => i === 0 ? newHand : h);
  const newTrick = [...trick, { seat: 0, card }];

  let s: TressetteState;
  if (newTrick.length === 4) {
    const winner = trickWinner(newTrick);
    const newWon = state.wonCards.map((w, i) => i === winner ? [...w, ...newTrick.map(e => e.card)] : w);
    if (newHand.length === 0) {
      const lastBonus = winner === 0 || winner === 2 ? 1 : 0;
      const team02 = newWon[0]!.concat(newWon[2]!);
      const team13 = newWon[1]!.concat(newWon[3]!);
      const pts02 = computeScore(team02) + lastBonus;
      const pts13 = computeScore(team13) + (lastBonus === 0 ? 1 : 0);
      const youWin = pts02 > pts13;
      const msg = youWin
        ? `Your team wins! You+S3: ${pts02} pts, Opp: ${pts13} pts.`
        : `Opponents win. ${pts13}–${pts02}.`;
      s = { ...state, hands: newHands as readonly (readonly Card[])[], wonCards: newWon, currentTrick: [], phase: "done", message: msg };
    } else {
      s = {
        ...state, hands: newHands as readonly (readonly Card[])[],
        wonCards: newWon, currentTrick: [], currentLeader: winner, trickCount: state.trickCount + 1,
        message: winner === 0 ? "You won the trick!" : `Seat ${winner + 1} won the trick.`,
      };
      s = runBots(s);
    }
  } else {
    s = { ...state, hands: newHands as readonly (readonly Card[])[], currentTrick: newTrick };
    s = runBots(s);
  }
  return s;
}

export function initialState(seed: number): TressetteState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const deck = shuffle(tressetteDeck(), mulberry32(nextSeed));

  return {
    rngSeed: Math.floor(mulberry32(nextSeed)() * 2 ** 31),
    hands: [deck.slice(0, 10), deck.slice(10, 20), deck.slice(20, 30), deck.slice(30, 40)],
    currentTrick: [],
    wonCards: [[], [], [], []],
    trickCount: 0,
    currentLeader: 0,
    phase: "playing",
    message: "Tressette — click a card to lead. You + S3 vs S2 + S4. No trump, must follow suit.",
  };
}

export function isTerminal(state: TressetteState): { score: number } | null {
  if (state.phase !== "done") return null;
  const { wonCards } = state;
  const team02 = wonCards[0]!.concat(wonCards[2]!);
  const team13 = wonCards[1]!.concat(wonCards[3]!);
  const pts02 = computeScore(team02);
  const pts13 = computeScore(team13);
  return { score: Math.max(0, Math.min(100, 50 + (pts02 - pts13) * 5)) };
}
