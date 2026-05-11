// Shared shedding-game engine — heads-up vs CPU.
// Players race to empty their hand by playing cards on a pile.
import type { Card, Rank, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle, rankLabel } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SheddingConfig {
  /** Cards dealt to each player at start */
  handSize: number;
  /** Number of 52-card decks */
  deckCopies: number;
  /** Add 2 jokers per deck (wild) */
  withJokers: boolean;
  /** Match by rank or suit (Crazy Eights / Mau-Mau / Switch) */
  matchMode: "rank-or-suit" | "rank-only" | "suit-only" | "climb-up";
  /** Wild rank — when played, player picks new suit (8 in Crazy Eights, J in Mau-Mau) */
  wildRank: Rank | null;
  /** Card that forces opponent to draw N (German variants — 7, A, etc) */
  drawCard: { rank: Rank; count: number } | null;
  /** Card that skips opponent's turn */
  skipCard: Rank | null;
  /** Card that reverses direction (only matters in 3+ player; here used as skip) */
  reverseCard: Rank | null;
  /** "climb-up" mode: must play strictly higher rank than top */
  climbAces: "high" | "low";
  /** If opponent can't play, they draw N from stock; if still can't, pass */
  drawOnNoPlay: number;
}

export const DEFAULT_SHED: SheddingConfig = {
  handSize: 7,
  deckCopies: 1,
  withJokers: false,
  matchMode: "rank-or-suit",
  wildRank: 8,
  drawCard: null,
  skipCard: null,
  reverseCard: null,
  climbAces: "high",
  drawOnNoPlay: 1,
};

export function buildShedDeck(cfg: SheddingConfig): Card[] {
  const cards = newDeck(cfg.deckCopies);
  if (cfg.withJokers) {
    for (let c = 0; c < cfg.deckCopies; c++) {
      cards.push({ suit: "♠", rank: 13, id: `joker-${c}-A` } as Card);
      cards.push({ suit: "♥", rank: 13, id: `joker-${c}-B` } as Card);
    }
  }
  return cards;
}

export type SheddingPhase = "player" | "bot" | "choose-suit" | "done";

export interface SheddingState {
  cfg: SheddingConfig;
  rngSeed: number;
  playerHand: readonly Card[];
  botHand: readonly Card[];
  stock: readonly Card[];
  pile: readonly Card[]; // top is last element
  /** Current effective suit (override from wild) */
  activeSuit: Suit | null;
  /** Current effective rank (top of pile or override) */
  activeRank: Rank | null;
  phase: SheddingPhase;
  /** Pending draw count (e.g., +2 stacking) */
  pendingDraw: number;
  /** Pending wild card waiting for suit choice */
  pendingWild: Card | null;
  winner: "player" | "bot" | null;
  message: string;
}

export type SheddingAction =
  | { type: "play"; cardId: string }
  | { type: "draw" }
  | { type: "pick-suit"; suit: Suit }
  | { type: "pass" };

// ── Match logic ─────────────────────────────────────────────────────────────

export function canPlay(card: Card, state: SheddingState): boolean {
  const cfg = state.cfg;
  if (cfg.wildRank !== null && card.rank === cfg.wildRank) return true;

  // If pending draw stack: only matching draw card can stack
  if (state.pendingDraw > 0 && cfg.drawCard) {
    return card.rank === cfg.drawCard.rank;
  }

  const top = state.pile[state.pile.length - 1];
  if (!top) return true;

  switch (cfg.matchMode) {
    case "rank-or-suit":
      return card.rank === (state.activeRank ?? top.rank) || card.suit === (state.activeSuit ?? top.suit);
    case "rank-only":
      return card.rank === (state.activeRank ?? top.rank);
    case "suit-only":
      return card.suit === (state.activeSuit ?? top.suit);
    case "climb-up": {
      const tr = state.activeRank ?? top.rank;
      if (cfg.climbAces === "low") return card.rank > tr || card.rank === 1;
      return card.rank >= tr;
    }
  }
}

// ── Bot logic ───────────────────────────────────────────────────────────────

