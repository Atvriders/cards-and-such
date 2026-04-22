import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface WizardSettings {
  botDifficulty: "easy" | "standard";
}

export type WizardPhase = "bidding" | "playing" | "done";

// 60 cards: 52 standard + 4 Wizards + 4 Jesters
// Wizards and Jesters use special ids

export function makeWizardDeck(): Card[] {
  const std = newDeck(); // 52 cards
  const extras: Card[] = [];
  for (let i = 0; i < 4; i++) {
    extras.push({ suit: "♠", rank: 1, id: `wizard-${i}` }); // Wizard (placeholder suit)
    extras.push({ suit: "♣", rank: 1, id: `jester-${i}` }); // Jester (placeholder suit)
  }
  return [...std, ...extras]; // 60 cards
}

export function isWizard(card: Card): boolean {
  return card.id.startsWith("wizard-");
}

export function isJester(card: Card): boolean {
  return card.id.startsWith("jester-");
}

export function isSpecial(card: Card): boolean {
  return isWizard(card) || isJester(card);
}

export function cardLabel(card: Card): string {
  if (isWizard(card)) return "Wizard";
  if (isJester(card)) return "Jester";
  const rankNames: Record<number, string> = { 1: "A", 11: "J", 12: "Q", 13: "K" };
  return `${rankNames[card.rank] ?? card.rank}${card.suit}`;
}

// ── Trick resolution ──────────────────────────────────────────────────────────

function trickWinner(
  trick: readonly { seat: number; card: Card }[],
  trump: Suit | null,
): number {
  // First Wizard played wins
  const firstWizard = trick.find(e => isWizard(e.card));
  if (firstWizard) return firstWizard.seat;

  // If all Jesters, first player wins
  if (trick.every(e => isJester(e.card))) return trick[0]!.seat;

  // Determine led suit (first non-Jester card)
  const ledEntry = trick.find(e => !isJester(e.card));
  if (!ledEntry) return trick[0]!.seat;
  const ledSuit = ledEntry.card.suit;

  let best = ledEntry;
  for (const e of trick) {
    if (isWizard(e.card) || isJester(e.card)) continue;
    const card = e.card;
    const bestCard = best.card;
    if (isWizard(bestCard)) { best = best; continue; }

    const cardTrump = trump && card.suit === trump;
    const bestTrump = trump && bestCard.suit === trump;

    if (cardTrump && !bestTrump) { best = e; continue; }
    if (!cardTrump && bestTrump) continue;

    if (card.suit === ledSuit && bestCard.suit !== ledSuit) { best = e; continue; }
    if (card.suit !== ledSuit && bestCard.suit === ledSuit) continue;

    const r = (c: Card) => c.rank === 1 ? 14 : c.rank;
    if (r(card) > r(bestCard)) best = e;
  }
  return best.seat;
}

export function legalPlays(state: WizardState, seat: number): Card[] {
  const hand = state.hands[seat]!;
  if (hand.length === 0) return [];
  const trick = state.currentTrick;
  if (trick.length === 0) return [...hand]; // leading: any card

  // Determine led suit (first non-Jester card)
  const ledEntry = trick.find(e => !isJester(e.card));
  if (!ledEntry) return [...hand]; // all Jesters so far

  const ledSuit = ledEntry.card.suit;
  if (isWizard(ledEntry.card)) return [...hand]; // Wizard led → any card

  const suitCards = hand.filter(c => c.suit === ledSuit && !isSpecial(c));
  if (suitCards.length === 0) return [...hand]; // can't follow suit → any card

  // Must follow suit but can also play Wizards and Jesters (always playable)
  const specials = hand.filter(isSpecial);
  return [...suitCards, ...specials];
}

// ── Bot logic ─────────────────────────────────────────────────────────────────

function handStrength(hand: readonly Card[], trump: Suit | null): number {
  let str = 0;
  for (const c of hand) {
    if (isWizard(c)) { str += 3; continue; }
    if (isJester(c)) continue;
    if (trump && c.suit === trump) str += 1.5;
    else {
      const r = c.rank === 1 ? 14 : c.rank;
      if (r >= 12) str += 1;
    }
  }
  return str;
}

function botBid(hand: readonly Card[], trump: Suit | null, n: number): number {
  const str = handStrength(hand, trump);
  return Math.max(0, Math.min(n, Math.round(str / 3)));
}

function botPlay(state: WizardState, seat: number, _rng: () => number): Card {
  const legal = legalPlays(state, seat);
  if (legal.length === 1) return legal[0]!;
  const trick = state.currentTrick;
  const myBid = state.bids[seat]!;
  const myTricks = state.tricksTaken[seat]!;

  if (trick.length === 0) {
    // Leading
    if (myTricks >= myBid) {
      // Already met bid — play jester to avoid winning
      const jester = legal.find(isJester);
      if (jester) return jester;
      // Play lowest non-wizard
      const nonWizard = legal.filter(c => !isWizard(c));
      if (nonWizard.length > 0) return nonWizard.reduce((lo, c) => {
        const r = (x: Card) => x.rank === 1 ? 14 : x.rank;
        return r(c) < r(lo) ? c : lo;
      });
    }
    // Need more tricks — lead wizard if have one
    const wiz = legal.find(isWizard);
    if (wiz) return wiz;
    // Lead highest
    return legal.reduce((hi, c) => {
      const r = (x: Card) => x.rank === 1 ? 14 : x.rank;
      return r(c) > r(hi) ? c : hi;
    });
  }

  const winner = trickWinner(trick, state.trumpSuit);
  const needWin = myTricks < myBid;

  if (needWin) {
    // Try to win: play wizard first
    const wiz = legal.find(isWizard);
    if (wiz) return wiz;
    const r = (x: Card) => x.rank === 1 ? 14 : x.rank;
    return legal.reduce((hi, c) => r(c) > r(hi) ? c : hi);
  }

  // Don't need to win — play jester or lowest
  const jester = legal.find(isJester);
  if (jester) return jester;
  const r = (x: Card) => x.rank === 1 ? 14 : x.rank;
  return legal.reduce((lo, c) => r(c) < r(lo) ? c : lo);
}

