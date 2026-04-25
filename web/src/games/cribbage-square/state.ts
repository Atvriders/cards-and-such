import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Cribbage Square Solitaire: Place 16 cards into a 4x4 grid.
// Score each row and column as a 4-card cribbage hand (15s, pairs, runs, flush).
// Simplified: pairs=2pts each, 15s=2pts each, runs=length pts. No flush.

export interface CribbageSquareSettings {
  dummy?: "none";
}

export interface CribbageSquareState {
  deck: number[];
  deckPos: number;
  grid: (number | null)[];   // 16 cells, row-major
  currentCard: number | null;
  score: number;
  phase: "placing" | "done";
  rngSeed: number;
}

export type CribbageSquareAction =
  | { type: "place"; cellIndex: number };

function cardRank(c: number): number { return c % 13; }
function cardValue(c: number): number { return Math.min(10, cardRank(c) + 2); }

function scoreFifteens(cards: number[]): number {
  let pts = 0;
  const vals = cards.map(cardValue);
  // All subsets
  for (let mask = 1; mask < (1 << vals.length); mask++) {
    let sum = 0;
    for (let i = 0; i < vals.length; i++) { if (mask & (1 << i)) sum += vals[i]!; }
    if (sum === 15) pts += 2;
  }
  return pts;
}

function scorePairs(cards: number[]): number {
  let pts = 0;
  for (let i = 0; i < cards.length; i++) for (let j = i + 1; j < cards.length; j++) {
    if (cardRank(cards[i]!) === cardRank(cards[j]!)) pts += 2;
  }
  return pts;
}

function scoreRuns(cards: number[]): number {
  const ranks = cards.map(cardRank).sort((a, b) => a - b);
  // check for run of 4
  let isRun4 = true;
  for (let i = 1; i < 4; i++) { if (ranks[i]! - ranks[i - 1]! !== 1) { isRun4 = false; break; } }
  if (isRun4) return 4;
  // run of 3 (any 3 consecutive)
  for (let start = 0; start <= 1; start++) {
    const sub = ranks.slice(start, start + 3);
    if (sub[1]! - sub[0]! === 1 && sub[2]! - sub[1]! === 1) return 3;
  }
  return 0;
}

export function scoreHand(cards: number[]): number {
  const valid = cards.filter((c): c is number => c !== null);
  if (valid.length < 4) return 0;
  return scoreFifteens(valid) + scorePairs(valid) + scoreRuns(valid);
}

export function calcTotalScore(grid: (number | null)[]): number {
  let total = 0;
  // 4 rows
  for (let r = 0; r < 4; r++) {
    total += scoreHand([grid[r * 4]!, grid[r * 4 + 1]!, grid[r * 4 + 2]!, grid[r * 4 + 3]!]);
  }
  // 4 cols
  for (let c = 0; c < 4; c++) {
    total += scoreHand([grid[c]!, grid[4 + c]!, grid[8 + c]!, grid[12 + c]!]);
  }
  return total;
}

export function cardName(c: number): string {
  const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  const suits = ["♠", "♥", "♦", "♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}

export function initialState(seed: number, _settings: CribbageSquareSettings): CribbageSquareState {
  const rng = mulberry32(seed);
  const deck = Array.from({ length: 52 }, (_, i) => i);
  for (let i = 51; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j]!, deck[i]!];
  }
  return { deck, deckPos: 0, grid: Array(16).fill(null), currentCard: deck[0]!, score: 0, phase: "placing", rngSeed: Math.floor(rng() * 2 ** 31) };
}

export function reducer(state: CribbageSquareState, action: CribbageSquareAction): CribbageSquareState {
  if (state.phase === "done" || state.currentCard === null) return state;
  if (action.type === "place") {
    if (state.grid[action.cellIndex] !== null) return state;
    const newGrid = [...state.grid];
    newGrid[action.cellIndex] = state.currentCard;
    const newDeckPos = state.deckPos + 1;
    const nextCard = newDeckPos < 16 ? state.deck[newDeckPos]! : null;
    const placed = newGrid.filter(c => c !== null).length;
    if (placed === 16) {
      return { ...state, grid: newGrid, deckPos: newDeckPos, currentCard: null, score: calcTotalScore(newGrid), phase: "done" };
    }
    return { ...state, grid: newGrid, deckPos: newDeckPos, currentCard: nextCard };
  }
  return state;
}

export function isTerminal(state: CribbageSquareState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
