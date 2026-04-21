import type { Card, Rank, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Rummy500Settings {
  numBots: number;
}

export type Rummy500Phase = "player-draw" | "player-meld" | "bot-turn" | "done";

export interface TableMeld {
  id: string;
  cards: Card[];
  owner: number; // seat
}

export interface Rummy500State {
  settings: Rummy500Settings;
  rngSeed: number;
  numPlayers: number;
  hands: readonly (readonly Card[])[];
  stock: readonly Card[];
  discardPile: readonly Card[];
  tableMelds: TableMeld[];
  scores: readonly number[];
  phase: Rummy500Phase;
  message: string;
}

export type Rummy500Action =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "meld"; cardIds: string[] }         // play a new meld from hand
  | { type: "layoff"; cardId: string; meldId: string }  // lay off onto existing meld
  | { type: "discard"; cardId: string }
  | { type: "knock" };                          // go out (end round)

// ── Scoring helpers ──────────────────────────────────────────────────────────

export function cardMeldValue(rank: Rank): number {
  if (rank === 1) return 1;  // Ace low in melds (unless in run A-2-3 = 15, simplified to 1)
  if (rank >= 11) return 10;
  return rank;
}

export function cardDeadwoodValue(rank: Rank): number {
  if (rank === 1) return 1;
  if (rank >= 11) return 10;
  return rank;
}

// ── Meld validation ──────────────────────────────────────────────────────────

export function isValidMeld(cards: Card[]): boolean {
  if (cards.length < 3) return false;
  // Check set
  if (cards.every(c => c.rank === cards[0]!.rank)) {
    const suits = new Set(cards.map(c => c.suit));
    return suits.size === cards.length;
  }
  // Check run
  if (cards.every(c => c.suit === cards[0]!.suit)) {
    const ranks = cards.map(c => c.rank).sort((a, b) => a - b);
    for (let i = 1; i < ranks.length; i++) {
      if (ranks[i]! !== ranks[i - 1]! + 1) return false;
    }
    return true;
  }
  return false;
}

export function canLayOffCard(card: Card, meld: TableMeld): boolean {
  const cards = meld.cards;
  const extended = [...cards, card];
  // Must remain a valid meld (set or run)
  if (cards.every(c => c.rank === cards[0]!.rank)) {
    // Set: add if same rank and new suit
    return card.rank === cards[0]!.rank && !cards.some(c => c.suit === card.suit);
  }
  if (cards.every(c => c.suit === cards[0]!.suit) && card.suit === cards[0]!.suit) {
    const ranks = extended.map(c => c.rank).sort((a, b) => a - b);
    for (let i = 1; i < ranks.length; i++) {
      if (ranks[i]! !== ranks[i - 1]! + 1) return false;
    }
    return true;
  }
  return false;
}

// ── Bot logic ────────────────────────────────────────────────────────────────

