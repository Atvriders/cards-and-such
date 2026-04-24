import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Target {
  id: number;
  x: number; // 0-1 relative to arena
  y: number; // 0-1 relative to arena
  radius: number; // px
  spawnedAt: number; // ms timestamp
}

export interface AimTrainerState {
  settings: { targets: "10" | "20" | "30"; difficulty: "easy" | "medium" | "hard" };
  target: Target | null;
  totalTargets: number;
  hit: number;
  missed: number;
  reactionTimes: number[];
  ended: boolean;
  rngSeed: number;
  rngCounter: number;
  nextId: number;
}

export type AimTrainerAction =
  | { type: "spawn"; now: number }
  | { type: "hit"; targetId: number; now: number }
  | { type: "miss"; now: number };

const RADIUS: Record<string, number> = {
  easy: 40,
  medium: 26,
  hard: 16,
};

function nextTarget(seed: number, counter: number, difficulty: string, id: number, now: number): Target {
  const rng = mulberry32(seed + counter * 999983);
  const r = RADIUS[difficulty] ?? 26;
  // Keep center far enough from edges
  const margin = r / 400; // normalized
  const x = margin + rng() * (1 - 2 * margin);
  const y = margin + rng() * (1 - 2 * margin);
  return { id, x, y, radius: r, spawnedAt: now };
}

export function initialState(
  seed: number,
  settings: { targets: "10" | "20" | "30"; difficulty: "easy" | "medium" | "hard" },
): AimTrainerState {
  return {
    settings,
    target: null,
    totalTargets: parseInt(settings.targets, 10),
    hit: 0,
    missed: 0,
    reactionTimes: [],
    ended: false,
    rngSeed: seed,
    rngCounter: 0,
    nextId: 0,
  };
}

export function reducer(state: AimTrainerState, action: AimTrainerAction): AimTrainerState {
  if (state.ended) return state;

  switch (action.type) {
    case "spawn": {
      if (state.target !== null) return state; // Already has a target
      const total = state.hit + state.missed;
      if (total >= state.totalTargets) {
        return { ...state, ended: true };
      }
      const t = nextTarget(state.rngSeed, state.rngCounter, state.settings.difficulty, state.nextId, action.now);
      return {
        ...state,
        target: t,
        rngCounter: state.rngCounter + 1,
        nextId: state.nextId + 1,
      };
    }
    case "hit": {
      if (!state.target || state.target.id !== action.targetId) return state;
      const reactionMs = action.now - state.target.spawnedAt;
      const newHit = state.hit + 1;
      const total = newHit + state.missed;
      const ended = total >= state.totalTargets;
      return {
        ...state,
        target: null,
        hit: newHit,
        reactionTimes: [...state.reactionTimes, reactionMs],
        ended,
      };
    }
    case "miss": {
      if (!state.target) return state;
      const newMissed = state.missed + 1;
      const total = state.hit + newMissed;
      const ended = total >= state.totalTargets;
      return {
        ...state,
        target: null,
        missed: newMissed,
        ended,
      };
    }
    default:
      return state;
  }
}

export function calcScore(state: AimTrainerState): number {
  if (state.hit === 0) return 0;
  const avgReaction =
    state.reactionTimes.reduce((a, b) => a + b, 0) / state.reactionTimes.length;
  const acc = state.hit / (state.hit + state.missed);
  return Math.round(state.hit * acc * (1000 / Math.max(avgReaction, 100)));
}

export function isTerminal(state: AimTrainerState): { score: number } | null {
  if (!state.ended) return null;
  return { score: calcScore(state) };
}
