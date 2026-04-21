import type { Card, Rank, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface GinRummySettings {
  botDifficulty: "easy" | "hard";
}

export type Phase =
  | "player-draw"    // player must draw from stock or discard
  | "player-discard" // player must discard
  | "bot-turn"       // bot's turn (auto-resolved)
  | "knocked"        // someone knocked, opponent laying off
  | "done";          // hand over

export interface MeldResult {
  melds: Card[][];
  deadwood: Card[];
  deadwoodValue: number;
}

export interface GinRummyState {
  settings: GinRummySettings;
  rngSeed: number;
  playerHand: readonly Card[];
  botHand: readonly Card[];
  stock: readonly Card[];
  discardPile: readonly Card[];
  phase: Phase;
  drawnCard: Card | null;        // card just drawn, held separately during draw phase
  knocker: "player" | "bot" | null;
  playerMelds: Card[][];
  botMelds: Card[][];
  playerDeadwood: Card[];
  botDeadwood: Card[];
  finalScore: number | null;    // positive = player wins, negative = bot wins
  message: string;
}

export type GinRummyAction =
  | { type: "draw"; from: "stock" | "discard" }
  | { type: "discard"; cardId: string }
  | { type: "knock" };

// ── Meld detection ──────────────────────────────────────────────────────────

export function cardValue(rank: Rank): number {
  if (rank === 1) return 1;
  if (rank >= 11) return 10;
  return rank;
}

function rankOrder(rank: Rank): number {
  return rank; // 1=Ace low
}

function setsOf(hand: Card[]): Card[][] {
  const byRank = new Map<Rank, Card[]>();
  for (const c of hand) {
    const arr = byRank.get(c.rank) ?? [];
    arr.push(c);
    byRank.set(c.rank, arr);
  }
  const sets: Card[][] = [];
  for (const cards of byRank.values()) {
    if (cards.length >= 3) {
      sets.push(cards.slice(0, 3));
      if (cards.length === 4) sets.push(cards.slice(0, 4));
    }
  }
  return sets;
}

function runsOf(hand: Card[]): Card[][] {
  const bySuit = new Map<Suit, Card[]>();
  for (const c of hand) {
    const arr = bySuit.get(c.suit) ?? [];
    arr.push(c);
    bySuit.set(c.suit, arr);
  }
  const runs: Card[][] = [];
  for (const cards of bySuit.values()) {
    const sorted = [...cards].sort((a, b) => rankOrder(a.rank) - rankOrder(b.rank));
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 2; j < sorted.length; j++) {
        // Check if sorted[i..j] is consecutive
        let consecutive = true;
        for (let k = i; k < j; k++) {
          if (rankOrder(sorted[k + 1]!.rank) !== rankOrder(sorted[k]!.rank) + 1) {
            consecutive = false;
            break;
          }
        }
        if (consecutive) {
          runs.push(sorted.slice(i, j + 1));
        }
      }
    }
  }
  return runs;
}

export function detectMelds(hand: readonly Card[]): MeldResult {
  const h = [...hand];
  if (h.length === 0) return { melds: [], deadwood: [], deadwoodValue: 0 };

  // Enumerate candidate melds: sets of 3, sets of 4, runs of 3+
  const candidates: Card[][] = [...setsOf(h), ...runsOf(h)];

  // Greedy: try all combinations of non-overlapping melds, pick best
  let bestMelds: Card[][] = [];
  let bestDeadwoodValue = h.reduce((s, c) => s + cardValue(c.rank), 0);

  function tryMeld(
    remaining: Card[],
    chosen: Card[][],
    candIdx: number,
  ): void {
    // Compute current deadwood
    const usedIds = new Set(chosen.flatMap(m => m.map(c => c.id)));
    const dw = remaining.filter(c => !usedIds.has(c.id));
    const dwVal = dw.reduce((s, c) => s + cardValue(c.rank), 0);
    if (dwVal < bestDeadwoodValue) {
      bestDeadwoodValue = dwVal;
      bestMelds = chosen.map(m => [...m]);
    }
    if (dwVal === 0) return;

    for (let i = candIdx; i < candidates.length; i++) {
      const cand = candidates[i]!;
      // Check no overlap with chosen
      const overlap = cand.some(c => usedIds.has(c.id));
      if (!overlap) {
        tryMeld(remaining, [...chosen, cand], i + 1);
      }
    }
  }

  tryMeld(h, [], 0);

  const meldedIds = new Set(bestMelds.flatMap(m => m.map(c => c.id)));
  const deadwood = h.filter(c => !meldedIds.has(c.id));

  return {
    melds: bestMelds,
    deadwood,
    deadwoodValue: bestDeadwoodValue,
  };
}

// ── Lay-off helper ──────────────────────────────────────────────────────────

