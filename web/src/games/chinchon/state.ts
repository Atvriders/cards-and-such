import type { Card, Suit } from "../../engines/deck/index.js";
import { shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// 40-card Spanish deck
const SPANISH_RANKS = [1, 2, 3, 4, 5, 6, 7, 11, 12, 13] as const;
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

export function chinchonDeck(): Card[] {
  const cards: Card[] = [];
  for (const s of SUITS) {
    for (const r of SPANISH_RANKS) {
      cards.push({ suit: s, rank: r as Card["rank"], id: `ch-${s}${r}` });
    }
  }
  return cards;
}

/** Point value of a card (deadwood): A=1, 2-7 face, J=8, Q=9, K=10 */
export function cardValue(rank: Card["rank"]): number {
  if (rank === 11) return 8;
  if (rank === 12) return 9;
  if (rank === 13) return 10;
  return rank;
}

// Rank order for sequences: A=1, 2-7, J=8, Q=9, K=10
const RANK_ORDER = [1, 2, 3, 4, 5, 6, 7, 11, 12, 13];

function rankIndex(rank: Card["rank"]): number {
  return RANK_ORDER.indexOf(rank);
}

/** Check if a group of cards forms a valid meld (set or run) */
export function isMeld(cards: Card[]): boolean {
  if (cards.length < 3) return false;
  // Set: all same rank
  if (cards.every(c => c.rank === cards[0]!.rank)) return true;
  // Run: all same suit, consecutive in rank order
  if (cards.every(c => c.suit === cards[0]!.suit)) {
    const idxs = cards.map(c => rankIndex(c.rank)).sort((a, b) => a - b);
    for (let i = 1; i < idxs.length; i++) {
      if (idxs[i]! !== idxs[i - 1]! + 1) return false;
    }
    return true;
  }
  return false;
}

/** Find best melds: try to minimize deadwood. Greedy: try all 3-card and 4-card combos. */
export function bestMelds(hand: readonly Card[]): { melds: Card[][]; deadwood: Card[] } {
  // Try every partition of hand into melds and deadwood
  // For a 7-card hand this is manageable with backtracking
  let bestDeadwoodValue = Infinity;
  let bestResult: { melds: Card[][]; deadwood: Card[] } = { melds: [], deadwood: [...hand] };

  function backtrack(remaining: Card[], usedMelds: Card[][]): void {
    const dv = remaining.reduce((s, c) => s + cardValue(c.rank), 0);
    if (dv < bestDeadwoodValue) {
      bestDeadwoodValue = dv;
      bestResult = { melds: [...usedMelds], deadwood: [...remaining] };
    }
    // Try all subsets of size >= 3
    const n = remaining.length;
    for (let size = 3; size <= n; size++) {
      for (let mask = 0; mask < (1 << n); mask++) {
        if (popcount(mask) !== size) continue;
        const subset: Card[] = [];
        const rest: Card[] = [];
        for (let i = 0; i < n; i++) {
          if (mask & (1 << i)) subset.push(remaining[i]!);
          else rest.push(remaining[i]!);
        }
        if (isMeld(subset)) {
          backtrack(rest, [...usedMelds, subset]);
        }
      }
    }
  }

  backtrack([...hand], []);
  return bestResult;
}

function popcount(x: number): number {
  let n = 0;
  while (x) { n += x & 1; x >>>= 1; }
  return n;
}

export type ChinchonPhase = "draw" | "discard" | "bot-turn" | "done";

export interface ChinchonState {
  rngSeed: number;
  playerHand: readonly Card[];
  botHand: readonly Card[];
  stockPile: readonly Card[];
  discardPile: readonly Card[];
  phase: ChinchonPhase;
  message: string;
  selectedCardId: string | null;
  drawnCard: Card | null;
  finalScores: { player: number; bot: number } | null;
}

export type ChinchonAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "discard"; cardId: string }
  | { type: "go-out" };

function botTurn(state: ChinchonState, rng: () => number): ChinchonState {
  // Bot draws from stock
  if (state.stockPile.length === 0) {
    return endGame(state);
  }
  const drawn = state.stockPile[0]!;
  const botHand = [...state.botHand, drawn];
  const stockPile = state.stockPile.slice(1);

  // Bot checks if it can go out (all 7 in melds or minimal deadwood)
  const { deadwood } = bestMelds(botHand);
  if (deadwood.length === 0) {
    // Bot goes out
    const { melds: pMelds, deadwood: pDead } = bestMelds(state.playerHand);
    const botScore = 0;
    const playerScore = pDead.reduce((s, c) => s + cardValue(c.rank), 0);
    const finalScores = { player: playerScore, bot: botScore };
    const msg = playerScore === 0
      ? "Bot went out! Both tied at 0!"
      : `Bot went out! Your deadwood: ${playerScore} pts. Bot wins!`;
    return { ...state, botHand, stockPile, phase: "done", finalScores, message: msg };
  }

  // Discard highest deadwood card
  const discard = deadwood.length > 0
    ? deadwood.reduce((hi, c) => cardValue(c.rank) > cardValue(hi.rank) ? c : hi)
    : botHand[botHand.length - 1]!;
  const newBotHand = botHand.filter(c => c.id !== discard.id);
  const discardPile = [discard, ...state.discardPile];

  return { ...state, botHand: newBotHand, stockPile, discardPile, phase: "draw", message: "Your turn. Draw a card." };
}

