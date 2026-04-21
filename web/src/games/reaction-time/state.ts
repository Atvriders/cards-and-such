import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type Phase = "idle" | "waiting" | "signal" | "clicked" | "done";

export interface ReactionTimeState {
  settings: { rounds: "3" | "5" | "10"; difficulty: "easy" | "medium" | "hard" };
  phase: Phase;
  currentRound: number;
  totalRounds: number;
  reactionTimes: readonly number[];
  /** Timestamp when signal appeared (performance.now() value) */
  signalAt: number | null;
  /** Delay before signal in current round (ms) */
  delayMs: number;
  /** Elapsed since round started (ms) — used to detect when signal should fire */
  elapsed: number;
  rngSeed: number;
  rngCounter: number;
}

export type ReactionTimeAction =
  | { type: "start-round" }
  | { type: "tick"; now: number }
  | { type: "click"; now: number };

const FALSE_START_PENALTY = 1000;

const DELAY_RANGES: Record<string, { min: number; max: number }> = {
  easy: { min: 1000, max: 3000 },
  medium: { min: 1000, max: 4000 },
  hard: { min: 2000, max: 5000 },
};

function seededRng(seed: number, counter: number): () => number {
  return mulberry32(seed + counter * 999983);
}

function pickDelay(seed: number, counter: number, difficulty: string): number {
  const rng = seededRng(seed, counter);
  const { min, max } = DELAY_RANGES[difficulty] ?? DELAY_RANGES["medium"]!;
  return min + rng() * (max - min);
}

export function initialState(
  seed: number,
  settings: { rounds: "3" | "5" | "10"; difficulty: "easy" | "medium" | "hard" },
): ReactionTimeState {
  const totalRounds = parseInt(settings.rounds, 10);
  return {
    settings,
    phase: "idle",
    currentRound: 0,
    totalRounds,
    reactionTimes: [],
    signalAt: null,
    delayMs: pickDelay(seed, 0, settings.difficulty),
    elapsed: 0,
    rngSeed: seed,
    rngCounter: 1,
  };
}

export function reducer(
  state: ReactionTimeState,
  action: ReactionTimeAction,
): ReactionTimeState {
  switch (action.type) {
    case "start-round": {
      if (state.phase === "done") return state;
      if (state.phase === "waiting" || state.phase === "signal") return state;
      return {
        ...state,
        phase: "waiting",
        signalAt: null,
        elapsed: 0,
      };
    }

    case "tick": {
      if (state.phase !== "waiting") return state;
      // elapsed is the difference between now and when the round started
      // We track elapsed as cumulative ms since start-round
      const newElapsed = state.elapsed + 1; // incremented per tick; actual time tracked via now
      // Check if delay has passed — use elapsed conceptually; actual signal time tracked externally
      if (state.elapsed >= state.delayMs) {
        return {
          ...state,
          phase: "signal",
          signalAt: action.now,
        };
      }
      // Increment elapsed by a small fixed amount; real timing driven by component
      return { ...state, elapsed: state.elapsed + 16 }; // ~60fps
    }

    case "click": {
      if (state.phase === "waiting") {
        // False start!
        const newTimes = [...state.reactionTimes, FALSE_START_PENALTY];
        const newRound = state.currentRound + 1;
        const done = newRound >= state.totalRounds;
        const nextDelay = pickDelay(state.rngSeed, state.rngCounter, state.settings.difficulty);
        return {
          ...state,
          phase: done ? "done" : "clicked",
          currentRound: newRound,
          reactionTimes: newTimes,
          delayMs: nextDelay,
          rngCounter: state.rngCounter + 1,
        };
      }

      if (state.phase === "signal" && state.signalAt !== null) {
        const reactionMs = action.now - state.signalAt;
        const newTimes = [...state.reactionTimes, reactionMs];
        const newRound = state.currentRound + 1;
        const done = newRound >= state.totalRounds;
        const nextDelay = pickDelay(state.rngSeed, state.rngCounter, state.settings.difficulty);
        return {
          ...state,
          phase: done ? "done" : "clicked",
          currentRound: newRound,
          reactionTimes: newTimes,
          signalAt: null,
          elapsed: 0,
          delayMs: nextDelay,
          rngCounter: state.rngCounter + 1,
        };
      }

      return state;
    }

    default:
      return state;
  }
}

export function averageReactionTime(times: readonly number[]): number {
  if (times.length === 0) return 0;
  return times.reduce((a, b) => a + b, 0) / times.length;
}

export function isTerminal(state: ReactionTimeState): { score: number } | null {
  if (state.phase !== "done") return null;
  const avg = averageReactionTime(state.reactionTimes);
  const score = Math.max(0, Math.round(1000 - avg / 2));
  return { score };
}