function botPick(hand: readonly Card[], state: SheddingState): Card | null {
  for (const c of hand) {
    if (canPlay(c, state)) return c;
  }
  return null;
}

// ── Reducer ─────────────────────────────────────────────────────────────────

function reshuffleIfNeeded(state: SheddingState, rng: () => number): { stock: Card[]; pile: Card[] } {
  let stock = [...state.stock];
  let pile = [...state.pile];
  if (stock.length === 0 && pile.length > 1) {
    const top = pile.pop()!;
    stock = shuffle(pile, rng);
    pile = [top];
  }
  return { stock, pile };
}

export function shedReducer(state: SheddingState, action: SheddingAction): SheddingState {
  if (state.phase === "done") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  if (state.phase === "choose-suit" && action.type === "pick-suit") {
    return runBot({
      ...state, rngSeed: nextSeed,
      activeSuit: action.suit,
      pendingWild: null,
      phase: "bot",
      message: `You chose ${action.suit}.`,
    });
  }

  if (state.phase !== "player") return state;

  if (action.type === "play") {
    const card = state.playerHand.find(c => c.id === action.cardId);
    if (!card) return state;
    if (!canPlay(card, state)) return state;

    const newHand = state.playerHand.filter(c => c.id !== action.cardId);
    const newPile = [...state.pile, card];
    let activeSuit: Suit = card.suit;
    let activeRank: Rank = card.rank;
    let pendingDraw = state.pendingDraw;

    // Apply effects
    const cfg = state.cfg;
    if (cfg.drawCard && card.rank === cfg.drawCard.rank) {
      pendingDraw += cfg.drawCard.count;
    }
    if (cfg.wildRank !== null && card.rank === cfg.wildRank) {
      // Player must choose a suit
      if (newHand.length === 0) {
        return {
          ...state, rngSeed: nextSeed,
          playerHand: newHand, pile: newPile,
          phase: "done", winner: "player",
          message: "You went out!",
        };
      }
      return {
        ...state, rngSeed: nextSeed,
        playerHand: newHand, pile: newPile,
        pendingWild: card,
        phase: "choose-suit",
        message: "Pick a suit.",
      };
    }

    if (newHand.length === 0) {
      return {
        ...state, rngSeed: nextSeed,
        playerHand: newHand, pile: newPile,
        activeSuit, activeRank, pendingDraw,
        phase: "done", winner: "player",
        message: "You went out!",
      };
    }

    let next: SheddingState = {
      ...state, rngSeed: nextSeed,
      playerHand: newHand, pile: newPile,
      activeSuit, activeRank, pendingDraw,
      phase: cfg.skipCard !== null && card.rank === cfg.skipCard ? "player" : "bot",
      message: cfg.skipCard !== null && card.rank === cfg.skipCard ? "Bot skipped! Play again." : "Bot's turn.",
    };

    if (next.phase === "bot") next = runBot(next);
    return next;
  }

  if (action.type === "draw") {
    const { stock, pile } = reshuffleIfNeeded(state, rng);
    if (stock.length === 0) {
      // pass
      let next: SheddingState = { ...state, rngSeed: nextSeed, phase: "bot" as const, message: "No cards to draw — pass." };
      next = runBot(next);
      return next;
    }
    const drawCount = state.pendingDraw > 0 ? state.pendingDraw : state.cfg.drawOnNoPlay;
    const drawn = stock.slice(0, drawCount);
    const newHand = [...state.playerHand, ...drawn];
    const remaining = stock.slice(drawCount);
    let next: SheddingState = {
      ...state, rngSeed: nextSeed,
      playerHand: newHand, stock: remaining, pile,
      pendingDraw: 0,
      phase: "bot",
      message: `You drew ${drawn.length}.`,
    };
    next = runBot(next);
    return next;
  }

  if (action.type === "pass") {
    let next: SheddingState = { ...state, rngSeed: nextSeed, phase: "bot", message: "You pass." };
    next = runBot(next);
    return next;
  }

  return state;
}

