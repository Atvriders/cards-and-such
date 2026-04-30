import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface HeartsSettings {
  botDifficulty: "random" | "heuristic";
}

export type Phase = "passing" | "playing" | "done";

export interface HeartsState {
  settings: HeartsSettings;
  rngSeed: number;
  hands: readonly (readonly Card[])[];       // length 4, seat-indexed
  currentTrick: readonly { seat: number; card: Card }[];
  leadSeat: number;
  turn: number;
  heartsBroken: boolean;
  tricksPlayed: number;
  takenCards: readonly (readonly Card[])[];
  handDone: boolean;
  finalScores: readonly number[] | null;
  phase: Phase;
  passSelection: readonly string[]; // ids of cards player has selected to pass
  passComplete: boolean;
}

export type HeartsAction =
  | { type: "play"; cardId: string }
  | { type: "togglePass"; cardId: string }
  | { type: "submitPass" };

function ledSuit(trick: readonly { seat: number; card: Card }[]): Suit | null {
  return trick.length > 0 ? trick[0]!.card.suit : null;
}

function highestOfSuit(
  trick: readonly { seat: number; card: Card }[],
  suit: Suit,
): { seat: number; card: Card } | null {
  const relevant = trick.filter(e => e.card.suit === suit);
  if (relevant.length === 0) return null;
  return relevant.reduce((best, cur) => cur.card.rank > best.card.rank ? cur : best);
}

function isQS(card: Card): boolean { return card.suit === "♠" && card.rank === 12; }
function isHeart(card: Card): boolean { return card.suit === "♥"; }

export function legalPlays(
  state: HeartsState,
  seat: number,
  hand: readonly Card[],
): Card[] {
  const trick = state.currentTrick;
  const isFirstTrick = state.tricksPlayed === 0;
  if (trick.length === 0) {
    if (isFirstTrick) {
      const twoClub = hand.find(c => c.suit === "♣" && c.rank === 2);
      return twoClub ? [twoClub] : [...hand];
    }
    if (!state.heartsBroken) {
      const nonHearts = hand.filter(c => !isHeart(c));
      if (nonHearts.length > 0) return nonHearts;
    }
    return [...hand];
  }
  const led = ledSuit(trick)!;
  const suitCards = hand.filter(c => c.suit === led);
  if (suitCards.length > 0) return suitCards;
  if (isFirstTrick) {
    const safe = hand.filter(c => !isHeart(c) && !isQS(c));
    if (safe.length > 0) return safe;
  }
  return [...hand];
}

function computePenalties(takenCards: readonly (readonly Card[])[]): number[] {
  return takenCards.map(cards =>
    cards.reduce((sum, c) => {
      if (isHeart(c)) return sum + 1;
      if (isQS(c)) return sum + 13;
      return sum;
    }, 0)
  );
}

function randomBot(_hand: readonly Card[], legal: Card[], rng: () => number): Card {
  const idx = Math.floor(rng() * legal.length);
  return legal[idx]!;
}

function heuristicBot(
  state: HeartsState,
  _seat: number,
  _hand: readonly Card[],
  legal: Card[],
  _rng: () => number,
): Card {
  const trick = state.currentTrick;
  if (trick.length === 0) {
    const nonPenalty = legal.filter(c => !isHeart(c) && !isQS(c));
    const pool = nonPenalty.length > 0 ? nonPenalty : legal;
    if (pool.length === 0) return legal[0]!;
    const bySuit = new Map<Suit, Card[]>();
    for (const c of pool) {
      const arr = bySuit.get(c.suit) ?? [];
      arr.push(c);
      bySuit.set(c.suit, arr);
    }
    let best: Card[] = [];
    for (const arr of bySuit.values()) if (arr.length > best.length) best = arr;
    if (best.length === 0) return pool[0]!;
    return best.reduce((lo, c) => c.rank < lo.rank ? c : lo);
  }
  const led = ledSuit(trick)!;
  const currentWinner = highestOfSuit(trick, led);
  const trickHasPenalty = trick.some(e => isHeart(e.card) || isQS(e.card));
  const canFollow = legal.some(c => c.suit === led);
  if (canFollow) {
    const followCards = legal.filter(c => c.suit === led);
    if (currentWinner) {
      const currentHighRank = currentWinner.card.rank;
      const belowWinner = followCards.filter(c => c.rank < currentHighRank);
      if (trickHasPenalty && belowWinner.length > 0) {
        return belowWinner.reduce((hi, c) => c.rank > hi.rank ? c : hi);
      }
      if (!trickHasPenalty) {
        return followCards.reduce((hi, c) => c.rank > hi.rank ? c : hi);
      }
      return followCards.reduce((hi, c) => c.rank > hi.rank ? c : hi);
    }
    return followCards.reduce((hi, c) => c.rank > hi.rank ? c : hi);
  }
  const qs = legal.find(isQS);
  if (qs && led !== "♠") return qs;
  const hearts = legal.filter(isHeart);
  if (hearts.length > 0) return hearts.reduce((hi, c) => c.rank > hi.rank ? c : hi);
  return legal.reduce((hi, c) => c.rank > hi.rank ? c : hi);
}

function botPlay(state: HeartsState, seat: number, rng: () => number): Card {
  const hand = state.hands[seat]!;
  const legal = legalPlays(state, seat, hand);
  if (state.settings.botDifficulty === "random") return randomBot(hand, legal, rng);
  return heuristicBot(state, seat, hand, legal, rng);
}

