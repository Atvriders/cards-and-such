import type { Card, Rank, Suit } from "../../engines/deck/index.js";
import { shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface FiveCrownsSettings {
  botCount: number;
}

// Five Crowns uses 5 suits including Stars (★)
export type FiveSuit = Suit | "★";
export interface FiveCard {
  suit: FiveSuit;
  rank: Rank;
  id: string;
  isJoker?: boolean;
}

// We play a single hand with wild = 3s, 11 cards each (round 3 equivalent)
// Simplification: use a standard 52-card deck + 2 jokers, wild = rank 3
// (true Five Crowns has 5 suits; we approximate with 4 suits + jokers as wilds)

const WILD_RANK: Rank = 3;

export interface FiveCrownsState {
  settings: FiveCrownsSettings;
  rngSeed: number;
  numPlayers: number;
  hands: readonly (readonly Card[])[];
  stock: readonly Card[];
  discardPile: readonly Card[];
  phase: "player-draw" | "player-discard" | "done";
  deadwoodScores: readonly number[];   // lower is better; set on done
  playerMelds: Card[][];
  message: string;
}

export type FiveCrownsAction =
  | { type: "draw"; from: "stock" | "discard" }
  | { type: "discard"; cardId: string }
  | { type: "go-out" };  // go out if deadwood <= 0

// ── Five Crowns deck (52 standard cards, wilds = rank 3) ─────────────────────

function fiveCrownsDeck(): Card[] {
  const suits: Suit[] = ["♠", "♥", "♦", "♣"];
  const ranks: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  const cards: Card[] = [];
  for (const s of suits) {
    for (const r of ranks) {
      cards.push({ suit: s, rank: r, id: `fc-${s}${r}` });
    }
  }
  // Add 2 jokers (represented as rank 3 ♠ with unique IDs)
  cards.push({ suit: "♠", rank: 3, id: "fc-joker1" });
  cards.push({ suit: "♥", rank: 3, id: "fc-joker2" });
  return cards;
}

// ── Card value / wild ────────────────────────────────────────────────────────

export function isWild(card: Card): boolean {
  return card.rank === WILD_RANK || card.id.startsWith("fc-joker");
}

export function cardDeadwoodValue(card: Card): number {
  if (isWild(card)) return 0;
  if (card.rank === 1) return 1;
  if (card.rank >= 11) return 10;
  return card.rank;
}

// ── Meld detection (same logic as gin rummy, with wilds) ─────────────────────

export interface FiveMeldResult {
  melds: Card[][];
  deadwood: Card[];
  deadwoodValue: number;
}

function rankOrder(rank: Rank): number {
  return rank;
}

function setsOf(hand: Card[], wilds: Card[]): Card[][] {
  const nonWild = hand.filter(c => !isWild(c));
  const byRank = new Map<Rank, Card[]>();
  for (const c of nonWild) {
    const arr = byRank.get(c.rank) ?? [];
    arr.push(c);
    byRank.set(c.rank, arr);
  }
  const sets: Card[][] = [];
  for (const [, cards] of byRank) {
    if (cards.length >= 3) {
      sets.push(cards.slice(0, 3));
      if (cards.length === 4) sets.push(cards.slice(0, 4));
    }
    // With wilds to fill
    if (cards.length === 2 && wilds.length >= 1) {
      sets.push([...cards, wilds[0]!]);
    }
    if (cards.length === 1 && wilds.length >= 2) {
      sets.push([cards[0]!, wilds[0]!, wilds[1]!]);
    }
  }
  return sets;
}

function runsOf(hand: Card[], wilds: Card[]): Card[][] {
  const nonWild = hand.filter(c => !isWild(c));
  const bySuit = new Map<Suit, Card[]>();
  for (const c of nonWild) {
    const s = c.suit as Suit;
    const arr = bySuit.get(s) ?? [];
    arr.push(c);
    bySuit.set(s, arr);
  }
  const runs: Card[][] = [];
  for (const [, cards] of bySuit) {
    const sorted = [...cards].sort((a, b) => rankOrder(a.rank) - rankOrder(b.rank));
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 2; j < sorted.length; j++) {
        let consecutive = true;
        for (let k = i; k < j; k++) {
          if (rankOrder(sorted[k + 1]!.rank) !== rankOrder(sorted[k]!.rank) + 1) {
            consecutive = false;
            break;
          }
        }
        if (consecutive) runs.push(sorted.slice(i, j + 1));
      }
    }
    // 2-card run + 1 wild
    for (let i = 0; i < sorted.length - 1; i++) {
      if (rankOrder(sorted[i + 1]!.rank) === rankOrder(sorted[i]!.rank) + 1 && wilds.length >= 1) {
        // Can extend with wild at start or end
        runs.push([sorted[i]!, sorted[i + 1]!, wilds[0]!]);
      }
    }
  }
  return runs;
}

