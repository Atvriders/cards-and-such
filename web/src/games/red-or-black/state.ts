import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface RedOrBlackSettings {
  rounds: "10" | "20" | "30";
}

export interface RedOrBlackState {
  deck: number[];
  pos: number;
  currentCard: number | null;
  round: number;
  maxRounds: number;
  score: number;
  redSeen: number;
  blackSeen: number;
  phase: "guessing" | "reveal" | "gameover";
  lastResult: "correct" | "wrong" | null;
  lastCard: number | null;
}

export type RedOrBlackAction = { type: "guess"; color: "red" | "black" } | { type: "next" };

function makeDeck(seed: number): number[] {
  const arr = Array.from({ length: 52 }, (_, i) => i);
  const rng = mulberry32(seed);
  for (let i = 51; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

export function isRed(c: number): boolean { const suit = Math.floor(c / 13); return suit === 1 || suit === 2; }
export function cardName(c: number): string {
  const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  const suits = ["♠", "♥", "♦", "♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}

export function initialState(seed: number, settings: RedOrBlackSettings): RedOrBlackState {
  const deck = makeDeck(seed);
  return {
    deck, pos: 0, currentCard: null,
    round: 1, maxRounds: parseInt(settings.rounds, 10),
    score: 0, redSeen: 0, blackSeen: 0,
    phase: "guessing", lastResult: null, lastCard: null,
  };
}

export function reducer(state: RedOrBlackState, action: RedOrBlackAction): RedOrBlackState {
  if (state.phase === "gameover") return state;
  if (action.type === "guess") {
    if (state.phase !== "guessing") return state;
    const card = state.deck[state.pos]!;
    const red = isRed(card);
    const correct = (action.color === "red") === red;
    const pts = correct ? 10 : 0;
    const phase = state.round >= state.maxRounds ? "gameover" : "reveal";
    return {
      ...state, currentCard: card, lastResult: correct ? "correct" : "wrong",
      score: state.score + pts,
      redSeen: state.redSeen + (red ? 1 : 0),
      blackSeen: state.blackSeen + (!red ? 1 : 0),
      phase, lastCard: card,
    };
  }
  if (action.type === "next") {
    if (state.phase !== "reveal") return state;
    return { ...state, pos: state.pos + 1, currentCard: null, round: state.round + 1, phase: "guessing", lastResult: null };
  }
  return state;
}

export function isTerminal(state: RedOrBlackState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
