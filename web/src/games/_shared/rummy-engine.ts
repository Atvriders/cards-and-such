// Shared rummy / canasta engine — heads-up vs CPU.
// Used by ~50 rummy-family variants. Each variant supplies a config.
import type { Card, Rank, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle, rankLabel } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface RummyConfig {
  /** Cards dealt to each player */
  handSize: number;
  /** Number of 52-card decks (1 for gin, 2+ for canasta family) */
  deckCopies: number;
  /** Add 2 jokers per deck (canasta family) */
  withJokers: boolean;
  /** Maximum deadwood with which player may knock. 0 = gin only, Infinity = no knock. */
  knockLimit: number;
  /** Gin bonus points (knock with 0 deadwood) */
  ginBonus: number;
  /** Undercut bonus to opponent */
  undercutBonus: number;
  /** Treat 2s as wilds (canasta family) */
  twosWild: boolean;
  /** Aces low for runs (some variants allow A-K wrap) */
  aceHigh: boolean;
  /** Minimum meld count before going out (canasta needs canastas) */
  requireCanasta: boolean;
}

export const DEFAULT_RUMMY: RummyConfig = {
  handSize: 10,
  deckCopies: 1,
  withJokers: false,
  knockLimit: 10,
  ginBonus: 25,
  undercutBonus: 25,
  twosWild: false,
  aceHigh: false,
  requireCanasta: false,
};

export function buildDeck(cfg: RummyConfig): Card[] {
  const cards = newDeck(cfg.deckCopies);
  if (cfg.withJokers) {
    for (let c = 0; c < cfg.deckCopies; c++) {
      cards.push({ suit: "♠", rank: 13, id: `joker-${c}-A` } as Card);
      cards.push({ suit: "♥", rank: 13, id: `joker-${c}-B` } as Card);
    }
  }
  return cards;
}

export function isJoker(card: Card): boolean {
  return card.id.startsWith("joker-");
}

export function isWild(card: Card, cfg: RummyConfig): boolean {
  if (isJoker(card)) return true;
  if (cfg.twosWild && card.rank === 2) return true;
  return false;
}

export function cardValue(rank: Rank): number {
  if (rank === 1) return 1;
  if (rank >= 11) return 10;
  return rank;
}

// ── Meld detection ─────────────────────────────────────────────────────────

interface MeldResult {
  melds: Card[][];
  deadwood: Card[];
  deadwoodValue: number;
}

function setsOf(hand: Card[]): Card[][] {
  const byRank = new Map<Rank, Card[]>();
  for (const c of hand) {
    if (isJoker(c)) continue;
    const arr = byRank.get(c.rank) ?? [];
    arr.push(c);
    byRank.set(c.rank, arr);
  }
  const sets: Card[][] = [];
  for (const cards of byRank.values()) {
    if (cards.length >= 3) {
      // unique-suit subsets
      const bySuit = new Map<Suit, Card>();
      for (const c of cards) if (!bySuit.has(c.suit)) bySuit.set(c.suit, c);
      const uniq = [...bySuit.values()];
      if (uniq.length >= 3) {
        sets.push(uniq.slice(0, 3));
        if (uniq.length >= 4) sets.push(uniq.slice(0, 4));
      }
    }
  }
  return sets;
}

function runsOf(hand: Card[]): Card[][] {
  const bySuit = new Map<Suit, Card[]>();
  for (const c of hand) {
    if (isJoker(c)) continue;
    const arr = bySuit.get(c.suit) ?? [];
    arr.push(c);
    bySuit.set(c.suit, arr);
  }
  const runs: Card[][] = [];
  for (const cards of bySuit.values()) {
    // dedupe ranks
    const seen = new Set<Rank>();
    const uniq = cards.filter(c => (seen.has(c.rank) ? false : (seen.add(c.rank), true)));
    const sorted = [...uniq].sort((a, b) => a.rank - b.rank);
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 2; j < sorted.length; j++) {
        let consecutive = true;
        for (let k = i; k < j; k++) {
          if (sorted[k + 1]!.rank !== sorted[k]!.rank + 1) { consecutive = false; break; }
        }
        if (consecutive) runs.push(sorted.slice(i, j + 1));
      }
    }
  }
  return runs;
}

