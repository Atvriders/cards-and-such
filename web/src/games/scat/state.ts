import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Scat (31) — 3-player (you + 2 bots), 3-card hand.
// Draw stock or discard-top; discard one. Goal: 31 in one suit (A+10+face=31).
// Three-of-a-kind = 30.5. Knock when happy; all others get one more turn, then lowest out.

export interface ScatSettings {
  placeholder: "none";
}

export type ScatPhase =
  | "player-turn"   // player decides: draw-stock, draw-discard, knock
  | "player-discard" // player must discard after drawing
  | "post-knock"     // bots get one more turn, then reveal
  | "done";

export interface ScatState {
  settings: ScatSettings;
  rngSeed: number;
  hands: readonly (readonly Card[])[];  // [player, bot1, bot2]
  stock: readonly Card[];
  discardPile: readonly Card[];         // top = last element
  phase: ScatPhase;
  knockSeat: number;                    // -1 if nobody knocked
  postKnockTurns: number;              // bots remaining after knock
  drawnCard: Card | null;              // card player just drew (waiting to discard)
  drawnFrom: "stock" | "discard" | null;
  scores: readonly number[];
  message: string;
  lives: readonly number[];            // lives; starts at 3 each; lose 1 each round you're lowest
}

export type ScatAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "knock" }
  | { type: "discard"; cardId: string };

// ── helpers ──────────────────────────────────────────────────────────────────

function cardValue(card: Card): number {
  if (card.rank === 1) return 11; // Ace = 11
  if (card.rank >= 10) return 10; // 10, J, Q, K = 10
  return card.rank;
}

export function handScore(hand: readonly Card[]): number {
  if (hand.length !== 3) return 0;
  // Three of a kind = 30.5
  if (hand[0]!.rank === hand[1]!.rank && hand[1]!.rank === hand[2]!.rank) return 30.5;
  // Best single suit
  const suits = ["♠", "♥", "♦", "♣"] as const;
  let best = 0;
  for (const s of suits) {
    const total = hand.filter(c => c.suit === s).reduce((acc, c) => acc + cardValue(c), 0);
    if (total > best) best = total;
  }
  return best;
}

function botDecide(state: ScatState, seat: number): "draw-stock" | "draw-discard" | "knock" {
  const hand = state.hands[seat]!;
  const score = handScore(hand);
  if (score >= 28) return "knock";

  const top = state.discardPile[state.discardPile.length - 1];
  if (top) {
    // Simulate adding discard top
    for (let i = 0; i < 3; i++) {
      const testHand = hand.map((c, j) => j === i ? top : c);
      if (handScore(testHand) > score) return "draw-discard";
    }
  }
  return "draw-stock";
}

function botDiscard(hand: readonly Card[], drawn: Card): Card {
  // Discard the card that minimizes the resulting hand score loss
  const withDrawn = [...hand, drawn];
  let worstIdx = 0;
  let bestScore = -1;
  for (let i = 0; i < withDrawn.length; i++) {
    const testHand = withDrawn.filter((_, j) => j !== i);
    const s = handScore(testHand);
    if (s > bestScore) {
      bestScore = s;
      worstIdx = i;
    }
  }
  return withDrawn[worstIdx]!;
}

function resolveBotTurn(state: ScatState, seat: number, rng: () => number): ScatState {
  const decision = botDecide(state, seat);
  let s = { ...state };

  if (decision === "knock") {
    s = { ...s, knockSeat: seat, phase: "done", message: `Bot ${seat} knocked! Revealing hands...` };
    return finalizeScores(s);
  }

  let drawn: Card;
  if (decision === "draw-discard" && s.discardPile.length > 0) {
    drawn = s.discardPile[s.discardPile.length - 1]!;
    s = { ...s, discardPile: s.discardPile.slice(0, -1) };
  } else if (s.stock.length > 0) {
    drawn = s.stock[s.stock.length - 1]!;
    s = { ...s, stock: s.stock.slice(0, -1) };
  } else {
    return s; // empty stock — skip
  }

  void rng;
  const hand = s.hands[seat]!;
  const toDiscard = botDiscard(hand, drawn);
  const newHand = [...hand, drawn].filter(c => c.id !== toDiscard.id);
  s = {
    ...s,
    hands: s.hands.map((h, i) => i === seat ? newHand : h),
    discardPile: [...s.discardPile, toDiscard],
  };
  return s;
}

function finalizeScores(state: ScatState): ScatState {
  const scores = state.hands.map(h => handScore(h));
  const minScore = Math.min(...scores);
  const newLives = state.lives.map((l, i) => {
    if (scores[i] === minScore) return l - 1;
    return l;
  });
  const anyDead = newLives.some(l => l <= 0);
  return {
    ...state,
    scores: scores.map((_, i) => scores[i]!),
    lives: newLives,
    phase: "done",
    message: `Scores: You ${scores[0]!.toFixed(1)}, Bot1 ${scores[1]!.toFixed(1)}, Bot2 ${scores[2]!.toFixed(1)}. ${anyDead ? "Someone eliminated!" : ""}`,
  };
}

