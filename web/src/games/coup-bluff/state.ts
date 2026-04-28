import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CoupBluffSettings { rounds: "10"; }

export interface CoupBluffRound {
  cpuClaim: string;     // What the CPU claims
  cpuActual: string;    // What the CPU actually has
  isBluffing: boolean;
  tellLevel: number;    // 0-100: higher means more obvious tell when bluffing
}

export interface CoupBluffState {
  rounds: CoupBluffRound[];
  currentIndex: number;
  decision: "trust" | "callBluff" | null;
  resolved: boolean;
  score: number;
  callsCorrect: number;
  phase: "playing" | "result" | "done";
}

export type CoupBluffAction =
  | { type: "decide"; decision: "trust" | "callBluff" }
  | { type: "next" };

const ITEMS: string[] = ["Duke (Tax 3)","Assassin (Assassinate)","Captain (Steal)","Ambassador (Exchange)","Contessa (Block Assassin)"];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, _settings: CoupBluffSettings): CoupBluffState {
  const rng = mulberry32(seed);
  const rounds: CoupBluffRound[] = [];
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

export function reducer(state: CoupBluffState, action: CoupBluffAction): CoupBluffState {
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

export function isTerminal(state: CoupBluffState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
