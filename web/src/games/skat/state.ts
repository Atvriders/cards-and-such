import type { Card, Suit } from "../../engines/deck/index.js";
import { shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// 32-card Skat deck: 7-A of 4 suits
const SKAT_RANKS = [7, 8, 9, 10, 11, 12, 13, 1] as const; // 11=J,12=Q,13=K,1=A
const SUITS: Suit[] = ["♣", "♠", "♥", "♦"];

export function skatDeck(): Card[] {
  const cards: Card[] = [];
  for (const s of SUITS) {
    for (const r of SKAT_RANKS) {
      cards.push({ suit: s, rank: r as Card["rank"], id: `sk-${s}${r}` });
    }
  }
  return cards;
}

export function cardValue(rank: Card["rank"]): number {
  if (rank === 1) return 11;  // Ace
  if (rank === 10) return 10;
  if (rank === 13) return 4;  // King
  if (rank === 12) return 3;  // Queen
  if (rank === 11) return 2;  // Jack
  return 0;
}

export type SkatPhase = "bidding" | "pickup" | "declare" | "playing" | "done";
export type SkatTrump = Suit | "grand" | null;

// Trump ordering: Jacks are always top trumps (J♣>J♠>J♥>J♦), then trump suit A,10,K,Q,9,8,7
export function trumpOrder(card: Card, trump: SkatTrump): number {
  if (card.rank === 11) {
    // Jacks are top trumps in both suit and grand
    if (card.suit === "♣") return 100;
    if (card.suit === "♠") return 99;
    if (card.suit === "♥") return 98;
    if (card.suit === "♦") return 97;
  }
  if (trump && trump !== "grand" && card.suit === trump) {
    // Suit trump: A,10,K,Q,9,8,7
    const order: Record<number, number> = { 1: 96, 10: 95, 13: 94, 12: 93, 9: 92, 8: 91, 7: 90 };
    return order[card.rank] ?? 0;
  }
  return 0;
}

export function isTrump(card: Card, trump: SkatTrump): boolean {
  if (trump === null) return false;
  if (card.rank === 11) return true; // Jacks always trump
  if (trump === "grand") return false;
  return card.suit === trump;
}

export function trickWinner(
  trick: readonly { seat: number; card: Card }[],
  trump: SkatTrump
): number {
  const ledCard = trick[0]!.card;
  const ledTrump = isTrump(ledCard, trump);
  const ledSuit = ledCard.suit;

  return trick.reduce((best, cur) => {
    const bestCard = best.card;
    const curCard = cur.card;
    const bestTr = isTrump(bestCard, trump);
    const curTr = isTrump(curCard, trump);
    const bestTo = trumpOrder(bestCard, trump);
    const curTo = trumpOrder(curCard, trump);

    if (bestTr && curTr) {
      return curTo > bestTo ? cur : best;
    }
    if (curTr && !bestTr) return cur;
    if (bestTr && !curTr) return best;
    // No trump played
    if (curCard.suit === (ledTrump ? undefined : ledSuit) && bestCard.suit !== (ledTrump ? undefined : ledSuit)) return cur;
    if (bestCard.suit === (ledTrump ? undefined : ledSuit) && curCard.suit !== (ledTrump ? undefined : ledSuit)) return best;
    if (bestCard.suit === curCard.suit) {
      return rankStrength(curCard.rank) > rankStrength(bestCard.rank) ? cur : best;
    }
    return best;
  }).seat;
}

function rankStrength(rank: Card["rank"]): number {
  if (rank === 1) return 8;
  if (rank === 10) return 7;
  if (rank === 13) return 6;
  if (rank === 12) return 5;
  if (rank === 11) return 4;
  return rank - 7; // 9=2,8=1,7=0
}

export interface SkatState {
  rngSeed: number;
  hands: readonly (readonly Card[])[];  // seats 0,1,2
  skat: readonly Card[];
  trump: SkatTrump;
  declarer: number;  // seat 0=player
  declarerBid: number;
  phase: SkatPhase;
  currentTrick: readonly { seat: number; card: Card }[];
  wonCards: readonly Card[][];  // per seat
  trickCount: number;
  currentLeader: number;
  message: string;
}

function botBid(hand: readonly Card[], _rng: () => number): number {
  // Simple heuristic: count jacks and potential trump cards
  const jacks = hand.filter(c => c.rank === 11).length;
  if (jacks >= 2) return 20;
  return 18; // pass (below minimum)
}

function botChoose(hand: readonly Card[], trick: readonly { seat: number; card: Card }[], trump: SkatTrump, isPartner: boolean): Card {
  if (trick.length === 0) {
    // Lead: play a trump if available and has many, else lowest off-suit
    const trumps = hand.filter(c => isTrump(c, trump));
    if (trumps.length >= 3 && !isPartner) {
      return trumps.reduce((lo, c) => trumpOrder(c, trump) > trumpOrder(lo, trump) ? c : lo);
    }
    const nonTrump = hand.filter(c => !isTrump(c, trump));
    const pool = nonTrump.length > 0 ? nonTrump : [...hand];
    return pool.reduce((lo, c) => cardValue(c.rank) < cardValue(lo.rank) ? c : lo);
  }
  const ledCard = trick[0]!.card;
  const ledIsTrump = isTrump(ledCard, trump);
  const followSuit = hand.filter(c =>
    ledIsTrump ? isTrump(c, trump) : (!isTrump(c, trump) && c.suit === ledCard.suit)
  );
  const pool = followSuit.length > 0 ? followSuit : [...hand];
  return pool.reduce((lo, c) => cardValue(c.rank) < cardValue(lo.rank) ? c : lo);
}

function runBotTurns(state: SkatState): SkatState {
  let s = state;
  // Bots are seats 1 and 2; player is seat 0
  // currentLeader and trick length tell us whose turn it is
  while (s.phase === "playing") {
    const trickLen = s.currentTrick.length;
    let nextSeat: number;
    if (trickLen === 0) {
      nextSeat = s.currentLeader;
    } else if (trickLen === 1) {
      nextSeat = (s.currentTrick[0]!.seat + 1) % 3;
    } else if (trickLen === 2) {
      nextSeat = (s.currentTrick[1]!.seat + 1) % 3;
    } else {
      break;
    }

    if (nextSeat === 0) break; // player's turn

    const hand = s.hands[nextSeat]!;
    if (hand.length === 0) break;
    const isPartner = nextSeat !== s.declarer;
    const card = botChoose(hand, s.currentTrick, s.trump, isPartner);
    const newHands = s.hands.map((h, i) => i === nextSeat ? h.filter(c => c.id !== card.id) : h);
    const newTrick = [...s.currentTrick, { seat: nextSeat, card }];

    if (newTrick.length === 3) {
      // Resolve trick
      const winner = trickWinner(newTrick, s.trump);
      const pts = newTrick.reduce((sum, e) => sum + cardValue(e.card.rank), 0);
      const newWon = s.wonCards.map((w, i) => i === winner ? [...w, ...newTrick.map(e => e.card)] : w);
      const declarerTotal = newWon[s.declarer]!.reduce((sum, c) => sum + cardValue(c.rank), 0);
      const skatPts = s.skat.reduce((sum, c) => sum + cardValue(c.rank), 0);

      if (newHands[0]!.length === 0 && newHands[1]!.length === 0 && newHands[2]!.length === 0) {
        const total = declarerTotal + (winner === s.declarer ? skatPts : 0);
        const wins = total >= 61;
        const msg = s.declarer === 0
          ? (wins ? `You win as declarer! ${total} points (need 61).` : `You lose as declarer. ${total} points — need 61.`)
          : (wins ? `Declarer wins. You defended but lost.` : `Defenders win! Declarer only got ${declarerTotal + (winner === s.declarer ? skatPts : 0)} pts.`);
        s = { ...s, hands: newHands as readonly (readonly Card[])[], wonCards: newWon, currentTrick: [], phase: "done", message: msg };
        break;
      } else {
        s = {
          ...s,
          hands: newHands as readonly (readonly Card[])[],
          wonCards: newWon,
          currentTrick: [],
          currentLeader: winner,
          trickCount: s.trickCount + 1,
          message: winner === 0 ? "You won the trick! Your lead." : `Seat ${winner + 1} won the trick.`,
        };
      }
      void pts;
    } else {
      s = { ...s, hands: newHands as readonly (readonly Card[])[], currentTrick: newTrick };
    }
  }
  return s;
}

export function reducer(state: SkatState, action: SkatAction): SkatState {
  if (state.phase === "done") return state;

  if (action.type === "bid") {
    if (state.phase !== "bidding") return state;
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);

    // Simplified: player decides to bid or pass
    // Bots bid: seat 1 bids 18, seat 2 may bid 20
    const bot1Bid = botBid(state.hands[1]!, rng);
    const bot2Bid = botBid(state.hands[2]!, rng);
    const maxBotBid = Math.max(bot1Bid, bot2Bid);

    if (action.bid === 0) {
      // Player passes — highest bot wins
      const declarer = bot1Bid >= bot2Bid ? 1 : 2;
      return runBotTurns({
        ...state,
        rngSeed: nextSeed,
        declarer,
        declarerBid: maxBotBid,
        phase: "playing",
        currentLeader: 0, // non-declarer leads: seat 0 (player) in simplified version
        message: `You passed. Seat ${declarer + 1} is declarer with ${maxBotBid}. Bots picked trump: ♣. Your lead!`,
        trump: "♣",
      });
    } else {
      // Player bids — becomes declarer
      return {
        ...state,
        rngSeed: nextSeed,
        declarer: 0,
        declarerBid: action.bid,
        phase: "pickup",
        message: `You bid ${action.bid}. You are the declarer! Pick up the Skat?`,
      };
    }
  }

  if (action.type === "pickup") {
    if (state.phase !== "pickup") return state;
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);

    if (action.take) {
      // Give player the skat cards, then they must discard 2
      const newHand = [...state.hands[0]!, ...state.skat];
      const newHands = state.hands.map((h, i) => i === 0 ? newHand : h);
      return {
        ...state,
        rngSeed: nextSeed,
        hands: newHands as readonly (readonly Card[])[],
        skat: [],
        phase: "declare",
        message: "You picked up the Skat. Click 2 cards to discard, then choose trump.",
      };
    } else {
      return {
        ...state,
        rngSeed: nextSeed,
        phase: "declare",
        message: "You play without the Skat. Choose your trump suit.",
      };
    }
  }

  if (action.type === "discard") {
    if (state.phase !== "declare") return state;
    const hand = state.hands[0]!;
    if (hand.length <= 10) return state; // nothing to discard
    const card = hand.find(c => c.id === action.cardId);
    if (!card) return state;
    const newHand = hand.filter(c => c.id !== action.cardId);
    const newHands = state.hands.map((h, i) => i === 0 ? newHand : h);
    const newSkat = [...state.skat, card];
    return {
      ...state,
      hands: newHands as readonly (readonly Card[])[],
      skat: newSkat,
      message: newHand.length > 10
        ? "Discard one more card."
        : "Now choose your trump suit (or Grand).",
    };
  }

  if (action.type === "setTrump") {
    if (state.phase !== "declare") return state;
    const hand = state.hands[0]!;
    if (hand.length > 10) return state; // must discard first
    return runBotTurns({
      ...state,
      trump: action.trump,
      phase: "playing",
      currentLeader: state.declarer === 0 ? 1 : 0,
      message: `Trump is ${action.trump === "grand" ? "Grand (Jacks only)" : action.trump}. Play begins!`,
    });
  }

  if (action.type === "play") {
    if (state.phase !== "playing") return state;
    const hand = state.hands[0]!;
    const card = hand.find(c => c.id === action.cardId);
    if (!card) return state;

    // Validate follow-suit
    const trick = state.currentTrick;
    if (trick.length > 0) {
      const ledCard = trick[0]!.card;
      const ledIsTrump = isTrump(ledCard, state.trump);
      const mustFollow = hand.filter(c =>
        ledIsTrump ? isTrump(c, state.trump) : (!isTrump(c, state.trump) && c.suit === ledCard.suit)
      );
      if (mustFollow.length > 0 && !mustFollow.find(c => c.id === card.id)) return state;
    }

    const newHand = hand.filter(c => c.id !== card.id);
    const newHands = state.hands.map((h, i) => i === 0 ? newHand : h);
    const newTrick = [...trick, { seat: 0, card }];

    let s: SkatState;
    if (newTrick.length === 3) {
      const winner = trickWinner(newTrick, state.trump);
      const newWon = state.wonCards.map((w, i) => i === winner ? [...w, ...newTrick.map(e => e.card)] : w);
      const declarerTotal = newWon[state.declarer]!.reduce((sum, c) => sum + cardValue(c.rank), 0);
      const skatPts = state.skat.reduce((sum, c) => sum + cardValue(c.rank), 0);

      if (newHand.length === 0 && state.hands[1]!.length <= 1 && state.hands[2]!.length <= 1) {
        // Last trick — also count skat for declarer's side
        const declarerWonLast = winner === state.declarer;
        const total = declarerTotal + (declarerWonLast ? skatPts : 0);
        const msg = state.declarer === 0
          ? (total >= 61 ? `You win as declarer! ${total} points.` : `You lose as declarer. Only ${total}/61 needed.`)
          : (total >= 61 ? `Declarer wins with ${total} pts. You defended.` : `Defenders win! Declarer got only ${total} pts.`);
        s = { ...state, hands: newHands as readonly (readonly Card[])[], wonCards: newWon, currentTrick: [], phase: "done", message: msg };
      } else {
        s = {
          ...state,
          hands: newHands as readonly (readonly Card[])[],
          wonCards: newWon,
          currentTrick: [],
          currentLeader: winner,
          trickCount: state.trickCount + 1,
          message: winner === 0 ? "You won the trick! Your lead." : `Seat ${winner + 1} won the trick.`,
        };
        s = runBotTurns(s);
      }
    } else {
      s = { ...state, hands: newHands as readonly (readonly Card[])[], currentTrick: newTrick };
      s = runBotTurns(s);
    }
    return s;
  }

  return state;
}