export function detectMelds(hand: readonly Card[]): FiveMeldResult {
  const h = [...hand];
  if (h.length === 0) return { melds: [], deadwood: [], deadwoodValue: 0 };

  const wilds = h.filter(isWild);
  const nonWilds = h.filter(c => !isWild(c));

  const candidates: Card[][] = [...setsOf(h, wilds), ...runsOf(nonWilds, wilds)];

  let bestMelds: Card[][] = [];
  let bestDeadwoodValue = h.reduce((s, c) => s + cardDeadwoodValue(c), 0);

  function tryMeld(chosen: Card[][], candIdx: number): void {
    const usedIds = new Set(chosen.flatMap(m => m.map(c => c.id)));
    const dw = h.filter(c => !usedIds.has(c.id));
    const dwVal = dw.reduce((s, c) => s + cardDeadwoodValue(c), 0);
    if (dwVal < bestDeadwoodValue) {
      bestDeadwoodValue = dwVal;
      bestMelds = chosen.map(m => [...m]);
    }
    if (dwVal === 0) return;
    for (let i = candIdx; i < candidates.length; i++) {
      const cand = candidates[i]!;
      const overlap = cand.some(c => usedIds.has(c.id));
      if (!overlap) tryMeld([...chosen, cand], i + 1);
    }
  }

  tryMeld([], 0);

  const meldedIds = new Set(bestMelds.flatMap(m => m.map(c => c.id)));
  const deadwood = h.filter(c => !meldedIds.has(c.id));

  return { melds: bestMelds, deadwood, deadwoodValue: bestDeadwoodValue };
}

// ── Bot logic ─────────────────────────────────────────────────────────────────

function botDiscard(hand: readonly Card[]): Card {
  const { deadwood } = detectMelds(hand);
  if (deadwood.length > 0) {
    return deadwood.reduce((hi, c) =>
      cardDeadwoodValue(c) > cardDeadwoodValue(hi) ? c : hi
    );
  }
  return [...hand].reduce((hi, c) =>
    cardDeadwoodValue(c) > cardDeadwoodValue(hi) ? c : hi
  );
}

function runBotTurn(state: FiveCrownsState, seat: number, rng: () => number): FiveCrownsState {
  let hand = [...state.hands[seat]!];
  let stock = [...state.stock];
  let discardPile = [...state.discardPile];

  // Draw
  const topDiscard = discardPile[discardPile.length - 1];
  let drawFrom: "stock" | "discard" = "stock";
  if (topDiscard) {
    // Take discard if it reduces deadwood
    const withDiscard = [...hand, topDiscard];
    if (detectMelds(withDiscard).deadwoodValue < detectMelds(hand).deadwoodValue) {
      drawFrom = "discard";
    }
  }

  if (drawFrom === "discard" && topDiscard) {
    discardPile.pop();
    hand.push(topDiscard);
  } else {
    if (stock.length === 0) {
      const top = discardPile.pop()!;
      stock = shuffle(discardPile, rng);
      discardPile = [top];
    }
    hand.push(stock.shift()!);
  }

  // Check if bot can go out (deadwood = 0)
  const { deadwoodValue } = detectMelds(hand);
  if (deadwoodValue === 0) {
    // Bot goes out — compute all deadwoods
    const newHands = state.hands.map((h, i) => i === seat ? hand : h);
    const dws = newHands.map((h, i) =>
      i === seat ? 0 : detectMelds(h).deadwoodValue
    );
    return {
      ...state,
      hands: newHands,
      stock,
      discardPile,
      phase: "done",
      deadwoodScores: dws,
      message: `Bot ${seat} went out with 0 deadwood!`,
    };
  }

  // Discard
  const toDiscard = botDiscard(hand);
  hand = hand.filter(c => c.id !== toDiscard.id);
  discardPile.push(toDiscard);

  return {
    ...state,
    hands: state.hands.map((h, i) => i === seat ? hand : h),
    stock,
    discardPile,
  };
}

