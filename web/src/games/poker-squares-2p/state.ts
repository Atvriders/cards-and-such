import type { Card, Rank } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Poker Squares 2P — 2-player variant (vs bot)
// Both players see the same sequence of 25 drawn cards.
// Each player places each card in their own 5x5 grid.
// After 25 cards, evaluate 10 poker hands (5 rows + 5 cols).
// Player with more points wins.

export interface PokerSquares2PSettings { dummy: "off" }

export type PokerSquares2PPhase = "placing" | "done";

export interface PokerSquares2PState {
  settings: PokerSquares2PSettings;
  deck: readonly Card[];
  currentCard: Card | null;
  playerGrid: readonly (Card | null)[];  // 25 cells, row-major
  botGrid: readonly (Card | null)[];
  cardsPlaced: number;
  phase: PokerSquares2PPhase;
  playerScore: number;
  botScore: number;
  rngSeed: number;
}

export type PokerSquares2PAction = { type: "place"; cellIndex: number };

// Poker hand scoring (American system simplified)
// Royal Flush=100, Straight Flush=75, Four-of-Kind=50, Full House=25
// Flush=20, Straight=15, Three-of-Kind=10, Two Pair=5, One Pair=2, High Card=0
function rankVal(r: Rank): number {
  if (r === 1) return 14; // Ace high
  return r;
}

export function scoreHand(cards: (Card | null)[]): number {
  const filled = cards.filter(Boolean) as Card[];
  if (filled.length !== 5) return 0;

  const ranks = filled.map(c => rankVal(c.rank));
  const suits = filled.map(c => c.suit);
  const rankCounts = new Map<number, number>();
  for (const r of ranks) rankCounts.set(r, (rankCounts.get(r) ?? 0) + 1);
  const counts = [...rankCounts.values()].sort((a, b) => b - a);
  const isFlush = suits.every(s => s === suits[0]);
  const sortedRanks = [...new Set(ranks)].sort((a, b) => a - b);
  const isStraight = sortedRanks.length === 5 && (
    sortedRanks[4]! - sortedRanks[0]! === 4 ||
    // Ace-low straight: A-2-3-4-5
    (sortedRanks[4] === 14 && sortedRanks[3] === 5 && sortedRanks[0] === 2)
  );
  const isRoyal = isFlush && isStraight && Math.max(...ranks) === 14;

  if (isRoyal) return 100;
  if (isStraight && isFlush) return 75;
  if (counts[0] === 4) return 50;
  if (counts[0] === 3 && counts[1] === 2) return 25;
  if (isFlush) return 20;
  if (isStraight) return 15;
  if (counts[0] === 3) return 10;
  if (counts[0] === 2 && counts[1] === 2) return 5;
  if (counts[0] === 2) return 2;
  return 0;
}

export function scoreGrid(grid: (Card | null)[]): number {
  let total = 0;
  // 5 rows
  for (let r = 0; r < 5; r++) {
    total += scoreHand(grid.slice(r * 5, r * 5 + 5));
  }
  // 5 cols
  for (let c = 0; c < 5; c++) {
    total += scoreHand([grid[c] ?? null, grid[c + 5] ?? null, grid[c + 10] ?? null, grid[c + 15] ?? null, grid[c + 20] ?? null]);
  }
  return total;
}

// Bot: place in first empty cell that maximizes immediate row/col score increase
function botPlace(grid: readonly (Card | null)[], card: Card): number {
  let bestCell = -1;
  let bestScore = -1;

  for (let i = 0; i < 25; i++) {
    if (grid[i] !== null) continue;
    const testGrid = [...grid];
    testGrid[i] = card;
    const row = Math.floor(i / 5);
    const col = i % 5;
    const rowScore = scoreHand(testGrid.slice(row * 5, row * 5 + 5));
    const colScore = scoreHand([testGrid[col] ?? null, testGrid[col + 5] ?? null, testGrid[col + 10] ?? null, testGrid[col + 15] ?? null, testGrid[col + 20] ?? null]);
    const score = rowScore + colScore;
    if (score > bestScore) { bestScore = score; bestCell = i; }
  }

  return bestCell >= 0 ? bestCell : grid.findIndex(c => c === null);
}

export function initialState(seed: number, settings: PokerSquares2PSettings): PokerSquares2PState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const [currentCard, ...rest] = deck;

  return {
    settings,
    deck: rest,
    currentCard: currentCard ?? null,
    playerGrid: Array(25).fill(null),
    botGrid: Array(25).fill(null),
    cardsPlaced: 0,
    phase: "placing",
    playerScore: 0,
    botScore: 0,
    rngSeed: nextSeed,
  };
}

export function reducer(state: PokerSquares2PState, action: PokerSquares2PAction): PokerSquares2PState {
  if (state.phase === "done" || !state.currentCard) return state;
  if (action.type !== "place") return state;

  const { cellIndex } = action;
  if (cellIndex < 0 || cellIndex >= 25) return state;
  if (state.playerGrid[cellIndex] !== null) return state; // cell occupied

  // Player places
  const newPlayerGrid = [...state.playerGrid];
  newPlayerGrid[cellIndex] = state.currentCard;

  // Bot places
  const botCell = botPlace(state.botGrid, state.currentCard);
  const newBotGrid = [...state.botGrid];
  newBotGrid[botCell] = state.currentCard;

  const newCardsPlaced = state.cardsPlaced + 1;
  const [nextCard, ...rest] = state.deck;

  if (newCardsPlaced >= 25) {
    const ps = scoreGrid(newPlayerGrid);
    const bs = scoreGrid(newBotGrid);
    return {
      ...state,
      playerGrid: newPlayerGrid,
      botGrid: newBotGrid,
      deck: rest,
      currentCard: null,
      cardsPlaced: newCardsPlaced,
      phase: "done",
      playerScore: ps,
      botScore: bs,
    };
  }

  return {
    ...state,
    playerGrid: newPlayerGrid,
    botGrid: newBotGrid,
    deck: rest,
    currentCard: nextCard ?? null,
    cardsPlaced: newCardsPlaced,
  };
}

export function isTerminal(state: PokerSquares2PState): { score: number } | null {
  if (state.phase !== "done") return null;
  if (state.playerScore > state.botScore) return { score: 100 };
  if (state.playerScore === state.botScore) return { score: 50 };
  return { score: 10 };
}