export type SkatAction =
  | { type: "bid"; bid: number }
  | { type: "pickup"; take: boolean }
  | { type: "discard"; cardId: string }
  | { type: "setTrump"; trump: SkatTrump }
  | { type: "play"; cardId: string };

export function initialState(seed: number): SkatState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const deck = shuffle(skatDeck(), mulberry32(nextSeed));

  // Deal 10 to each of 3 players + 2 skat
  const hand0 = deck.slice(0, 10);
  const hand1 = deck.slice(10, 20);
  const hand2 = deck.slice(20, 30);
  const skat = deck.slice(30, 32);

  return {
    rngSeed: Math.floor(mulberry32(nextSeed)() * 2 ** 31),
    hands: [hand0, hand1, hand2],
    skat,
    trump: null,
    declarer: -1,
    declarerBid: 0,
    phase: "bidding",
    currentTrick: [],
    wonCards: [[], [], []],
    trickCount: 0,
    currentLeader: 0,
    message: "Place your bid (18 minimum) or pass. Bots bid ~18.",
  };
}

export function isTerminal(state: SkatState): { score: number } | null {
  if (state.phase !== "done") return null;
  const declarerWon = state.wonCards[state.declarer]!.reduce((s, c) => s + cardValue(c.rank), 0)
    + state.skat.reduce((s, c) => s + cardValue(c.rank), 0) >= 61;
  const playerWon = state.declarer === 0 ? declarerWon : !declarerWon;
  return { score: playerWon ? 80 : 20 };
}