function botPassChoice(hand: readonly Card[]): Card[] {
  // Pass high spades (Q♠, K♠, A♠ if no low protector) and high hearts/clubs
  const sorted = [...hand].sort((a, b) => {
    const av = (isHeart(a) ? 13 : 0) + (isQS(a) ? 50 : 0) + a.rank;
    const bv = (isHeart(b) ? 13 : 0) + (isQS(b) ? 50 : 0) + b.rank;
    return bv - av;
  });
  return sorted.slice(0, 3);
}

function applyCard(
  state: HeartsState,
  seat: number,
  card: Card,
): HeartsState {
  const newHands = state.hands.map((h, i) => i === seat ? h.filter(c => c.id !== card.id) : h);
  const newTrick = [...state.currentTrick, { seat, card }];
  let s: HeartsState = { ...state, hands: newHands, currentTrick: newTrick };
  if (newTrick.length === 4) {
    const led = newTrick[0]!.card.suit;
    const winner = highestOfSuit(newTrick, led)!;
    const winSeat = winner.seat;
    const trickCards = newTrick.map(e => e.card);
    const newTakenCards = s.takenCards.map((cards, i) => i === winSeat ? [...cards, ...trickCards] : cards);
    const heartsBroken = s.heartsBroken || trickCards.some(isHeart);
    const tricksPlayed = s.tricksPlayed + 1;
    s = { ...s, currentTrick: [], takenCards: newTakenCards, heartsBroken, tricksPlayed, leadSeat: winSeat, turn: winSeat };
    if (tricksPlayed === 13) {
      const penalties = computePenalties(newTakenCards);
      let finalScores: number[] = penalties;
      const shooter = penalties.findIndex(p => p === 26);
      if (shooter !== -1) {
        finalScores = penalties.map((_, i) => (i === shooter ? 0 : 26));
      }
      s = { ...s, handDone: true, finalScores, phase: "done" };
    }
  } else {
    s = { ...s, turn: (seat + 1) % 4 };
  }
  return s;
}

function runBots(state: HeartsState, rng: () => number): HeartsState {
  let s = state;
  while (!s.handDone && s.turn !== 0 && s.phase === "playing") {
    const seat = s.turn;
    const hand = s.hands[seat]!;
    if (hand.length === 0) break;
    const card = botPlay(s, seat, rng);
    s = applyCard(s, seat, card);
  }
  return s;
}

export function reducer(state: HeartsState, action: HeartsAction): HeartsState {
  if (state.handDone) return state;

  if (action.type === "togglePass") {
    if (state.phase !== "passing") return state;
    const sel = state.passSelection;
    if (sel.includes(action.cardId)) {
      return { ...state, passSelection: sel.filter(id => id !== action.cardId) };
    }
    if (sel.length >= 3) return state;
    return { ...state, passSelection: [...sel, action.cardId] };
  }

  if (action.type === "submitPass") {
    if (state.phase !== "passing") return state;
    if (state.passSelection.length !== 3) return state;
    // Pass left: seat 0 -> 1, 1 -> 2, 2 -> 3, 3 -> 0
    const passDir = 1;
    const playerCards = state.hands[0]!.filter(c => state.passSelection.includes(c.id));
    if (playerCards.length !== 3) return state;
    // Bots also pick 3 to pass
    const botPasses: Card[][] = [[], [], [], []];
    botPasses[0] = playerCards;
    for (let s = 1; s < 4; s++) botPasses[s] = botPassChoice(state.hands[s]!);

    // Build new hands
    const newHands = state.hands.map((h, i) => {
      const without = h.filter(c => !botPasses[i]!.some(p => p.id === c.id));
      const incoming = botPasses[(i - passDir + 4) % 4]!;
      return [...without, ...incoming];
    });

    // After pass, find who has 2♣ to lead
    const twoClubSeat = newHands.findIndex(h => h.some(c => c.suit === "♣" && c.rank === 2));
    const lead = twoClubSeat >= 0 ? twoClubSeat : 0;
    let next: HeartsState = {
      ...state,
      hands: newHands,
      phase: "playing",
      leadSeat: lead,
      turn: lead,
      passComplete: true,
      passSelection: [],
    };
    if (lead !== 0) {
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const botRng = mulberry32(nextSeed);
      next = { ...next, rngSeed: nextSeed };
      next = runBots(next, botRng);
    }
    return next;
  }

  if (action.type === "play") {
    if (state.phase !== "playing") return state;
    if (state.turn !== 0) return state;
    const hand0 = state.hands[0]!;
    const card = hand0.find(c => c.id === action.cardId);
    if (!card) return state;
    const legal = legalPlays(state, 0, hand0);
    if (!legal.some(c => c.id === card.id)) return state;
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const botRng = mulberry32(nextSeed);
    let s: HeartsState = { ...state, rngSeed: nextSeed };
    s = applyCard(s, 0, card);
    s = runBots(s, botRng);
    return s;
  }

  return state;
}

export function initialState(seed: number, settings: HeartsSettings): HeartsState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);
  const deck = shuffle(newDeck(), dealRng);
  const hands: Card[][] = [
    deck.slice(0, 13),
    deck.slice(13, 26),
    deck.slice(26, 39),
    deck.slice(39, 52),
  ];
  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    hands,
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    heartsBroken: false,
    tricksPlayed: 0,
    takenCards: [[], [], [], []],
    handDone: false,
    finalScores: null,
    phase: "passing",
    passSelection: [],
    passComplete: false,
  };
}

export function isTerminal(state: HeartsState): { score: number } | null {
  if (!state.handDone || !state.finalScores) return null;
  const playerPenalty = state.finalScores[0]!;
  return { score: Math.max(0, 26 - playerPenalty) };
}
