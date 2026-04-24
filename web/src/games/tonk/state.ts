import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Tonk: American rummy variant, 52-card deck, 7 cards each
// Card values: face cards = 10, Ace = 1, others = face value
export function tonkCardValue(rank: Card["rank"]): number {
  if (rank === 1) return 1; // Ace low in Tonk
  if (rank >= 11) return 10; // J, Q, K
  return rank;
}

// Meld: set (3+ same rank) or run (3+ consecutive same suit)
export function isTonkMeld(cards: Card[]): boolean {
  if (cards.length < 3) return false;
  if (cards.every(c => c.rank === cards[0]!.rank)) return true;
  if (cards.every(c => c.suit === cards[0]!.suit)) {
    const vals = cards.map(c => c.rank === 1 ? 1 : c.rank).sort((a, b) => a - b);
    for (let i = 1; i < vals.length; i++) {
      if (vals[i]! !== vals[i - 1]! + 1) return false;
    }
    return true;
  }
  return false;
}

/** Greedy meld finder — minimizes deadwood */
export function findBestMelds(hand: readonly Card[]): { melds: Card[][]; deadwood: Card[] } {
  let bestDw = hand.reduce((s, c) => s + tonkCardValue(c.rank), 0);
  let bestResult: { melds: Card[][]; deadwood: Card[] } = { melds: [], deadwood: [...hand] };

  function backtrack(remaining: Card[], usedMelds: Card[][]): void {
    const dv = remaining.reduce((s, c) => s + tonkCardValue(c.rank), 0);
    if (dv < bestDw) {
      bestDw = dv;
      bestResult = { melds: [...usedMelds], deadwood: [...remaining] };
    }
    const n = remaining.length;
    for (let size = 3; size <= Math.min(n, 4); size++) {
      for (let mask = 0; mask < (1 << n); mask++) {
        if (popcount(mask) !== size) continue;
        const subset: Card[] = [];
        const rest: Card[] = [];
        for (let i = 0; i < n; i++) {
          if (mask & (1 << i)) subset.push(remaining[i]!);
          else rest.push(remaining[i]!);
        }
        if (isTonkMeld(subset)) backtrack(rest, [...usedMelds, subset]);
      }
    }
  }

  backtrack([...hand], []);
  return bestResult;
}

function popcount(x: number): number {
  let n = 0; while (x) { n += x & 1; x >>>= 1; } return n;
}

export function handValue(hand: readonly Card[]): number {
  const { deadwood } = findBestMelds(hand);
  return deadwood.reduce((s, c) => s + tonkCardValue(c.rank), 0);
}

export type TonkPhase = "draw" | "discard" | "bot-turn" | "done";

export interface TonkState {
  rngSeed: number;
  playerHand: readonly Card[];
  botHand: readonly Card[];
  stockPile: readonly Card[];
  discardPile: readonly Card[];
  phase: TonkPhase;
  message: string;
  drawnCard: Card | null;
  finalScores: { player: number; bot: number } | null;
}

export type TonkAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "discard"; cardId: string }
  | { type: "tonk" }; // go out

function botTurn(state: TonkState, rng: () => number): TonkState {
  if (state.stockPile.length === 0) return endGame(state);

  const drawn = state.stockPile[0]!;
  const botHand = [...state.botHand, drawn];
  const stockPile = state.stockPile.slice(1);

  const { deadwood } = findBestMelds(botHand);
  if (deadwood.length === 0) {
    // Bot tonks
    const { deadwood: pDead } = findBestMelds(state.playerHand);
    const pScore = pDead.reduce((s, c) => s + tonkCardValue(c.rank), 0);
    return { ...state, botHand, stockPile, phase: "done", finalScores: { player: pScore, bot: 0 }, message: `Bot went out (Tonk)! Your deadwood: ${pScore}.` };
  }

  // Discard highest deadwood card
  const discard = deadwood.length > 0
    ? deadwood.reduce((hi, c) => tonkCardValue(c.rank) > tonkCardValue(hi.rank) ? c : hi)
    : botHand[botHand.length - 1]!;
  const newBotHand = botHand.filter(c => c.id !== discard.id);
  const discardPile = [discard, ...state.discardPile];

  return { ...state, botHand: newBotHand, stockPile, discardPile, phase: "draw", message: "Your turn. Draw a card." };
}