export function layOff(deadwood: Card[], melds: Card[][]): { remaining: Card[]; newMelds: Card[][] } {
  let remaining = [...deadwood];
  const newMelds = melds.map(m => [...m]);

  let changed = true;
  while (changed) {
    changed = false;
    for (let mi = 0; mi < newMelds.length; mi++) {
      const meld = newMelds[mi]!;
      for (let di = remaining.length - 1; di >= 0; di--) {
        const c = remaining[di]!;
        if (canLayOff(c, meld)) {
          newMelds[mi] = [...meld, c];
          remaining.splice(di, 1);
          changed = true;
        }
      }
    }
  }
  return { remaining, newMelds };
}

function canLayOff(card: Card, meld: Card[]): boolean {
  if (meld.length === 0) return false;
  // Check if it's a set meld
  const allSameRank = meld.every(c => c.rank === meld[0]!.rank);
  if (allSameRank && meld[0]!.rank === card.rank) {
    // Set: add if rank matches and suit not already present
    return !meld.some(c => c.suit === card.suit);
  }
  // Check if run
  const allSameSuit = meld.every(c => c.suit === meld[0]!.suit);
  if (allSameSuit && card.suit === meld[0]!.suit) {
    const ranks = meld.map(c => c.rank).sort((a, b) => a - b);
    const minR = ranks[0]!;
    const maxR = ranks[ranks.length - 1]!;
    return card.rank === minR - 1 || card.rank === maxR + 1;
  }
  return false;
}

// ── Bot logic ───────────────────────────────────────────────────────────────

function botDraw(state: GinRummyState, rng: () => number): "stock" | "discard" {
  if (state.discardPile.length === 0) return "stock";
  const topDiscard = state.discardPile[state.discardPile.length - 1]!;
  // Hard: pick up discard if it reduces deadwood
  if (state.settings.botDifficulty === "hard") {
    const withDiscard = [...state.botHand, topDiscard];
    const withoutDiscard = [...state.botHand];
    const meldWith = detectMelds(withDiscard).deadwoodValue;
    const meldWithout = detectMelds(withoutDiscard).deadwoodValue;
    return meldWith < meldWithout ? "discard" : "stock";
  }
  // Easy: random
  return rng() < 0.3 ? "discard" : "stock";
}

function botDiscard(hand: readonly Card[]): Card {
  const { deadwood } = detectMelds(hand);
  if (deadwood.length > 0) {
    // Discard highest-value deadwood card
    return deadwood.reduce((hi, c) => cardValue(c.rank) > cardValue(hi.rank) ? c : hi);
  }
  // All in melds — discard any (pick highest value)
  return [...hand].reduce((hi, c) => cardValue(c.rank) > cardValue(hi.rank) ? c : hi);
}

// ── Bot turn ────────────────────────────────────────────────────────────────

function runBotTurn(state: GinRummyState, rng: () => number): GinRummyState {
  // Draw
  const from = botDraw(state, rng);
  let botHand: Card[];
  let stock = [...state.stock];
  let discardPile = [...state.discardPile];

  if (from === "stock") {
    if (stock.length === 0) {
      // Reshuffle discard (leave top)
      const top = discardPile.pop()!;
      stock = shuffle(discardPile, rng);
      discardPile = [top];
    }
    const drawn = stock.shift()!;
    botHand = [...state.botHand, drawn];
  } else {
    const drawn = discardPile.pop()!;
    botHand = [...state.botHand, drawn];
  }

  // Discard
  const toDiscard = botDiscard(botHand);
  botHand = botHand.filter(c => c.id !== toDiscard.id);
  discardPile.push(toDiscard);

  // Check knock
  const { deadwoodValue } = detectMelds(botHand);
  if (deadwoodValue === 0) {
    // Bot has gin — knock automatically
    const playerResult = detectMelds(state.playerHand);
    const botResult = detectMelds(botHand);
    const finalScore = computeKnockScore("bot", botResult.deadwoodValue, playerResult.deadwoodValue);
    return {
      ...state,
      botHand,
      stock,
      discardPile,
      phase: "done",
      knocker: "bot",
      botMelds: botResult.melds,
      botDeadwood: botResult.deadwood,
      playerMelds: playerResult.melds,
      playerDeadwood: playerResult.deadwood,
      finalScore,
      message: `Bot has Gin! ${finalScore > 0 ? "You win" : "Bot wins"} by ${Math.abs(finalScore)}.`,
    };
  }
  if (deadwoodValue <= 10 && state.settings.botDifficulty === "hard") {
    // Bot knocks
    const playerResult = detectMelds(state.playerHand);
    const botResult = detectMelds(botHand);
    // Allow lay-off
    const { remaining: playerRemaining } = layOff(playerResult.deadwood, botResult.melds);
    const playerDwVal = playerRemaining.reduce((s, c) => s + cardValue(c.rank), 0);
    const finalScore = computeKnockScore("bot", botResult.deadwoodValue, playerDwVal);
    return {
      ...state,
      botHand,
      stock,
      discardPile,
      phase: "done",
      knocker: "bot",
      botMelds: botResult.melds,
      botDeadwood: botResult.deadwood,
      playerMelds: playerResult.melds,
      playerDeadwood: playerRemaining,
      finalScore,
      message: `Bot knocked! ${finalScore > 0 ? "You win" : "Bot wins"} by ${Math.abs(finalScore)}.`,
    };
  }

  return {
    ...state,
    botHand,
    stock,
    discardPile,
    phase: "player-draw",
    message: "Your turn — draw from stock or discard.",
  };
}

