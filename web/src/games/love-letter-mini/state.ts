import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface LoveLetterMiniSettings { rounds: "10"; }

export interface LoveLetterMiniRound {
  cpuClaim: string;     // What the CPU claims
  cpuActual: string;    // What the CPU actually has
  isBluffing: boolean;
  tellLevel: number;    // 0-100: higher means more obvious tell when bluffing
}

export interface LoveLetterMiniState {
  rounds: LoveLetterMiniRound[];
  currentIndex: number;
  decision: "trust" | "callBluff" | null;
  resolved: boolean;
  score: number;
  callsCorrect: number;
  phase: "playing" | "result" | "done";
}

export type LoveLetterMiniAction =
  | { type: "decide"; decision: "trust" | "callBluff" }
  | { type: "next" };

const ITEMS: string[] = ["Guard guessing Priest","Guard guessing Baron","Guard guessing Handmaid","Priest (peek)","Baron (compare)","Handmaid (protect)","Prince (discard)","King (trade)","Countess (forced)","Princess (lose if discarded)"];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, _settings: LoveLetterMiniSettings): LoveLetterMiniState {
  const rng = mulberry32(seed);
  const rounds: LoveLetterMiniRound[] = [];
  for (let i = 0; i < 10; i++) {
    const isBluffing = rng() < 0.5;
    const claimIdx = Math.floor(rng() * ITEMS.length);
    const claim = ITEMS[claimIdx]!;
    let actual = claim;
    if (isBluffing) {
      let attempts = 0;
      while (actual === claim && attempts < 20) {
        actual = ITEMS[Math.floor(rng() * ITEMS.length)]!;
        attempts++;
      }
    }
    const tellLevel = isBluffing ? Math.floor(rng() * 100) : Math.floor(rng() * 50);
    rounds.push({ cpuClaim: claim, cpuActual: actual, isBluffing, tellLevel });
  }
  return {
    rounds,
    currentIndex: 0,
    decision: null,
    resolved: false,
    score: 0,
    callsCorrect: 0,
    phase: "playing",
  };
}

export function reducer(state: LoveLetterMiniState, action: LoveLetterMiniAction): LoveLetterMiniState {
  if (state.phase === "done") return state;
  switch (action.type) {
    case "decide": {
      if (state.resolved) return state;
      const r = state.rounds[state.currentIndex]!;
      const correct = (action.decision === "callBluff") === r.isBluffing;
      return {
        ...state,
        decision: action.decision,
        resolved: true,
        score: state.score + (correct ? 100 : 0),
        callsCorrect: state.callsCorrect + (correct ? 1 : 0),
        phase: "result",
      };
    }
    case "next": {
      const ni = state.currentIndex + 1;
      if (ni >= state.rounds.length) return { ...state, phase: "done" };
      return { ...state, currentIndex: ni, decision: null, resolved: false, phase: "playing" };
    }
    default:
      return state;
  }
}

export function isTerminal(state: LoveLetterMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