function runBotTurn(state: Rummy500State, seat: number, rng: () => number): Rummy500State {
  let hand = [...state.hands[seat]!];
  let stock = [...state.stock];
  let discardPile = [...state.discardPile];
  let tableMelds = [...state.tableMelds];
  const scores = [...state.scores];

  // Draw from stock
  if (stock.length === 0) {
    if (discardPile.length <= 1) {
      return { ...state, phase: "done", message: "Stock empty — hand over!" };
    }
    const top = discardPile.pop()!;
    stock = shuffle(discardPile, rng);
    discardPile = [top];
  }
  const drawn = stock.shift()!;
  hand.push(drawn);

  // Try to meld
  let melded = true;
  while (melded) {
    melded = false;
    // Try sets
    const byRank = new Map<Rank, Card[]>();
    for (const c of hand) {
      const arr = byRank.get(c.rank) ?? [];
      arr.push(c);
      byRank.set(c.rank, arr);
    }
    for (const [, cards] of byRank) {
      if (cards.length >= 3) {
        const meldCards = cards.slice(0, 3);
        tableMelds.push({ id: `m-${seat}-${Date.now()}-${Math.random()}`, cards: meldCards, owner: seat });
        scores[seat] = (scores[seat] ?? 0) + meldCards.reduce((s, c) => s + cardMeldValue(c.rank), 0);
        hand = hand.filter(c => !meldCards.some(m => m.id === c.id));
        melded = true;
        break;
      }
    }
    if (melded) continue;

    // Try runs
    const bySuit = new Map<Suit, Card[]>();
    for (const c of hand) {
      const arr = bySuit.get(c.suit) ?? [];
      arr.push(c);
      bySuit.set(c.suit, arr);
    }
    for (const [, cards] of bySuit) {
      const sorted = [...cards].sort((a, b) => a.rank - b.rank);
      for (let i = 0; i <= sorted.length - 3; i++) {
        let consecutive = true;
        for (let k = i; k < i + 2; k++) {
          if (sorted[k + 1]!.rank !== sorted[k]!.rank + 1) { consecutive = false; break; }
        }
        if (consecutive) {
          const run = sorted.slice(i, i + 3);
          tableMelds.push({ id: `m-${seat}-${Date.now()}-r-${i}`, cards: run, owner: seat });
          scores[seat] = (scores[seat] ?? 0) + run.reduce((s, c) => s + cardMeldValue(c.rank), 0);
          hand = hand.filter(c => !run.some(m => m.id === c.id));
          melded = true;
          break;
        }
      }
      if (melded) break;
    }
  }

  // Try lay-offs
  for (const meld of tableMelds) {
    for (let i = hand.length - 1; i >= 0; i--) {
      const c = hand[i]!;
      if (canLayOffCard(c, meld)) {
        meld.cards.push(c);
        scores[seat] = (scores[seat] ?? 0) + cardMeldValue(c.rank);
        hand.splice(i, 1);
      }
    }
  }

  // Discard
  const toDiscard = hand.length > 0
    ? hand.reduce((hi, c) => cardDeadwoodValue(c.rank) > cardDeadwoodValue(hi.rank) ? c : hi)
    : null;

  if (toDiscard) {
    hand = hand.filter(c => c.id !== toDiscard.id);
    discardPile.push(toDiscard);
  }

  const newHands = state.hands.map((h, i) => i === seat ? hand : h);

  // Check if bot went out
  if (hand.length === 0) {
    const dwPenalties = newHands.map((h, i) =>
      i === seat ? 0 : h.reduce((s, c) => s + cardDeadwoodValue(c.rank), 0)
    );
    const finalScores = scores.map((s, i) => s - dwPenalties[i]!);
    return {
      ...state,
      hands: newHands,
      stock,
      discardPile,
      tableMelds,
      scores: finalScores,
      phase: "done",
      message: `Bot ${seat} went out!`,
    };
  }

  return {
    ...state,
    hands: newHands,
    stock,
    discardPile,
    tableMelds,
    scores,
  };
}

// ── Reducer ──────────────────────────────────────────────────────────────────

