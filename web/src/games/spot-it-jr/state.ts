import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 12;
export const SYMBOLS_PER_CARD = 6;
export const SCORE_PER_HIT = 10;

export interface SpotItJrSettings { dummy: boolean; }

export const SYMBOLS: string[] = ["🐱","🐶","🐰","🐻","🐼","🐯","🦁","🐸","🐵","🦊","🐷","🦄","🐨","🐹","🐭","🦝","🦔","🐧"];

export interface SpotItJrCard { symbols: string[]; }

export interface SpotItJrRound {
  cardA: SpotItJrCard;
  cardB: SpotItJrCard;
  shared: string;
}

export interface SpotItJrState {
  rngSeed: number;
  rounds: SpotItJrRound[];
  currentIndex: number;
  selected: string | null;
  submitted: boolean;
  startMs: number;
  lastMs: number;
  totalMs: number;
  score: number;
  correctCount: number;
  phase: "playing" | "result" | "done";
}

export type SpotItJrAction =
  | { type: "select"; symbol: string; nowMs: number }
  | { type: "next"; nowMs: number };

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function genRounds(rng: () => number): SpotItJrRound[] {
  const out: SpotItJrRound[] = [];
  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const shared = SYMBOLS[Math.floor(rng() * SYMBOLS.length)]!;
    const others = SYMBOLS.filter(s => s !== shared);
    const shuffled = shuffle(others, rng);
    const filler = shuffled.slice(0, (SYMBOLS_PER_CARD - 1) * 2);
    const cardA: string[] = [shared, ...filler.slice(0, SYMBOLS_PER_CARD - 1)];
    const cardB: string[] = [shared, ...filler.slice(SYMBOLS_PER_CARD - 1)];
    out.push({
      cardA: { symbols: shuffle(cardA, rng) },
      cardB: { symbols: shuffle(cardB, rng) },
      shared,
    });
  }
  return out;
}

export function initialState(seed: number, _s: SpotItJrSettings): SpotItJrState {
  const rng = mulberry32(seed);
  return {
    rngSeed: Math.floor(rng() * 2 ** 31),
    rounds: genRounds(rng),
    currentIndex: 0,
    selected: null,
    submitted: false,
    startMs: 0,
    lastMs: 0,
    totalMs: 0,
    score: 0,
    correctCount: 0,
    phase: "playing",
  };
}

export function reducer(state: SpotItJrState, action: SpotItJrAction): SpotItJrState {
  if (state.phase === "done") return state;
  if (action.type === "select") {
    if (state.submitted) return state;
    const r = state.rounds[state.currentIndex]!;
    const ok = action.symbol === r.shared;
    const elapsed = state.startMs > 0 ? Math.max(0, action.nowMs - state.startMs) : 0;
    const speedBonus = ok ? Math.max(0, Math.floor(20 - elapsed / 250)) : 0;
    return {
      ...state,
      selected: action.symbol,
      submitted: true,
      lastMs: elapsed,
      totalMs: state.totalMs + elapsed,
      score: state.score + (ok ? SCORE_PER_HIT + speedBonus : 0),
      correctCount: state.correctCount + (ok ? 1 : 0),
      phase: "result",
    };
  }
  if (action.type === "next") {
    if (!state.submitted) return state;
    const ni = state.currentIndex + 1;
    if (ni >= state.rounds.length) return { ...state, phase: "done" };
    return { ...state, currentIndex: ni, selected: null, submitted: false, startMs: action.nowMs, lastMs: 0, phase: "playing" };
  }
  return state;
}

export function isTerminal(state: SpotItJrState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
