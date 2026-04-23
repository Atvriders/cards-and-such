import type { Card, Rank } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface PokerSolitaireSettings {
  _dummy?: undefined;
}

export type GridCell = Card | null;

export interface PokerSolitaireState {
  /** 5x5 grid, row-major. Null = empty. */
  grid: GridCell[][];
  /** Current card to place (top of draw pile). */
  currentCard: Card | null;
  /** Remaining cards after currentCard. */
  drawPile: Card[];
  movesMade: number;
  score: number;
  won: boolean;
  /** Scores per row (0-4) then per column (5-9) after game ends */
  lineScores: number[];
  settings: PokerSolitaireSettings;
}

export type PokerSolitaireAction =
  | { type: "place"; row: number; col: number };

/** British scoring system */
export const HAND_SCORES: Record<string, number> = {
  "royal-flush": 30,
  "straight-flush": 30,
  "four-of-a-kind": 16,
  "full-house": 10,
  "flush": 5,
  "straight": 12,
  "three-of-a-kind": 6,
  "two-pair": 3,
  "pair": 1,
  "high-card": 0,
};

export function classifyHand(cards: Card[]): string {
  if (cards.length !== 5) return "high-card";

  const ranks = cards.map((c) => c.rank as number).sort((a, b) => a - b);
  const suits = cards.map((c) => c.suit);

  const isFlush = suits.every((s) => s === suits[0]);

  // Normalize ranks for straight detection (treat Ace as both 1 and 14)
  const isStraight = (r: number[]): boolean => {
    const unique = [...new Set(r)].sort((a, b) => a - b);
    if (unique.length !== 5) return false;
    if (unique[4]! - unique[0]! === 4) return true;
    // Ace-high: A 2 3 4 5? No — check A-K-Q-J-10
    // Ace = 1; treat as 14
    const high = unique.map((v) => v === 1 ? 14 : v).sort((a, b) => a - b);
    return high[4]! - high[0]! === 4 && new Set(high).size === 5;
  };

  const straight = isStraight(ranks);

  // Count rank frequencies
  const freq: Record<number, number> = {};
  for (const r of ranks) freq[r] = (freq[r] ?? 0) + 1;
  const counts = Object.values(freq).sort((a, b) => b - a);

  if (isFlush && straight) {
    // Royal flush: 10 J Q K A
    const highRanks = ranks.includes(1) && ranks.includes(13);
    if (highRanks && ranks.includes(10) && ranks.includes(11) && ranks.includes(12)) {
      return "royal-flush";
    }
    return "straight-flush";
  }
  if (counts[0] === 4) return "four-of-a-kind";
  if (counts[0] === 3 && counts[1] === 2) return "full-house";
  if (isFlush) return "flush";
  if (straight) return "straight";
  if (counts[0] === 3) return "three-of-a-kind";
  if (counts[0] === 2 && counts[1] === 2) return "two-pair";
  if (counts[0] === 2) return "pair";
  return "high-card";
}

function scoreGrid(grid: GridCell[][]): { lineScores: number[]; total: number } {
  const lineScores: number[] = [];
  let total = 0;

  // 5 rows
  for (let r = 0; r < 5; r++) {
    const hand = grid[r]!.filter((c): c is Card => c !== null);
    if (hand.length === 5) {
      const s = HAND_SCORES[classifyHand(hand)] ?? 0;
      lineScores.push(s);
      total += s;
    } else {
      lineScores.push(0);
    }
  }
  // 5 columns
  for (let c = 0; c < 5; c++) {
    const hand = grid.map((row) => row[c]!).filter((x): x is Card => x !== null);
    if (hand.length === 5) {
      const s = HAND_SCORES[classifyHand(hand)] ?? 0;
      lineScores.push(s);
      total += s;
    } else {
      lineScores.push(0);
    }
  }

  return { lineScores, total };
}

export function initialState(seed: number, settings: PokerSolitaireSettings): PokerSolitaireState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  // Take first 25 cards
  const draw25 = deck.slice(0, 25);
  const currentCard = draw25[0]!;
  const drawPile = draw25.slice(1);

  const grid: GridCell[][] = Array.from({ length: 5 }, () => Array(5).fill(null) as GridCell[]);

  return {
    grid,
    currentCard,
    drawPile,
    movesMade: 0,
    score: 0,
    won: false,
    lineScores: [],
    settings,
  };
}

export function reducer(state: PokerSolitaireState, action: PokerSolitaireAction): PokerSolitaireState {
  if (state.won) return state;

  switch (action.type) {
    case "place": {
      const { row, col } = action;
      if (row < 0 || row > 4 || col < 0 || col > 4) return state;
      if (state.grid[row]![col] !== null) return state;
      if (!state.currentCard) return state;

      const newGrid = state.grid.map((r, ri) =>
        r.map((cell, ci) => (ri === row && ci === col ? state.currentCard! : cell))
      );

      const totalPlaced = state.movesMade + 1;
      const won = totalPlaced === 25;

      let nextCard: Card | null = null;
      let newDrawPile = [...state.drawPile];
      if (!won && newDrawPile.length > 0) {
        nextCard = newDrawPile[0]!;
        newDrawPile = newDrawPile.slice(1);
      }

      let score = state.score;
      let lineScores: number[] = [];
      if (won) {
        const scored = scoreGrid(newGrid);
        score = scored.total;
        lineScores = scored.lineScores;
      }

      return {
        ...state,
        grid: newGrid,
        currentCard: nextCard,
        drawPile: newDrawPile,
        movesMade: totalPlaced,
        score,
        won,
        lineScores,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: PokerSolitaireState): { score: number } | null {
  if (!state.won) return null;
  return { score: state.score };
}