export function reducer(state: Rummy500State, action: Rummy500Action): Rummy500State {
  if (state.phase === "done" || state.phase === "bot-turn") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const botRng = mulberry32(nextSeed);

  if (action.type === "draw-stock" && state.phase === "player-draw") {
    let stock = [...state.stock];
    let discardPile = [...state.discardPile];
    if (stock.length === 0) {
      if (discardPile.length <= 1) {
        return { ...state, phase: "done", message: "Stock exhausted!" };
      }
      const top = discardPile.pop()!;
      stock = shuffle(discardPile, botRng);
      discardPile = [top];
    }
    const drawn = stock.shift()!;
    const playerHand = [...state.hands[0]!, drawn];
    return {
      ...state,
      rngSeed: nextSeed,
      hands: state.hands.map((h, i) => i === 0 ? playerHand : h),
      stock,
      discardPile,
      phase: "player-meld",
      message: "Meld, lay off, or discard.",
    };
  }

  if (action.type === "draw-discard" && state.phase === "player-draw") {
    if (state.discardPile.length === 0) return state;
    const discardPile = [...state.discardPile];
    const drawn = discardPile.pop()!;
    const playerHand = [...state.hands[0]!, drawn];
    return {
      ...state,
      rngSeed: nextSeed,
      hands: state.hands.map((h, i) => i === 0 ? playerHand : h),
      discardPile,
      phase: "player-meld",
      message: "Meld, lay off, or discard.",
    };
  }

  if (action.type === "meld" && state.phase === "player-meld") {
    const meldCards = action.cardIds.map(id => state.hands[0]!.find(c => c.id === id)!).filter(Boolean);
    if (!isValidMeld(meldCards)) return { ...state, message: "Invalid meld! Need 3+ same rank or 3+ consecutive same suit." };

    const meldValue = meldCards.reduce((s, c) => s + cardMeldValue(c.rank), 0);
    const meldedIds = new Set(action.cardIds);
    const newHand = state.hands[0]!.filter(c => !meldedIds.has(c.id));
    const newMeld: TableMeld = { id: `p-${Date.now()}`, cards: meldCards, owner: 0 };
    const newScores = state.scores.map((s, i) => i === 0 ? s + meldValue : s);

    return {
      ...state,
      rngSeed: nextSeed,
      hands: state.hands.map((h, i) => i === 0 ? newHand : h),
      tableMelds: [...state.tableMelds, newMeld],
      scores: newScores,
      message: `Melded ${meldCards.length} cards for ${meldValue} pts. Meld more, lay off, or discard.`,
    };
  }

  if (action.type === "layoff" && state.phase === "player-meld") {
    const card = state.hands[0]!.find(c => c.id === action.cardId);
    const meld = state.tableMelds.find(m => m.id === action.meldId);
    if (!card || !meld || !canLayOffCard(card, meld)) return { ...state, message: "Cannot lay off that card there." };

    const newHand = state.hands[0]!.filter(c => c.id !== action.cardId);
    const newMelds = state.tableMelds.map(m =>
      m.id === action.meldId ? { ...m, cards: [...m.cards, card] } : m
    );
    const newScores = state.scores.map((s, i) => i === 0 ? s + cardMeldValue(card.rank) : s);

    return {
      ...state,
      rngSeed: nextSeed,
      hands: state.hands.map((h, i) => i === 0 ? newHand : h),
      tableMelds: newMelds,
      scores: newScores,
      message: "Laid off! Meld more, lay off, or discard.",
    };
  }

  if (action.type === "discard" && state.phase === "player-meld") {
    const card = state.hands[0]!.find(c => c.id === action.cardId);
    if (!card) return state;

    const newHand = state.hands[0]!.filter(c => c.id !== action.cardId);
    const newDiscard = [...state.discardPile, card];

    // Check if player went out
    if (newHand.length === 0) {
      const dwPenalties = state.hands.map((h, i) =>
        i === 0 ? 0 : h.reduce((s, c) => s + cardDeadwoodValue(c.rank), 0)
      );
      const finalScores = state.scores.map((s, i) => s - dwPenalties[i]!);
      return {
        ...state,
        rngSeed: nextSeed,
        hands: state.hands.map((h, i) => i === 0 ? newHand : h),
        discardPile: newDiscard,
        scores: finalScores,
        phase: "done",
        message: "You went out! Round over.",
      };
    }

    // Bot turns
    let s: Rummy500State = {
      ...state,
      rngSeed: nextSeed,
      hands: state.hands.map((h, i) => i === 0 ? newHand : h),
      discardPile: newDiscard,
      phase: "player-draw",
      message: "Your turn — draw.",
    };

    for (let seat = 1; seat < s.numPlayers; seat++) {
      if (s.phase === "done") break;
      s = runBotTurn(s, seat, botRng);
    }

    return s;
  }

  if (action.type === "knock" && state.phase === "player-meld") {
    // Go out without discarding (if hand is empty)
    if (state.hands[0]!.length > 0) return { ...state, message: "Must have empty hand to knock." };
    const dwPenalties = state.hands.map((h, i) =>
      i === 0 ? 0 : h.reduce((s, c) => s + cardDeadwoodValue(c.rank), 0)
    );
    const finalScores = state.scores.map((s, i) => s - dwPenalties[i]!);
    return {
      ...state,
      rngSeed: nextSeed,
      scores: finalScores,
      phase: "done",
      message: "You went out!",
    };
  }

  return state;
}

// ── initialState ─────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: Rummy500Settings): Rummy500State {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);

  const numBots = Math.max(1, Math.min(3, Math.round(settings.numBots)));
  const numPlayers = numBots + 1;
  const cardsEach = numPlayers === 2 ? 10 : 7;
  const deck = shuffle(newDeck(), dealRng);

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
    tableMelds: [],
    scores: Array(numPlayers).fill(0),
    phase: "player-draw",
    message: "Draw from stock or discard pile.",
  };
}

// ── isTerminal ─────────────────────────────────────────────────────────────

export function isTerminal(state: Rummy500State): { score: number } | null {
  if (state.phase !== "done") return null;
  const playerScore = state.scores[0] ?? 0;
  return { score: Math.max(0, Math.min(100, playerScore)) };
}