function computeKnockScore(
  knocker: "player" | "bot",
  knockerDw: number,
  opponentDw: number,
): number {
  // Returns positive if player wins, negative if bot wins
  const isGin = knockerDw === 0;
  const bonus = isGin ? 25 : 0;
  if (knocker === "player") {
    if (opponentDw < knockerDw) {
      // Undercut: bot wins +25 + diff
      return -(25 + opponentDw - knockerDw);  // negative = bot wins (should be -25 + ... actually: -(25 + diff))
    }
    return (opponentDw - knockerDw) + bonus; // player wins
  } else {
    // Bot knocked
    if (opponentDw < knockerDw) {
      // Player undercut: player wins +25 + diff
      return 25 + knockerDw - opponentDw;
    }
    return -(knockerDw === 0 ? 25 + opponentDw : opponentDw - knockerDw + bonus);
  }
}

// ── Reducer ─────────────────────────────────────────────────────────────────

export function reducer(state: GinRummyState, action: GinRummyAction): GinRummyState {
  if (state.phase === "done" || state.phase === "bot-turn" || state.phase === "knocked") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const botRng = mulberry32(nextSeed);

  if (action.type === "draw" && state.phase === "player-draw") {
    let playerHand: Card[];
    let stock = [...state.stock];
    let discardPile = [...state.discardPile];

    if (action.from === "stock") {
      if (stock.length === 0) {
        const top = discardPile.pop()!;
        stock = shuffle(discardPile, botRng);
        discardPile = [top];
      }
      const drawn = stock.shift()!;
      playerHand = [...state.playerHand, drawn];
    } else {
      if (discardPile.length === 0) return state;
      const drawn = discardPile.pop()!;
      playerHand = [...state.playerHand, drawn];
    }

    return {
      ...state,
      rngSeed: nextSeed,
      playerHand,
      stock,
      discardPile,
      phase: "player-discard",
      message: "Choose a card to discard.",
    };
  }

  if (action.type === "discard" && state.phase === "player-discard") {
    const card = state.playerHand.find(c => c.id === action.cardId);
    if (!card) return state;

    const playerHand = state.playerHand.filter(c => c.id !== action.cardId);
    const discardPile = [...state.discardPile, card];

    // Bot turn
    let s: GinRummyState = {
      ...state,
      rngSeed: nextSeed,
      playerHand,
      discardPile,
      phase: "bot-turn",
      message: "Bot thinking…",
    };
    s = runBotTurn(s, botRng);
    return s;
  }

  if (action.type === "knock" && state.phase === "player-discard") {
    // Player knocks — must have 10 cards in hand
    const playerResult = detectMelds(state.playerHand);
    if (playerResult.deadwoodValue > 10) return state; // can't knock
    const botResult = detectMelds(state.botHand);

    // Bot lays off onto player's melds
    const { remaining: botRemaining } = layOff(botResult.deadwood, playerResult.melds);
    const botDwVal = botRemaining.reduce((s, c) => s + cardValue(c.rank), 0);

    const finalScore = computeKnockScore("player", playerResult.deadwoodValue, botDwVal);
    const isGin = playerResult.deadwoodValue === 0;
    const isUndercut = botDwVal < playerResult.deadwoodValue;

    let message: string;
    if (isGin) {
      message = `Gin! You win ${finalScore} pts (25 bonus + ${botDwVal} deadwood).`;
    } else if (isUndercut) {
      message = `Undercut! Bot wins ${-finalScore} pts.`;
    } else {
      message = `You win ${finalScore} pts.`;
    }

    return {
      ...state,
      rngSeed: nextSeed,
      phase: "done",
      knocker: "player",
      playerMelds: playerResult.melds,
      playerDeadwood: playerResult.deadwood,
      botMelds: botResult.melds,
      botDeadwood: botRemaining,
      finalScore,
      message,
    };
  }

  return state;
}

// ── initialState ─────────────────────────────────────────────────────────────

export function initialState(seed: number, settings: GinRummySettings): GinRummyState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);

  const deck = shuffle(newDeck(), dealRng);
  const playerHand = deck.slice(0, 10);
  const botHand = deck.slice(10, 20);
  const discardPile = [deck[20]!];
  const stock = deck.slice(21);

  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    playerHand,
    botHand,
    stock,
    discardPile,
    phase: "player-draw",
    drawnCard: null,
    knocker: null,
    playerMelds: [],
    botMelds: [],
    playerDeadwood: [],
    botDeadwood: [],
    finalScore: null,
    message: "Your turn — draw from stock or discard pile.",
  };
}

// ── isTerminal ───────────────────────────────────────────────────────────────

export function isTerminal(state: GinRummyState): { score: number } | null {
  if (state.phase !== "done" || state.finalScore === null) return null;
  // finalScore: positive = player wins. Map to 0-100 score.
  const raw = state.finalScore;
  return { score: Math.max(0, Math.min(100, 50 + raw)) };
}
