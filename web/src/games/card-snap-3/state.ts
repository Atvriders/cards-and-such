import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Card Snap 3: Cards flip one at a time. Hit Snap when 3 cards of the same rank appear in a row.
// Player has limited snap chances. Wrong snap = penalty.

export interface CardSnap3Settings { rounds: "15" | "30"; }

export interface CardSnap3State {
  deck: number[];
  pos: number;
  history: number[];   // last 3 revealed cards
  snaps: number;       // correct snaps
  misses: number;      // wrong snaps
  round: number;
  maxRounds: number;
  score: number;
  phase: "playing" | "gameover";
  lastSnap: "correct" | "wrong" | null;
}

export type CardSnap3Action = { type: "flip" } | { type: "snap" };

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

export function isSnappable(history: number[]): boolean {
  if (history.length < 3) return false;
  const last3 = history.slice(-3);
  return last3[0]! % 13 === last3[1]! % 13 && last3[1]! % 13 === last3[2]! % 13;
}

export function initialState(seed: number, settings: CardSnap3Settings): CardSnap3State {
  const rng = mulberry32(seed);
  const deck = makeDeck(rng);
  return { deck, pos: 0, history: [], snaps: 0, misses: 0, round: 0, maxRounds: parseInt(settings.rounds, 10), score: 0, phase: "playing", lastSnap: null };
}

export function reducer(state: CardSnap3State, action: CardSnap3Action): CardSnap3State {
  if (state.phase === "gameover") return state;
  if (action.type === "flip") {
    const card = state.deck[state.pos % state.deck.length]!;
    const newHistory = [...state.history, card].slice(-3);
    const newRound = state.round + 1;
    const phase = newRound >= state.maxRounds ? "gameover" : "playing";
    return { ...state, pos: state.pos + 1, history: newHistory, round: newRound, phase, lastSnap: null };
  }
  if (action.type === "snap") {
    const correct = isSnappable(state.history);
    if (correct) {
      return { ...state, snaps: state.snaps + 1, score: state.score + 50, lastSnap: "correct" };
    } else {
      return { ...state, misses: state.misses + 1, score: Math.max(0, state.score - 20), lastSnap: "wrong" };
    }
  }
  return state;
}

export function isTerminal(state: CardSnap3State): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
