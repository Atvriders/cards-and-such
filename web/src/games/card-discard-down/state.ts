import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Card Discard Down: 10 rounds. Each round: dealt a 5-card hand. You may discard
// any 2 cards; replacements drawn from the deck. Lower final hand value = more points.
// Hand value = sum of pip values (2..10 face value, J/Q/K=10, A=1).

export const TOTAL_ROUNDS = 10;

export interface CardDiscardDownSettings { dummy: boolean; }

export interface CardDiscardDownState {
  rngSeed: number;
  round: number;
  hand: number[];
  selected: number[]; // indices into hand
  draws: number[];     // pre-rolled replacement deck for this round
  drawIndex: number;
  finalSum: number;
  score: number;
  phase: "selecting" | "result" | "done";
}

export type CardDiscardDownAction =
  | { type: "toggle"; index: number }
  | { type: "discard" }
  | { type: "next" };

export function pipValue(c: number): number {
  const r = c % 13;
  if (r <= 8) return r + 2;     // 2..10
  if (r === 12) return 1;       // A
  return 10;                    // J,Q,K
}
export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

function dealUnique(rng: () => number, n: number, exclude: Set<number> = new Set()): number[] {
  const out: number[] = [];
  const used = new Set(exclude);
  while (out.length < n) {
    const c = Math.floor(rng() * 52);
    if (!used.has(c)) { used.add(c); out.push(c); }
  }
  return out;
}

export function initialState(seed: number, _s: CardDiscardDownSettings): CardDiscardDownState {
  const rng = mulberry32(seed);
  const hand = dealUnique(rng, 5);
  const draws = dealUnique(rng, 5, new Set(hand));
  return {
    rngSeed: Math.floor(rng() * 2 ** 31),
    round: 1,
    hand,
    selected: [],
    draws,
    drawIndex: 0,
    finalSum: 0,
    score: 0,
    phase: "selecting",
  };
}

export function reducer(state: CardDiscardDownState, action: CardDiscardDownAction): CardDiscardDownState {
  if (state.phase === "done") return state;
  if (action.type === "toggle") {
    if (state.phase !== "selecting") return state;
    const sel = state.selected;
    if (sel.includes(action.index)) {
      return { ...state, selected: sel.filter(i => i !== action.index) };
    }
    if (sel.length >= 2) return state;
    return { ...state, selected: [...sel, action.index] };
  }
  if (action.type === "discard") {
    if (state.phase !== "selecting") return state;
    const newHand = [...state.hand];
    let di = state.drawIndex;
    for (const idx of state.selected) {
      newHand[idx] = state.draws[di]!;
      di += 1;
    }
    const sum = newHand.reduce((a, b) => a + pipValue(b), 0);
    // score: 50 - sum (clamped to 0)
    const pts = Math.max(0, 50 - sum);
    return { ...state, hand: newHand, drawIndex: di, finalSum: sum, score: state.score + pts, selected: [], phase: "result" };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    if (state.round >= TOTAL_ROUNDS) return { ...state, phase: "done" };
    const rng = mulberry32(state.rngSeed);
    const hand = dealUnique(rng, 5);
    const draws = dealUnique(rng, 5, new Set(hand));
    return {
      ...state,
      rngSeed: Math.floor(rng() * 2 ** 31),
      round: state.round + 1,
      hand,
      selected: [],
      draws,
      drawIndex: 0,
      finalSum: 0,
      phase: "selecting",
    };
  }
  return state;
}

export function isTerminal(state: CardDiscardDownState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
