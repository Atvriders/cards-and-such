import type { Card, Suit } from "../../engines/deck/index.js";
import { shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// 48-card double deck: A,K,Q,J,10,9 of 4 suits x2
const DK_RANKS = [1, 13, 12, 11, 10, 9] as const;
const SUITS: Suit[] = ["♣", "♠", "♥", "♦"];

export function doppelkopfDeck(): Card[] {
  const cards: Card[] = [];
  for (let copy = 0; copy < 2; copy++) {
    for (const s of SUITS) {
      for (const r of DK_RANKS) {
        cards.push({ suit: s, rank: r as Card["rank"], id: `dk-${copy}-${s}${r}` });
      }
    }
  }
  return cards;
}

export function cardValue(rank: Card["rank"]): number {
  if (rank === 1) return 11;
  if (rank === 10) return 10;
  if (rank === 13) return 4;
  if (rank === 12) return 3;
  if (rank === 11) return 2;
  return 0; // 9
}

// Trump: Q♣,Q♠,Q♥,Q♦,J♣,J♠,J♥,J♦,10♥,A♦,10♦,K♦,9♦
export function isTrump(card: Card): boolean {
  if (card.rank === 12) return true; // all Queens
  if (card.rank === 11) return true; // all Jacks
  if (card.suit === "♥" && card.rank === 10) return true; // 10 of hearts
  if (card.suit === "♦") return true; // all diamonds
  return false;
}

export function trumpOrder(card: Card): number {
  if (card.rank === 12) {
    if (card.suit === "♣") return 13;
    if (card.suit === "♠") return 12;
    if (card.suit === "♥") return 11;
    if (card.suit === "♦") return 10;
  }
  if (card.rank === 11) {
    if (card.suit === "♣") return 9;
    if (card.suit === "♠") return 8;
    if (card.suit === "♥") return 7;
    if (card.suit === "♦") return 6;
  }
  if (card.suit === "♥" && card.rank === 10) return 5;
  if (card.suit === "♦") {
    if (card.rank === 1) return 4;
    if (card.rank === 10) return 3;
    if (card.rank === 13) return 2;
    return 1; // 9♦
  }
  return 0;
}

export function offStrength(rank: Card["rank"]): number {
  if (rank === 1) return 5;
  if (rank === 10) return 4;
  if (rank === 13) return 3;
  if (rank === 9) return 1;
  return 0;
}

export function trickWinner(
  trick: readonly { seat: number; card: Card }[],
  _unused?: unknown
): number {
  const ledCard = trick[0]!.card;
  const ledTr = isTrump(ledCard);
  const ledSuit = ledCard.suit;

  return trick.reduce((best, cur) => {
    const b = best.card;
    const c = cur.card;
    const bTr = isTrump(b);
    const cTr = isTrump(c);

    if (bTr && cTr) return trumpOrder(c) > trumpOrder(b) ? cur : best;
    if (cTr && !bTr) return cur;
    if (bTr && !cTr) return best;
    // Neither trump — compare by led suit
    const bLed = !ledTr && b.suit === ledSuit;
    const cLed = !ledTr && c.suit === ledSuit;
    if (bLed && !cLed) return best;
    if (cLed && !bLed) return cur;
    if (bLed && cLed) return offStrength(c.rank) > offStrength(b.rank) ? cur : best;
    return best;
  }).seat;
}

// Partnerships: whoever has Q♣ is on the "Re" team (max 2 players)
function isQueenOfClubs(card: Card): boolean {
  return card.rank === 12 && card.suit === "♣";
}

export type DKPhase = "playing" | "done";

export interface DoppelkopfState {
  rngSeed: number;
  hands: readonly (readonly Card[])[];   // 4 seats
  trump: "doppelkopf";
  currentTrick: readonly { seat: number; card: Card }[];
  wonCards: readonly (readonly Card[])[];  // per seat
  teams: readonly number[][];  // [re seats, kontra seats]
  trickCount: number;
  currentLeader: number;
  phase: DKPhase;
  message: string;
}

function botPlay(hand: readonly Card[], trick: readonly { seat: number; card: Card }[], teamMates: number[], seat: number): Card {
  const isAlly = (s: number) => teamMates.includes(s);
  if (trick.length === 0) {
    const trumpCards = hand.filter(isTrump);
    if (trumpCards.length >= 4) {
      return trumpCards.reduce((hi, c) => trumpOrder(c) > trumpOrder(hi) ? c : hi);
    }
    const nonTr = hand.filter(c => !isTrump(c));
    const pool = nonTr.length > 0 ? nonTr : [...hand];
    return pool.reduce((lo, c) => cardValue(c.rank) < cardValue(lo.rank) ? c : lo);
  }
  const ledCard = trick[0]!.card;
  const ledTr = isTrump(ledCard);
  const followCards = hand.filter(c =>
    ledTr ? isTrump(c) : (!isTrump(c) && c.suit === ledCard.suit)
  );

  // Check if an ally is currently winning
  const curWinner = trickWinner(trick);
  const allyWinning = trick.find(e => e.seat === curWinner) && isAlly(curWinner);

  const pool = followCards.length > 0 ? followCards : [...hand];
  if (allyWinning) {
    // Dump high value cards to ally
    return pool.reduce((hi, c) => cardValue(c.rank) > cardValue(hi.rank) ? c : hi);
  }
  return pool.reduce((lo, c) => cardValue(c.rank) < cardValue(lo.rank) ? c : lo);
}

function runBots(state: DoppelkopfState): DoppelkopfState {
  let s = state;
  while (s.phase === "playing") {
    const tLen = s.currentTrick.length;
    let nextSeat: number;
    if (tLen === 0) nextSeat = s.currentLeader;
    else nextSeat = (s.currentTrick[tLen - 1]!.seat + 1) % 4;

    if (nextSeat === 0) break;

    const hand = s.hands[nextSeat]!;
    if (hand.length === 0) break;
    // Find this seat's team mates
    const myTeam = s.teams.find(t => t.includes(nextSeat)) ?? [];
    const teamMates = myTeam.filter(x => x !== nextSeat);
    const card = botPlay(hand, s.currentTrick, teamMates, nextSeat);
    const newHands = s.hands.map((h, i) => i === nextSeat ? h.filter(c => c.id !== card.id) : h);
    const newTrick = [...s.currentTrick, { seat: nextSeat, card }];

    if (newTrick.length === 4) {
      const winner = trickWinner(newTrick);
      const newWon = s.wonCards.map((w, i) => i === winner ? [...w, ...newTrick.map(e => e.card)] : w);
      const done = newHands[0]!.length === 0;
      if (done) {
        const rePts = s.teams[0]!.reduce((sum, seat) => sum + newWon[seat]!.reduce((a, c) => a + cardValue(c.rank), 0), 0);
        const kontraPts = s.teams[1]!.reduce((sum, seat) => sum + newWon[seat]!.reduce((a, c) => a + cardValue(c.rank), 0), 0);
        const playerTeam = s.teams[0]!.includes(0) ? "Re" : "Kontra";
        const playerPts = playerTeam === "Re" ? rePts : kontraPts;
        const oppPts = playerTeam === "Re" ? kontraPts : rePts;
        const wins = playerPts >= 121;
        const msg = wins ? `Your team (${playerTeam}) wins! ${playerPts}–${oppPts}.` : `Opponents win. ${oppPts}–${playerPts}.`;
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

export type DKAction = { type: "play"; cardId: string };

export function reducer(state: DoppelkopfState, action: DKAction): DoppelkopfState {
  if (state.phase === "done") return state;
  if (action.type !== "play") return state;

  const hand = state.hands[0]!;
  const card = hand.find(c => c.id === action.cardId);
  if (!card) return state;

  // Follow suit
  const trick = state.currentTrick;
  if (trick.length > 0) {
    const ledCard = trick[0]!.card;
    const ledTr = isTrump(ledCard);
    const mustFollow = hand.filter(c =>
      ledTr ? isTrump(c) : (!isTrump(c) && c.suit === ledCard.suit)
    );
    if (mustFollow.length > 0 && !mustFollow.find(c => c.id === card.id)) return state;
  }

  const newHand = hand.filter(c => c.id !== card.id);
  const newHands = state.hands.map((h, i) => i === 0 ? newHand : h);
  const newTrick = [...trick, { seat: 0, card }];

  let s: DoppelkopfState;
  if (newTrick.length === 4) {
    const winner = trickWinner(newTrick);
    const newWon = state.wonCards.map((w, i) => i === winner ? [...w, ...newTrick.map(e => e.card)] : w);
    const done = newHand.length === 0;
    if (done) {
      const rePts = state.teams[0]!.reduce((sum, seat) => sum + newWon[seat]!.reduce((a, c) => a + cardValue(c.rank), 0), 0);
      const kontraPts = state.teams[1]!.reduce((sum, seat) => sum + newWon[seat]!.reduce((a, c) => a + cardValue(c.rank), 0), 0);
      const playerTeam = state.teams[0]!.includes(0) ? "Re" : "Kontra";
      const playerPts = playerTeam === "Re" ? rePts : kontraPts;
      const oppPts = playerTeam === "Re" ? kontraPts : rePts;
      const wins = playerPts >= 121;
      const msg = wins ? `Your team (${playerTeam}) wins! ${playerPts}–${oppPts}.` : `Opponents win. ${oppPts}–${playerPts}.`;
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

export function initialState(seed: number): DoppelkopfState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const deck = shuffle(doppelkopfDeck(), mulberry32(nextSeed));

  const hand0 = deck.slice(0, 12);
  const hand1 = deck.slice(12, 24);
  const hand2 = deck.slice(24, 36);
  const hand3 = deck.slice(36, 48);

  // Determine Re/Kontra teams by Q♣ holders
  const allHands = [hand0, hand1, hand2, hand3];
  const reSeats = allHands.map((h, i) => h.some(isQueenOfClubs) ? i : -1).filter(i => i >= 0);
  const kontraSeats = [0, 1, 2, 3].filter(i => !reSeats.includes(i));

  // Team labels
  const playerTeam = reSeats.includes(0) ? "Re" : "Kontra";

  return {
    rngSeed: Math.floor(mulberry32(nextSeed)() * 2 ** 31),
    hands: [hand0, hand1, hand2, hand3],
    trump: "doppelkopf",
    currentTrick: [],
    wonCards: [[], [], [], []],
    teams: [reSeats, kontraSeats],
    trickCount: 0,
    currentLeader: 0,
    phase: "playing",
    message: `You are on the ${playerTeam} team (${reSeats.includes(0) ? "you have Q♣" : "opponents have Q♣"}). All Diamonds, Jacks & Queens are trump. Your lead!`,
  };
}

export function isTerminal(state: DoppelkopfState): { score: number } | null {
  if (state.phase !== "done") return null;
  const playerTeam = state.teams[0]!.includes(0) ? 0 : 1;
  const pts = state.teams[playerTeam]!.reduce((sum, seat) =>
    sum + state.wonCards[seat]!.reduce((a, c) => a + cardValue(c.rank), 0), 0);
  return { score: pts >= 121 ? 80 : 20 };
}