export function detectMelds(hand: readonly Card[]): MeldResult {
  const h = [...hand];
  if (h.length === 0) return { melds: [], deadwood: [], deadwoodValue: 0 };

  const candidates: Card[][] = [...setsOf(h), ...runsOf(h)];

  let bestMelds: Card[][] = [];
  let bestDeadwoodValue = h.reduce((s, c) => s + cardValue(c.rank), 0);

  function tryMeld(chosen: Card[][], candIdx: number): void {
    const usedIds = new Set(chosen.flatMap(m => m.map(c => c.id)));
    const dw = h.filter(c => !usedIds.has(c.id));
    const dwVal = dw.reduce((s, c) => s + cardValue(c.rank), 0);
    if (dwVal < bestDeadwoodValue) {
      bestDeadwoodValue = dwVal;
      bestMelds = chosen.map(m => [...m]);
    }
    if (dwVal === 0) return;

    // bound the recursion depth for performance
    if (chosen.length >= 6) return;

    for (let i = candIdx; i < Math.min(candidates.length, 60); i++) {
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

// ── Phase / state ──────────────────────────────────────────────────────────

export type RummyPhase = "player-draw" | "player-discard" | "bot-turn" | "done";

export interface RummyState {
  cfg: RummyConfig;
  rngSeed: number;
  playerHand: readonly Card[];
  botHand: readonly Card[];
  stock: readonly Card[];
  discardPile: readonly Card[];
  phase: RummyPhase;
  knocker: "player" | "bot" | null;
  playerMelds: Card[][];
  botMelds: Card[][];
  finalScore: number | null; // positive: player wins, negative: bot wins
  message: string;
}

export type RummyAction =
  | { type: "draw"; from: "stock" | "discard" }
  | { type: "discard"; cardId: string }
  | { type: "knock" };

// ── Bot logic ───────────────────────────────────────────────────────────────

function botTurn(state: RummyState, rng: () => number): RummyState {
  let stock = [...state.stock];
  let discardPile = [...state.discardPile];

  // Reshuffle if needed
  if (stock.length === 0 && discardPile.length > 1) {
    const top = discardPile.pop()!;
    stock = shuffle(discardPile, rng);
    discardPile = [top];
  }
  if (stock.length === 0) {
    return { ...state, phase: "done", finalScore: 0, message: "Stock exhausted — draw." };
  }

  // Hard heuristic: try discard if it helps; else stock
  const top = discardPile[discardPile.length - 1];
  let drawFromDiscard = false;
  if (top) {
    const before = detectMelds(state.botHand).deadwoodValue;
    const after = detectMelds([...state.botHand, top]).deadwoodValue;
    if (after < before) drawFromDiscard = true;
  }

  let botHand: Card[];
  if (drawFromDiscard && top) {
    botHand = [...state.botHand, top];
    discardPile.pop();
  } else {
    const drawn = stock.shift()!;
    botHand = [...state.botHand, drawn];
  }

  // Choose discard: highest value deadwood
  const { deadwood } = detectMelds(botHand);
  const candidates = deadwood.length > 0 ? deadwood : [...botHand];
  const toDiscard = candidates.reduce((hi, c) => cardValue(c.rank) > cardValue(hi.rank) ? c : hi);
  botHand = botHand.filter(c => c.id !== toDiscard.id);
  discardPile.push(toDiscard);

  // Check knock
  const result = detectMelds(botHand);
  if (result.deadwoodValue === 0) {
    const playerResult = detectMelds(state.playerHand);
    const score = -(state.cfg.ginBonus + playerResult.deadwoodValue);
    return {
      ...state, botHand, stock, discardPile,
      phase: "done", knocker: "bot",
      botMelds: result.melds, playerMelds: playerResult.melds,
      finalScore: score,
      message: `Bot got Gin! Bot wins ${-score}.`,
    };
  }
  if (result.deadwoodValue <= state.cfg.knockLimit && rng() < 0.4) {
    const playerResult = detectMelds(state.playerHand);
    const diff = playerResult.deadwoodValue - result.deadwoodValue;
    if (diff > 0) {
      return {
        ...state, botHand, stock, discardPile,
        phase: "done", knocker: "bot",
        botMelds: result.melds, playerMelds: playerResult.melds,
        finalScore: -diff,
        message: `Bot knocked! Bot wins ${diff}.`,
      };
    } else {
      // undercut
      const score = state.cfg.undercutBonus + (result.deadwoodValue - playerResult.deadwoodValue);
      return {
        ...state, botHand, stock, discardPile,
        phase: "done", knocker: "bot",
        botMelds: result.melds, playerMelds: playerResult.melds,
        finalScore: score,
        message: `Undercut! You win ${score}.`,
      };
    }
  }

  return {
    ...state,
    botHand, stock, discardPile,
    phase: "player-draw",
    message: "Your turn — draw from stock or discard.",
  };
}

// ── Reducer ─────────────────────────────────────────────────────────────────

export function rummyReducer(state: RummyState, action: RummyAction): RummyState {
  if (state.phase === "done") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  if (action.type === "draw" && state.phase === "player-draw") {
    let stock = [...state.stock];
    let discardPile = [...state.discardPile];
    if (action.from === "stock") {
      if (stock.length === 0 && discardPile.length > 1) {
        const top = discardPile.pop()!;
        stock = shuffle(discardPile, rng);
        discardPile = [top];
      }
      if (stock.length === 0) return state;
      const drawn = stock.shift()!;
      return {
        ...state, rngSeed: nextSeed,
        playerHand: [...state.playerHand, drawn],
        stock, discardPile,
        phase: "player-discard",
        message: "Choose a card to discard, or knock.",
      };
    } else {
      if (discardPile.length === 0) return state;
      const drawn = discardPile.pop()!;
      return {
        ...state, rngSeed: nextSeed,
        playerHand: [...state.playerHand, drawn],
        discardPile,
        phase: "player-discard",
        message: "Choose a card to discard, or knock.",
      };
    }
  }

  if (action.type === "discard" && state.phase === "player-discard") {
    const card = state.playerHand.find(c => c.id === action.cardId);
    if (!card) return state;
    const playerHand = state.playerHand.filter(c => c.id !== action.cardId);
    const discardPile = [...state.discardPile, card];
    let next: RummyState = { ...state, rngSeed: nextSeed, playerHand, discardPile, phase: "bot-turn", message: "Bot thinking…" };
    next = botTurn(next, mulberry32(nextSeed));
    return next;
  }

  if (action.type === "knock" && state.phase === "player-discard") {
    const playerResult = detectMelds(state.playerHand);
    if (playerResult.deadwoodValue > state.cfg.knockLimit) return state;
    const botResult = detectMelds(state.botHand);
    const diff = botResult.deadwoodValue - playerResult.deadwoodValue;
    const isGin = playerResult.deadwoodValue === 0;
    let score = diff;
    if (isGin) score += state.cfg.ginBonus;
    if (diff < 0) {
      // undercut: opponent wins
      score = -(state.cfg.undercutBonus - diff);
    }
    const message = isGin
      ? `Gin! You win ${score}.`
      : diff < 0
        ? `Undercut! Bot wins ${-score}.`
        : `You knocked. You win ${score}.`;
    return {
      ...state, rngSeed: nextSeed,
      phase: "done", knocker: "player",
      playerMelds: playerResult.melds,
      botMelds: botResult.melds,
      finalScore: score,
      message,
    };
  }

  return state;
}

// ── initial / terminal ─────────────────────────────────────────────────────

export function rummyInitial(seed: number, cfg: RummyConfig): RummyState {
  const rng = mulberry32(seed);
  const dealRng = mulberry32(Math.floor(rng() * 2 ** 31));
  const deck = shuffle(buildDeck(cfg), dealRng);
  const playerHand = deck.slice(0, cfg.handSize);
  const botHand = deck.slice(cfg.handSize, cfg.handSize * 2);
  const discardPile = deck.length > cfg.handSize * 2 ? [deck[cfg.handSize * 2]!] : [];
  const stock = deck.slice(cfg.handSize * 2 + 1);
  return {
    cfg, rngSeed: Math.floor(dealRng() * 2 ** 31),
    playerHand, botHand, stock, discardPile,
    phase: "player-draw",
    knocker: null,
    playerMelds: [], botMelds: [],
    finalScore: null,
    message: "Your turn — draw from stock or discard.",
  };
}

export function rummyTerminal(state: RummyState): { score: number } | null {
  if (state.phase !== "done" || state.finalScore === null) return null;
  return { score: Math.max(0, Math.min(100, 50 + state.finalScore)) };
}

export { rankLabel };