function endGame(state: TonkState): TonkState {
  const { deadwood: pDead } = findBestMelds(state.playerHand);
  const { deadwood: bDead } = findBestMelds(state.botHand);
  const pScore = pDead.reduce((s, c) => s + tonkCardValue(c.rank), 0);
  const bScore = bDead.reduce((s, c) => s + tonkCardValue(c.rank), 0);
  const finalScores = { player: pScore, bot: bScore };
  const msg = pScore < bScore
    ? `Stock empty! You win! Your hand: ${pScore}, Bot: ${bScore}.`
    : pScore > bScore
    ? `Stock empty! Bot wins. Your hand: ${pScore}, Bot: ${bScore}.`
    : `Tie! Both at ${pScore}.`;
  return { ...state, phase: "done", finalScores, message: msg };
}

export function reducer(state: TonkState, action: TonkAction): TonkState {
  if (state.phase === "done") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const s = { ...state, rngSeed: nextSeed };

  if (action.type === "draw-stock" && state.phase === "draw") {
    if (state.stockPile.length === 0) return endGame(s);
    const drawn = state.stockPile[0]!;
    return { ...s, drawnCard: drawn, stockPile: state.stockPile.slice(1), phase: "discard", message: `Drew ${drawn.suit}${drawn.rank}. Discard one card or go out.` };
  }

  if (action.type === "draw-discard" && state.phase === "draw") {
    if (state.discardPile.length === 0) return state;
    const drawn = state.discardPile[0]!;
    return { ...s, drawnCard: drawn, discardPile: state.discardPile.slice(1), phase: "discard", message: `Took ${drawn.suit}${drawn.rank} from discard. Now discard.` };
  }

  if (action.type === "discard" && state.phase === "discard") {
    const drawnCard = state.drawnCard;
    if (!drawnCard) return state;
    const fullHand = [...state.playerHand, drawnCard];
    const card = fullHand.find(c => c.id === action.cardId);
    if (!card) return state;
    const newHand = fullHand.filter(c => c.id !== card.id);
    const discardPile = [card, ...state.discardPile];
    let next: TonkState = { ...s, playerHand: newHand, discardPile, drawnCard: null, phase: "bot-turn", message: "Bot's turn…" };
    return botTurn(next, rng);
  }

  if (action.type === "tonk" && state.phase === "discard") {
    const drawnCard = state.drawnCard;
    const fullHand = drawnCard ? [...state.playerHand, drawnCard] : [...state.playerHand];
    const { deadwood } = findBestMelds(fullHand);
    if (deadwood.length > 0) {
      return { ...state, message: `Can't Tonk yet — still ${deadwood.length} deadwood cards.` };
    }
    const { deadwood: bDead } = findBestMelds(state.botHand);
    const bScore = bDead.reduce((sum, c) => sum + tonkCardValue(c.rank), 0);
    const finalScores = { player: 0, bot: bScore };
    return { ...s, playerHand: fullHand, drawnCard: null, phase: "done", finalScores, message: `Tonk! You went out! Bot's deadwood: ${bScore}.` };
  }

  return state;
}

export function initialState(seed: number): TonkState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const deck = shuffle(newDeck(), mulberry32(nextSeed));

  return {
    rngSeed: Math.floor(mulberry32(nextSeed)() * 2 ** 31),
    playerHand: deck.slice(0, 7),
    botHand: deck.slice(7, 14),
    stockPile: deck.slice(15),
    discardPile: [deck[14]!],
    phase: "draw",
    message: "Draw from the stock or take the discard. Form melds (sets/runs) and go out!",
    drawnCard: null,
    finalScores: null,
  };
}

export function isTerminal(state: TonkState): { score: number } | null {
  if (state.phase !== "done" || !state.finalScores) return null;
  const diff = state.finalScores.bot - state.finalScores.player; // lower deadwood = better for player
  return { score: Math.max(0, Math.min(100, 50 + diff * 2)) };
}