function endGame(state: ChinchonState): ChinchonState {
  const { deadwood: pDead } = bestMelds(state.playerHand);
  const { deadwood: bDead } = bestMelds(state.botHand);
  const pScore = pDead.reduce((s, c) => s + cardValue(c.rank), 0);
  const bScore = bDead.reduce((s, c) => s + cardValue(c.rank), 0);
  const finalScores = { player: pScore, bot: bScore };
  const msg = pScore < bScore
    ? `Stock empty! You win! Your deadwood: ${pScore}, Bot: ${bScore}.`
    : pScore > bScore
    ? `Stock empty! Bot wins! Your deadwood: ${pScore}, Bot: ${bScore}.`
    : `Stock empty! Tie! Both at ${pScore} deadwood.`;
  return { ...state, phase: "done", finalScores, message: msg };
}

export function reducer(state: ChinchonState, action: ChinchonAction): ChinchonState {
  if (state.phase === "done") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const s = { ...state, rngSeed: nextSeed };

  if (action.type === "draw-stock" && state.phase === "draw") {
    if (state.stockPile.length === 0) return endGame(s);
    const drawn = state.stockPile[0]!;
    return { ...s, drawnCard: drawn, stockPile: state.stockPile.slice(1), phase: "discard", message: `Drew ${drawn.suit}${drawn.rank}. Now discard a card (or go out if you can).` };
  }

  if (action.type === "draw-discard" && state.phase === "draw") {
    if (state.discardPile.length === 0) return state;
    const drawn = state.discardPile[0]!;
    return { ...s, drawnCard: drawn, discardPile: state.discardPile.slice(1), phase: "discard", message: `Took ${drawn.suit}${drawn.rank} from discard. Now discard a card.` };
  }

  if (action.type === "discard" && state.phase === "discard") {
    const drawnCard = state.drawnCard;
    if (!drawnCard) return state;
    const fullHand = [...state.playerHand, drawnCard];
    const card = fullHand.find(c => c.id === action.cardId);
    if (!card) return state;
    const newHand = fullHand.filter(c => c.id !== card.id);
    const discardPile = [card, ...state.discardPile];
    let next: ChinchonState = { ...s, playerHand: newHand, discardPile, drawnCard: null, phase: "bot-turn", message: "Bot's turn…" };
    next = botTurn(next, rng);
    return next;
  }

  if (action.type === "go-out" && state.phase === "discard") {
    // Player goes out — must have all 7 (or 8 with drawn) in melds
    const drawnCard = state.drawnCard;
    const fullHand = drawnCard ? [...state.playerHand, drawnCard] : [...state.playerHand];
    const { deadwood } = bestMelds(fullHand);
    if (deadwood.length > 0) {
      return { ...state, message: `Can't go out — you still have ${deadwood.length} deadwood cards.` };
    }
    const { deadwood: bDead } = bestMelds(state.botHand);
    const bScore = bDead.reduce((sum, c) => sum + cardValue(c.rank), 0);
    const finalScores = { player: 0, bot: bScore };
    const msg = bScore === 0 ? "You went out! Tie at 0!" : `Chinchón! You went out! Bot's deadwood: ${bScore} pts. You win!`;
    return { ...s, playerHand: fullHand, drawnCard: null, phase: "done", finalScores, message: msg };
  }

  return state;
}

export function initialState(seed: number): ChinchonState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const deck = shuffle(chinchonDeck(), mulberry32(nextSeed));

  return {
    rngSeed: Math.floor(mulberry32(nextSeed)() * 2 ** 31),
    playerHand: deck.slice(0, 7),
    botHand: deck.slice(7, 14),
    stockPile: deck.slice(15),
    discardPile: [deck[14]!],
    phase: "draw",
    message: "Draw from the stock or take the top discard card.",
    selectedCardId: null,
    drawnCard: null,
    finalScores: null,
  };
}

export function isTerminal(state: ChinchonState): { score: number } | null {
  if (state.phase !== "done" || !state.finalScores) return null;
  // Lower deadwood is better for player; player wins if player score < bot score
  const diff = state.finalScores.bot - state.finalScores.player;
  return { score: Math.max(0, Math.min(100, 50 + diff * 3)) };
}