// ── reducer ───────────────────────────────────────────────────────────────────

export function reducer(state: ScatState, action: ScatAction): ScatState {
  if (state.phase === "done") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const botRng = mulberry32(nextSeed);
  let s: ScatState = { ...state, rngSeed: nextSeed };

  if (state.phase === "player-discard") {
    if (action.type !== "discard") return state;
    const card = s.hands[0]!.find(c => c.id === action.cardId) ?? s.drawnCard;
    if (!card) return state;
    // Remove from hand (drawn card might not be in hand yet)
    const handWithDrawn = s.drawnCard && !s.hands[0]!.find(c => c.id === s.drawnCard!.id)
      ? [...s.hands[0]!, s.drawnCard]
      : [...s.hands[0]!];
    const newHand = handWithDrawn.filter(c => c.id !== card.id);
    if (newHand.length !== 3) return state;
    s = {
      ...s,
      hands: s.hands.map((h, i) => i === 0 ? newHand : h),
      discardPile: [...s.discardPile, card],
      drawnCard: null,
      drawnFrom: null,
    };

    // Check post-knock
    if (s.knockSeat >= 0) {
      // It's post-knock; player had one final turn
      return finalizeScores({ ...s, phase: "done" });
    }

    // Bots take turns
    s = resolveBotTurn(s, 1, botRng);
    if (s.phase === "done") return s;
    s = resolveBotTurn(s, 2, botRng);
    if (s.phase === "done") return s;

    // Check stock empty
    if (s.stock.length === 0) {
      return finalizeScores({ ...s, phase: "done", message: "Stock empty!" });
    }

    return { ...s, phase: "player-turn", message: "Your turn: draw or knock." };
  }

  if (state.phase === "player-turn") {
    if (action.type === "knock") {
      s = { ...s, knockSeat: 0 };
      // Bots get one more turn each
      s = resolveBotTurn(s, 1, botRng);
      if (s.phase === "done") return s;
      s = resolveBotTurn(s, 2, botRng);
      return finalizeScores({ ...s, phase: "done" });
    }

    if (action.type === "draw-stock") {
      if (s.stock.length === 0) return { ...s, message: "Stock is empty!" };
      const drawn = s.stock[s.stock.length - 1]!;
      s = {
        ...s,
        stock: s.stock.slice(0, -1),
        drawnCard: drawn,
        drawnFrom: "stock",
        phase: "player-discard",
        message: `Drew ${drawn.rank >= 10 ? (drawn.rank === 1 ? "A" : drawn.rank === 11 ? "J" : drawn.rank === 12 ? "Q" : "K") : drawn.rank}${drawn.suit}. Discard a card.`,
      };
      return s;
    }

    if (action.type === "draw-discard") {
      if (s.discardPile.length === 0) return { ...s, message: "Discard pile is empty!" };
      const drawn = s.discardPile[s.discardPile.length - 1]!;
      s = {
        ...s,
        discardPile: s.discardPile.slice(0, -1),
        drawnCard: drawn,
        drawnFrom: "discard",
        phase: "player-discard",
        message: `Took ${drawn.rank >= 10 ? (drawn.rank === 1 ? "A" : drawn.rank === 11 ? "J" : drawn.rank === 12 ? "Q" : "K") : drawn.rank}${drawn.suit} from discard. Choose a card to discard.`,
      };
      return s;
    }
  }

  if (state.phase === "post-knock") {
    // Should have been handled above
    return state;
  }

  return state;
}

// ── initialState ──────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: ScatSettings): ScatState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);

  const deck = shuffle(newDeck(), dealRng);
  const hands: Card[][] = [
    deck.slice(0, 3),
    deck.slice(3, 6),
    deck.slice(6, 9),
  ];
  const discard = deck[9]!;
  const stock = deck.slice(10).reverse(); // top = last

  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    hands,
    stock,
    discardPile: [discard],
    phase: "player-turn",
    knockSeat: -1,
    postKnockTurns: 0,
    drawnCard: null,
    drawnFrom: null,
    scores: [0, 0, 0],
    message: "Draw from stock or discard, then discard one. Knock when ready!",
    lives: [3, 3, 3],
  };
}

// ── isTerminal ────────────────────────────────────────────────────────────────

export function isTerminal(state: ScatState): { score: number } | null {
  if (state.phase !== "done") return null;
  const playerLives = state.lives[0] ?? 0;
  if (playerLives <= 0) return { score: 0 };
  const botsDead = state.lives.slice(1).filter(l => l <= 0).length;
  if (botsDead >= 2) return { score: 100 };
  // Score based on hand quality
  const handSc = state.scores[0] ?? 0;
  const maxPossible = 31;
  return { score: Math.round((handSc / maxPossible) * 80 + 10) };
}
