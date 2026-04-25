import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Decade Solitaire: Cards dealt to 4 columns. Remove groups of cards that sum to 10 or 20.
// Use face value (A=1, J=Q=K=10). Player picks cards to remove.
// Win by clearing all cards. Score = 100 - remaining cards at end if stuck.

export interface DecadeSolitaireSettings {
  dummy?: "none";
}

function cardValue(c: number): number {
  const rank = c % 13;
  if (rank === 0) return 1;  // Ace
  if (rank >= 9) return 10;  // 10, J, Q, K
  return rank + 1;           // 2-9
}

function cardName(c: number): string {
  const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const suits = ["♠", "♥", "♦", "♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}

export { cardValue, cardName };

export interface DecadeSolitaireState {
  columns: number[][];   // 4 columns of cards
  selected: number[];    // indices into flat card list (encoded as colIdx * 100 + rowIdx)
  moves: number;
  phase: "playing" | "won" | "stuck";
  rngSeed: number;
}

export type DecadeSolitaireAction =
  | { type: "select"; col: number; row: number }
  | { type: "remove" }
  | { type: "clearSel" };

function encode(col: number, row: number): number { return col * 100 + row; }
function decode(n: number): { col: number; row: number } { return { col: Math.floor(n / 100), row: n % 100 }; }
export { encode, decode };

function canRemove(cards: number[]): boolean {
  const sum = cards.reduce((s, c) => s + cardValue(c), 0);
  return sum === 10 || sum === 20;
}

function isStuck(columns: number[][]): boolean {
  const tops = columns.map(col => col[col.length - 1]).filter((c): c is number => c !== undefined);
  if (tops.length === 0) return false;
  // Check all pairs
  for (let i = 0; i < tops.length; i++) {
    for (let j = i + 1; j < tops.length; j++) {
      const s = cardValue(tops[i]!) + cardValue(tops[j]!);
      if (s === 10 || s === 20) return false;
    }
    if (cardValue(tops[i]!) === 10) return false; // single 10-value
  }
  return true;
}

export function initialState(seed: number, _settings: DecadeSolitaireSettings): DecadeSolitaireState {
  const rng = mulberry32(seed);
  const deck = Array.from({ length: 52 }, (_, i) => i);
  for (let i = 51; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j]!, deck[i]!];
  }
  // Deal 13 cards to each column
  const columns: number[][] = [[], [], [], []];
  for (let i = 0; i < 52; i++) columns[i % 4]!.push(deck[i]!);
  return { columns, selected: [], moves: 0, phase: "playing", rngSeed: Math.floor(rng() * 2 ** 31) };
}

export function reducer(state: DecadeSolitaireState, action: DecadeSolitaireAction): DecadeSolitaireState {
  if (state.phase === "won" || state.phase === "stuck") return state;
  if (action.type === "clearSel") return { ...state, selected: [] };
  if (action.type === "select") {
    const enc = encode(action.col, action.row);
    if (state.selected.includes(enc)) {
      return { ...state, selected: state.selected.filter(s => s !== enc) };
    }
    const newSel = [...state.selected, enc];
    // Check if valid removal (top cards only)
    const selectedCards = newSel.map(s => {
      const { col, row } = decode(s);
      return state.columns[col]![row];
    }).filter((c): c is number => c !== undefined);
    // Only allow top-card selection
    const allTops = newSel.every(s => {
      const { col, row } = decode(s);
      return row === state.columns[col]!.length - 1;
    });
    if (!allTops) return state;
    return { ...state, selected: newSel };
  }
  if (action.type === "remove") {
    if (state.selected.length < 1) return state;
    const selectedCards = state.selected.map(s => {
      const { col, row } = decode(s);
      return state.columns[col]![row];
    }).filter((c): c is number => c !== undefined);
    if (!canRemove(selectedCards)) return state;
    const columns = state.columns.map(col => [...col]);
    for (const s of state.selected) {
      const { col } = decode(s);
      columns[col]!.pop();
    }
    const allEmpty = columns.every(col => col.length === 0);
    if (allEmpty) return { ...state, columns, selected: [], moves: state.moves + 1, phase: "won" };
    const stuck = isStuck(columns);
    return { ...state, columns, selected: [], moves: state.moves + 1, phase: stuck ? "stuck" : "playing" };
  }
  return state;
}

export function isTerminal(state: DecadeSolitaireState): { score: number } | null {
  if (state.phase === "won") return { score: 100 };
  if (state.phase === "stuck") {
    const remaining = state.columns.reduce((s, col) => s + col.length, 0);
    return { score: Math.max(0, 100 - remaining * 2) };
  }
  return null;
}