function runBot(state: SheddingState): SheddingState {
  if (state.phase !== "bot") return state;
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const cfg = state.cfg;

  const pick = botPick(state.botHand, state);
  if (pick) {
    const newHand = state.botHand.filter(c => c.id !== pick.id);
    const newPile = [...state.pile, pick];
    let activeSuit: Suit = pick.suit;
    let activeRank: Rank = pick.rank;
    let pendingDraw = state.pendingDraw;

    if (cfg.drawCard && pick.rank === cfg.drawCard.rank) {
      pendingDraw += cfg.drawCard.count;
    }
    if (cfg.wildRank !== null && pick.rank === cfg.wildRank) {
      // Bot picks the suit it has most of
      const counts: Record<Suit, number> = { "♠": 0, "♥": 0, "♦": 0, "♣": 0 };
      for (const c of newHand) counts[c.suit]++;
      const best = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "♠") as Suit;
      activeSuit = best;
    }

    if (newHand.length === 0) {
      return {
        ...state, rngSeed: nextSeed,
        botHand: newHand, pile: newPile,
        activeSuit, activeRank, pendingDraw,
        phase: "done", winner: "bot",
        message: "Bot went out! You lose.",
      };
    }

    return {
      ...state, rngSeed: nextSeed,
      botHand: newHand, pile: newPile,
      activeSuit, activeRank, pendingDraw,
      phase: cfg.skipCard !== null && pick.rank === cfg.skipCard ? "bot" : "player",
      message: `Bot played ${rankLabel(pick.rank)}${pick.suit}.`,
    };
  }

  // Bot can't play — draw
  const { stock, pile } = reshuffleIfNeeded(state, rng);
  if (stock.length === 0) {
    return { ...state, rngSeed: nextSeed, phase: "player", message: "Bot passed. Your turn." };
  }
  const drawCount = state.pendingDraw > 0 ? state.pendingDraw : cfg.drawOnNoPlay;
  const drawn = stock.slice(0, drawCount);
  const newHand = [...state.botHand, ...drawn];
  const remaining = stock.slice(drawCount);

  // Try playing again
  const after: SheddingState = {
    ...state, rngSeed: nextSeed,
    botHand: newHand, stock: remaining, pile,
    pendingDraw: 0,
    phase: "bot",
    message: `Bot drew ${drawn.length}.`,
  };
  const pick2 = botPick(newHand, after);
  if (pick2) return runBot(after);
  return { ...after, phase: "player", message: `Bot drew ${drawn.length}, can't play.` };
}

// ── initial / terminal ─────────────────────────────────────────────────────

export function shedInitial(seed: number, cfg: SheddingConfig): SheddingState {
  const rng = mulberry32(seed);
  const dealRng = mulberry32(Math.floor(rng() * 2 ** 31));
  const deck = shuffle(buildShedDeck(cfg), dealRng);
  const playerHand = deck.slice(0, cfg.handSize);
  const botHand = deck.slice(cfg.handSize, cfg.handSize * 2);
  let pileStart = cfg.handSize * 2;
  // Find a non-wild card to start the pile
  let pileCard = deck[pileStart]!;
  while (pileCard && cfg.wildRank !== null && pileCard.rank === cfg.wildRank && pileStart < deck.length - 1) {
    pileStart++;
    pileCard = deck[pileStart]!;
  }
  const pile = pileCard ? [pileCard] : [];
  const stock = deck.slice(pileStart + 1);
  return {
    cfg, rngSeed: Math.floor(dealRng() * 2 ** 31),
    playerHand, botHand, stock, pile,
    activeSuit: pileCard?.suit ?? null,
    activeRank: pileCard?.rank ?? null,
    phase: "player",
    pendingDraw: 0,
    pendingWild: null,
    winner: null,
    message: "Your turn.",
  };
}

export function shedTerminal(state: SheddingState): { score: number } | null {
  if (state.phase !== "done") return null;
  if (state.winner === "player") return { score: 100 };
  if (state.winner === "bot") return { score: 0 };
  return { score: 50 };
}

export { rankLabel };