// ── Reducer ──────────────────────────────────────────────────────────────────

export function reducer(state: FiveCrownsState, action: FiveCrownsAction): FiveCrownsState {
  if (state.phase === "done") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const botRng = mulberry32(nextSeed);

  if (action.type === "draw" && state.phase === "player-draw") {
    let stock = [...state.stock];
    let discardPile = [...state.discardPile];
    let playerHand: Card[];

    if (action.from === "discard") {
      if (discardPile.length === 0) return state;
      const drawn = discardPile.pop()!;
      playerHand = [...state.hands[0]!, drawn];
    } else {
      if (stock.length === 0) {
        const top = discardPile.pop()!;
        stock = shuffle(discardPile, botRng);
        discardPile = [top];
      }
      const drawn = stock.shift()!;
      playerHand = [...state.hands[0]!, drawn];
    }

    return {
      ...state,
      rngSeed: nextSeed,
      hands: state.hands.map((h, i) => i === 0 ? playerHand : h),
      stock,
      discardPile,
      phase: "player-discard",
      message: "Discard a card, or Go Out if deadwood is 0.",
    };
  }

  if (action.type === "discard" && state.phase === "player-discard") {
    const card = state.hands[0]!.find(c => c.id === action.cardId);
    if (!card) return state;

    const newHand = state.hands[0]!.filter(c => c.id !== action.cardId);
    const newDiscard = [...state.discardPile, card];

    let s: FiveCrownsState = {
      ...state,
      rngSeed: nextSeed,
      hands: state.hands.map((h, i) => i === 0 ? newHand : h),
      discardPile: newDiscard,
      phase: "player-draw",
      message: "Draw from stock or discard.",
    };

    // Bot turns
    for (let seat = 1; seat < s.numPlayers; seat++) {
      if (s.phase === "done") break;
      s = runBotTurn(s, seat, botRng);
    }

    return s;
  }

  if (action.type === "go-out" && state.phase === "player-discard") {
    const { deadwoodValue, melds } = detectMelds(state.hands[0]!);
    if (deadwoodValue > 0) return { ...state, message: "Can't go out — still have deadwood." };

    const dws = state.hands.map((h, i) =>
      i === 0 ? 0 : detectMelds(h).deadwoodValue
    );
    return {
      ...state,
      rngSeed: nextSeed,
      phase: "done",
      deadwoodScores: dws,
      playerMelds: melds,
      message: `You went out with 0 deadwood! Others' deadwood: ${dws.slice(1).join(", ")}`,
    };
  }

  return state;
}

// ── initialState ──────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: FiveCrownsSettings): FiveCrownsState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);

  const numPlayers = Math.max(2, Math.min(4, Math.round(settings.botCount) + 1));
  const deck = shuffle(fiveCrownsDeck(), dealRng);
  const cardsEach = 11; // Round 3 (3s wild, 11 cards)

  const hands: Card[][] = [];
  let idx = 0;
  for (let i = 0; i < numPlayers; i++) {
    hands.push(deck.slice(idx, idx + cardsEach));
    idx += cardsEach;
  }
  const discardPile = [deck[idx]!];
  idx++;
  const stock = deck.slice(idx);

  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    numPlayers,
    hands,
    stock,
    discardPile,
    phase: "player-draw",
    deadwoodScores: [],
    playerMelds: [],
    message: "Five Crowns — 3s are wild! Draw from stock or discard.",
  };
}

// ── isTerminal ────────────────────────────────────────────────────────────────

export function isTerminal(state: FiveCrownsState): { score: number } | null {
  if (state.phase !== "done" || state.deadwoodScores.length === 0) return null;
  const playerDw = state.deadwoodScores[0] ?? 0;
  const maxOpponentDw = Math.max(...state.deadwoodScores.slice(1));
  // Score: 100 - player's deadwood (going out with 0 = 100, high deadwood = low score)
  const score = Math.max(0, Math.min(100, 50 + maxOpponentDw - playerDw));
  return { score };
}
