import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Card Pyramid Grab: A 5-row pyramid of face-down cards is revealed row by row.
// Player picks one card per row. Higher rank = more points.

export interface CardPyramidGrabSettings { rows: "3" | "5"; }

export interface CardPyramidGrabState {
  pyramid: number[][];   // pyramid[row] = card values
  revealed: boolean[][];
  currentRow: number;
  selectedInRow: number | null;
  score: number;
  maxRows: number;
  phase: "picking" | "gameover";
}

export type CardPyramidGrabAction = { type: "pick"; col: number } | { type: "next" };

function makeDeck(rng: () => number): number[] {
  const arr = Array.from({ length: 52 }, (_, i) => i);
  for (let i = 51; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j]!, arr[i]!]; }
  return arr;
}

export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}

export function cardPoints(c: number): number { return (c % 13) + 2; } // 2-14

export function initialState(seed: number, settings: CardPyramidGrabSettings): CardPyramidGrabState {
  const rng = mulberry32(seed);
  const deck = makeDeck(rng);
  const maxRows = parseInt(settings.rows, 10);
  // Each row has (row+1) cards, but cap to 5 per row max
  const pyramid: number[][] = [];
  let idx = 0;
  for (let r = 0; r < maxRows; r++) {
    const rowSize = Math.min(r + 2, 5);
    pyramid.push(deck.slice(idx, idx + rowSize));
    idx += rowSize;
  }
  const revealed = pyramid.map(row => row.map(() => false));
  return { pyramid, revealed, currentRow: 0, selectedInRow: null, score: 0, maxRows, phase: "picking" };
}

export function reducer(state: CardPyramidGrabState, action: CardPyramidGrabAction): CardPyramidGrabState {
  if (state.phase === "gameover") return state;
  if (action.type === "pick") {
    if (state.selectedInRow !== null) return state;
    const row = state.pyramid[state.currentRow];
    if (!row || action.col >= row.length) return state;
    const card = row[action.col]!;
    const pts = cardPoints(card);
    const newRevealed = state.revealed.map((r, ri) =>
      ri === state.currentRow ? r.map((_, ci) => ci === action.col ? true : false) : r
    );
    return { ...state, selectedInRow: action.col, score: state.score + pts, revealed: newRevealed };
  }
  if (action.type === "next") {
    if (state.selectedInRow === null) return state;
    const nextRow = state.currentRow + 1;
    if (nextRow >= state.maxRows) return { ...state, phase: "gameover" };
    return { ...state, currentRow: nextRow, selectedInRow: null };
  }
  return state;
}

export function isTerminal(state: CardPyramidGrabState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
