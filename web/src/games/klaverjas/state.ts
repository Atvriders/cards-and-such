import type { Card, Suit } from "../../engines/deck/index.js";
import { shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// 32-card deck: 7-A of 4 suits
const KLV_RANKS = [7, 8, 9, 10, 11, 12, 13, 1] as const;
const SUITS: Suit[] = ["♣", "♠", "♥", "♦"];

export function klaverjasDeck(): Card[] {
  const cards: Card[] = [];
  for (const s of SUITS) {
    for (const r of KLV_RANKS) {
      cards.push({ suit: s, rank: r as Card["rank"], id: `kl-${s}${r}` });
    }
  }
  return cards;
}

// Card value: trump suit has special values for J and 9
export function cardValue(rank: Card["rank"], isTrumpSuit: boolean): number {
  if (isTrumpSuit) {
    if (rank === 11) return 20;  // Jass (trump jack)
    if (rank === 9) return 14;   // Menel (trump 9)
    if (rank === 1) return 11;   // Ace
    if (rank === 10) return 10;
    if (rank === 13) return 4;
    if (rank === 12) return 3;
    return 0;
  }
  // Off-suit
  if (rank === 1) return 11;
  if (rank === 10) return 10;
  if (rank === 13) return 4;
  if (rank === 12) return 3;
  if (rank === 11) return 2;
  return 0;
}

export function trumpStrength(rank: Card["rank"]): number {
  // Trump ordering: J(20)>9(14)>A(11)>10(10)>K(4)>Q(3)>8>7
  if (rank === 11) return 8;
  if (rank === 9) return 7;
  if (rank === 1) return 6;
  if (rank === 10) return 5;
  if (rank === 13) return 4;
  if (rank === 12) return 3;
  if (rank === 8) return 2;
  return 1; // 7
}

export function offStrength(rank: Card["rank"]): number {
  // A>10>K>Q>J>9>8>7
  if (rank === 1) return 8;
  if (rank === 10) return 7;
  if (rank === 13) return 6;
  if (rank === 12) return 5;
  if (rank === 11) return 4;
  if (rank === 9) return 3;
  if (rank === 8) return 2;
  return 1;
}

export function isTrump(card: Card, trumpSuit: Suit): boolean {
  return card.suit === trumpSuit;
}

export function trickWinner(
  trick: readonly { seat: number; card: Card }[],
  trumpSuit: Suit
): number {
  const ledCard = trick[0]!.card;
  const ledIsTrump = isTrump(ledCard, trumpSuit);
  const ledSuit = ledCard.suit;

  return trick.reduce((best, cur) => {
    const b = best.card;
    const c = cur.card;
    const bTr = isTrump(b, trumpSuit);
    const cTr = isTrump(c, trumpSuit);

    if (bTr && cTr) return trumpStrength(c.rank) > trumpStrength(b.rank) ? cur : best;
    if (cTr && !bTr) return cur;
    if (bTr && !cTr) return best;
    // Neither trump
    if (!ledIsTrump) {
      if (c.suit === ledSuit && b.suit !== ledSuit) return cur;
      if (b.suit === ledSuit && c.suit !== ledSuit) return best;
      if (c.suit === ledSuit && b.suit === ledSuit) return offStrength(c.rank) > offStrength(b.rank) ? cur : best;
    }
    return best;
  }).seat;
}

export type KlaverjasPhase = "playing" | "done";

export interface KlaverjasState {
  rngSeed: number;
  hands: readonly (readonly Card[])[];  // seats 0,1,2,3
  trumpSuit: Suit;
  trumpCard: Card;
  currentTrick: readonly { seat: number; card: Card }[];
  wonCards: readonly (readonly Card[])[];  // per seat
  trickCount: number;
  currentLeader: number;
  phase: KlaverjasPhase;
  message: string;
  // Partnership: 0+2 vs 1+3
}

function botPlay(hand: readonly Card[], trick: readonly { seat: number; card: Card }[], trumpSuit: Suit): Card {
  if (trick.length === 0) {
    const trumps = hand.filter(c => isTrump(c, trumpSuit));
    if (trumps.length >= 3) {
      return trumps.reduce((hi, c) => trumpStrength(c.rank) > trumpStrength(hi.rank) ? c : hi);
    }
    const nonTrump = hand.filter(c => !isTrump(c, trumpSuit));
    const pool = nonTrump.length > 0 ? nonTrump : [...hand];
    return pool.reduce((lo, c) => cardValue(c.rank, false) < cardValue(lo.rank, false) ? c : lo);
  }
  const ledCard = trick[0]!.card;
  const ledIsTrump = isTrump(ledCard, trumpSuit);
  const followCards = hand.filter(c =>
    ledIsTrump ? isTrump(c, trumpSuit) : (!isTrump(c, trumpSuit) && c.suit === ledCard.suit)
  );
  const pool = followCards.length > 0 ? followCards : [...hand];
  return pool.reduce((lo, c) => cardValue(c.rank, isTrump(lo, trumpSuit)) < cardValue(lo.rank, isTrump(lo, trumpSuit)) ? c : lo);
}

function runBots(state: KlaverjasState): KlaverjasState {
  let s = state;
  while (s.phase === "playing") {
    const trickLen = s.currentTrick.length;
    let nextSeat: number;
    if (trickLen === 0) nextSeat = s.currentLeader;
    else nextSeat = (s.currentTrick[trickLen - 1]!.seat + 1) % 4;

    if (nextSeat === 0) break;

    const hand = s.hands[nextSeat]!;
    if (hand.length === 0) break;
    const card = botPlay(hand, s.currentTrick, s.trumpSuit);
    const newHands = s.hands.map((h, i) => i === nextSeat ? h.filter(c => c.id !== card.id) : h);
    const newTrick = [...s.currentTrick, { seat: nextSeat, card }];

    if (newTrick.length === 4) {
      const winner = trickWinner(newTrick, s.trumpSuit);
      const newWon = s.wonCards.map((w, i) => i === winner ? [...w, ...newTrick.map(e => e.card)] : [...w]) as readonly (readonly Card[])[];
      const done = newHands[0]!.length === 0;
      if (done) {
        // Score: partnership 0+2 vs 1+3
        const pts02 = [...newWon[0]!, ...newWon[2]!].reduce((sum, c) => sum + cardValue(c.rank, isTrump(c, s.trumpSuit)), 0);
        const pts13 = [...newWon[1]!, ...newWon[3]!].reduce((sum, c) => sum + cardValue(c.rank, isTrump(c, s.trumpSuit)), 0);
        const lastBonus = winner % 2 === 0 ? 10 : 0; // last trick bonus
        const you = pts02 + lastBonus;
        const opp = pts13 + (winner % 2 !== 0 ? 10 : 0);
        const msg = you > opp ? `You win! Your team ${you} — Opponents ${opp}.` : `Opponents win. ${opp} — Your team ${you}.`;
        s = { ...s, hands: newHands as readonly (readonly Card[])[], wonCards: newWon as unknown as readonly (readonly Card[])[], currentTrick: [], phase: "done", message: msg };
        break;
      } else {
        s = {
          ...s, hands: newHands as readonly (readonly Card[])[],
          wonCards: newWon as unknown as readonly (readonly Card[])[], currentTrick: [], currentLeader: winner, trickCount: s.trickCount + 1,
          message: winner === 0 ? "You won the trick!" : `Seat ${winner + 1} won the trick.`,
        };
      }
    } else {
      s = { ...s, hands: newHands as readonly (readonly Card[])[], currentTrick: newTrick };
    }
  }
  return s;
}

export function reducer(state: KlaverjasState, action: KlaverjasAction): KlaverjasState {
  if (state.phase === "done") return state;
  if (action.type !== "play") return state;

  const hand = state.hands[0]!;
  const card = hand.find(c => c.id === action.cardId);
  if (!card) return state;

  // Follow suit validation
  const trick = state.currentTrick;
  if (trick.length > 0) {
    const ledCard = trick[0]!.card;
    const ledIsTrump = isTrump(ledCard, state.trumpSuit);
    const mustFollow = hand.filter(c =>
      ledIsTrump ? isTrump(c, state.trumpSuit) : (!isTrump(c, state.trumpSuit) && c.suit === ledCard.suit)
    );
    if (mustFollow.length > 0 && !mustFollow.find(c => c.id === card.id)) return state;
  }

  const newHand = hand.filter(c => c.id !== card.id);
  const newHands = state.hands.map((h, i) => i === 0 ? newHand : h);
  const newTrick = [...trick, { seat: 0, card }];

  let s: KlaverjasState;
  if (newTrick.length === 4) {
    const winner = trickWinner(newTrick, state.trumpSuit);
    const newWon = state.wonCards.map((w, i) => i === winner ? [...w, ...newTrick.map(e => e.card)] : [...w]) as readonly (readonly Card[])[];
    const done = newHand.length === 0;
    if (done) {
      const pts02 = [...newWon[0]!, ...newWon[2]!].reduce((sum, c) => sum + cardValue(c.rank, isTrump(c, state.trumpSuit)), 0);
      const pts13 = [...newWon[1]!, ...newWon[3]!].reduce((sum, c) => sum + cardValue(c.rank, isTrump(c, state.trumpSuit)), 0);
      const lastBonus = winner % 2 === 0 ? 10 : 0;
      const you = pts02 + lastBonus;
      const opp = pts13 + (winner % 2 !== 0 ? 10 : 0);
      const msg = you > opp ? `You win! Your team ${you} — Opponents ${opp}.` : `Opponents win. ${opp} — Your team ${you}.`;
      s = { ...state, hands: newHands as readonly (readonly Card[])[], wonCards: newWon as unknown as readonly (readonly Card[])[], currentTrick: [], phase: "done", message: msg };
    } else {
      s = {
        ...state, hands: newHands as readonly (readonly Card[])[],
        wonCards: newWon as unknown as readonly (readonly Card[])[], currentTrick: [], currentLeader: winner, trickCount: state.trickCount + 1,
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

export type KlaverjasAction = { type: "play"; cardId: string };

export function initialState(seed: number): KlaverjasState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const deck = shuffle(klaverjasDeck(), mulberry32(nextSeed));

  const hand0 = deck.slice(0, 8);
  const hand1 = deck.slice(8, 16);
  const hand2 = deck.slice(16, 24);
  const hand3 = deck.slice(24, 32);
  const trumpCard = deck[8]!; // first card dealt to seat 1 determines trump

  return {
    rngSeed: Math.floor(mulberry32(nextSeed)() * 2 ** 31),
    hands: [hand0, hand1, hand2, hand3],
    trumpSuit: trumpCard.suit,
    trumpCard,
    currentTrick: [],
    wonCards: [[], [], [], []],
    trickCount: 0,
    currentLeader: 0,
    phase: "playing",
    message: `Trump: ${trumpCard.suit} (turned up from first card to seat 2). Your lead! You + Seat 3 vs Seats 2 & 4.`,
  };
}

export function isTerminal(state: KlaverjasState): { score: number } | null {
  if (state.phase !== "done") return null;
  const { wonCards, trumpSuit } = state;
  const pts02 = [...wonCards[0]!, ...wonCards[2]!].reduce((sum, c) => sum + cardValue(c.rank, isTrump(c, trumpSuit)), 0);
  const pts13 = [...wonCards[1]!, ...wonCards[3]!].reduce((sum, c) => sum + cardValue(c.rank, isTrump(c, trumpSuit)), 0);
  return { score: Math.max(0, Math.min(100, 50 + (pts02 - pts13))) };
}