// ── applyCard ─────────────────────────────────────────────────────────────────

function applyCard(state: WizardState, seat: number, card: Card, _rng: () => number): WizardState {
  const newHands = state.hands.map((h, i) =>
    i === seat ? h.filter(c => c.id !== card.id) : h
  );
  const newTrick = [...state.currentTrick, { seat, card }];
  let s: WizardState = { ...state, hands: newHands, currentTrick: newTrick };

  if (newTrick.length === 4) {
    const winner = trickWinner(newTrick, state.trumpSuit);
    const newTricksTaken = state.tricksTaken.map((t, i) => i === winner ? t + 1 : t);
    const tricksPlayed = state.tricksPlayed + 1;

    s = { ...s, currentTrick: [], tricksTaken: newTricksTaken, tricksPlayed, leadSeat: winner, turn: winner };

    if (tricksPlayed === 10) {
      // Scoring
      const scores = state.bids.map((bid, i) => {
        if (bid === null) return 0;
        const taken = newTricksTaken[i]!;
        if (taken === bid) return 20 + 10 * bid;
        return -10 * Math.abs(taken - bid);
      });
      s = { ...s, phase: "done", finalScores: scores };
    }
  } else {
    s = { ...s, turn: (seat + 1) % 4 };
  }

  return s;
}

export interface WizardState {
  settings: WizardSettings;
  rngSeed: number;
  hands: readonly (readonly Card[])[];
  trumpCard: Card | null;
  trumpSuit: Suit | null;
  currentTrick: readonly { seat: number; card: Card }[];
  leadSeat: number;
  turn: number;
  phase: WizardPhase;
  bids: readonly (number | null)[];
  tricksTaken: readonly number[];
  tricksPlayed: number;
  finalScores: readonly number[] | null;
}

export type WizardAction =
  | { type: "bid"; amount: number }
  | { type: "play"; cardId: string };

// ── reducer ───────────────────────────────────────────────────────────────────

export function reducer(state: WizardState, action: WizardAction): WizardState {
  if (state.phase === "done") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const botRng = mulberry32(nextSeed);

  if (state.phase === "bidding") {
    if (action.type !== "bid") return state;
    if (state.turn !== 0) return state;

    const amount = Math.max(0, Math.min(10, action.amount));
    const newBids = state.bids.map((b, i) => i === 0 ? amount : b);
    let s: WizardState = { ...state, rngSeed: nextSeed, bids: newBids, turn: 1 };

    // Bots bid
    while (s.turn !== 0 && s.bids[s.turn] === null) {
      const botSeat = s.turn;
      const bid = botBid(s.hands[botSeat]!, s.trumpSuit, 10);
      const updBids = s.bids.map((b, i) => i === botSeat ? bid : b);
      s = { ...s, bids: updBids, turn: (botSeat + 1) % 4 };
    }

    if (s.bids.every(b => b !== null)) {
      s = { ...s, phase: "playing", turn: s.leadSeat };
      while (s.phase !== "done" && s.turn !== 0) {
        if (s.hands[s.turn]!.length === 0) break;
        const botCard = botPlay(s, s.turn, botRng);
        s = applyCard(s, s.turn, botCard, botRng);
      }
    }

    return s;
  }

  if (state.phase === "playing") {
    if (action.type !== "play") return state;
    if (state.turn !== 0) return state;

    const card = state.hands[0]!.find(c => c.id === action.cardId);
    if (!card) return state;
    const legal = legalPlays(state, 0);
    if (!legal.some(c => c.id === card.id)) return state;

    let s: WizardState = { ...state, rngSeed: nextSeed };
    s = applyCard(s, 0, card, botRng);

    while (s.phase !== "done" && s.turn !== 0) {
      if (s.hands[s.turn]!.length === 0) break;
      const botCard = botPlay(s, s.turn, botRng);
      s = applyCard(s, s.turn, botCard, botRng);
    }

    return s;
  }

  return state;
}

// ── initialState ──────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: WizardSettings): WizardState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);

  const deck = shuffle(makeWizardDeck(), dealRng);
  // Deal 10 cards each (4 players = 40 cards), turn up 41st for trump
  const hands: Card[][] = [
    deck.slice(0, 10),
    deck.slice(10, 20),
    deck.slice(20, 30),
    deck.slice(30, 40),
  ];

  const trumpCard = deck[40] ?? null;
  let trumpSuit: Suit | null = null;
  if (trumpCard) {
    if (isWizard(trumpCard)) {
      // Dealer picks trump — auto-pick spades for simplicity
      trumpSuit = "♠";
    } else if (!isJester(trumpCard)) {
      trumpSuit = trumpCard.suit;
    }
    // Jester = no trump
  }

  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    hands,
    trumpCard,
    trumpSuit,
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "bidding",
    bids: [null, null, null, null],
    tricksTaken: [0, 0, 0, 0],
    tricksPlayed: 0,
    finalScores: null,
  };
}

// ── isTerminal ────────────────────────────────────────────────────────────────

export function isTerminal(state: WizardState): { score: number } | null {
  if (state.phase !== "done" || !state.finalScores) return null;
  const myScore = state.finalScores[0]!;
  // Normalize: max possible = 20 + 10*10 = 120; min (all wrong by 10) = -100
  const normalized = Math.max(0, Math.min(100, Math.round((myScore + 100) / 2.2)));
  return { score: normalized };
}
