import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface Target {
  id: number;
  x: number; // 0-1 normalized
  y: number; // 0-1 normalized
  radius: number; // pixels
  lifetime: number; // total seconds
  age: number; // seconds alive
}

export interface TargetPracticeState {
  settings: { duration: "30" | "60" | "90"; difficulty: "easy" | "medium" | "hard" };
  targets: readonly Target[];
  score: number;
  misses: number;
  elapsed: number;
  ended: boolean;
  rngSeed: number;
  rngCounter: number;
  nextId: number;
}

export type TargetPracticeAction =
  | { type: "tick"; dt: number }
  | { type: "hit"; id: number }
  | { type: "miss" };

const DIFFICULTY = {
  easy:   { spawnInterval: 1.5, lifetimeMin: 3.5, lifetimeMax: 5.0, radiusMin: 40, radiusMax: 60 },
  medium: { spawnInterval: 1.0, lifetimeMin: 2.0, lifetimeMax: 3.5, radiusMin: 25, radiusMax: 50 },
  hard:   { spawnInterval: 0.7, lifetimeMin: 1.2, lifetimeMax: 2.5, radiusMin: 15, radiusMax: 35 },
};

function rngAt(seed: number, counter: number): number {
  const rng = mulberry32(seed + counter * 1000003);
  return rng();
}

export function initialState(
  seed: number,
  settings: { duration: "30" | "60" | "90"; difficulty: "easy" | "medium" | "hard" },
): TargetPracticeState {
  return {
    settings,
    targets: [],
    score: 0,
    misses: 0,
    elapsed: 0,
    ended: false,
    rngSeed: seed,
    rngCounter: 0,
    nextId: 0,
  };
}

export function reducer(state: TargetPracticeState, action: TargetPracticeAction): TargetPracticeState {
  if (state.ended && action.type !== "tick") return state;

  switch (action.type) {
    case "tick": {
      const duration = parseInt(state.settings.duration, 10);
      const newElapsed = state.elapsed + action.dt;
      if (state.ended) return state;
      const ended = newElapsed >= duration;

      const cfg = DIFFICULTY[state.settings.difficulty];
      let counter = state.rngCounter;
      let nextId = state.nextId;

      // Age targets, remove expired ones
      const aged = state.targets
        .map((t) => ({ ...t, age: t.age + action.dt }))
        .filter((t) => t.age < t.lifetime);

      // Spawn new targets based on elapsed intervals
      const prevSpawns = Math.floor(state.elapsed / cfg.spawnInterval);
      const newSpawns = Math.floor(newElapsed / cfg.spawnInterval);
      const toSpawn = ended ? 0 : newSpawns - prevSpawns;

      const spawned: Target[] = [...aged];
      for (let i = 0; i < toSpawn; i++) {
        const x = 0.05 + rngAt(state.rngSeed, counter++) * 0.9;
        const y = 0.05 + rngAt(state.rngSeed, counter++) * 0.9;
        const lifetimeRange = cfg.lifetimeMax - cfg.lifetimeMin;
        const lifetime = cfg.lifetimeMin + rngAt(state.rngSeed, counter++) * lifetimeRange;
        const radiusRange = cfg.radiusMax - cfg.radiusMin;
        const radius = cfg.radiusMin + rngAt(state.rngSeed, counter++) * radiusRange;
        spawned.push({ id: nextId++, x, y, radius, lifetime, age: 0 });
      }

      return {
        ...state,
        targets: spawned,
        elapsed: ended ? duration : newElapsed,
        ended,
        rngCounter: counter,
        nextId,
      };
    }

    case "hit": {
      if (state.ended) return state;
      const target = state.targets.find((t) => t.id === action.id);
      if (!target) return state;
      // Smaller and faster-disappearing targets = more points
      const timeLeft = target.lifetime - target.age;
      const radiusFactor = 1 + (60 - target.radius) / 30; // larger radius = fewer points
      const timeFactor = 1 + (1 - timeLeft / target.lifetime); // near-expiry bonus
      const points = Math.max(1, Math.round(radiusFactor * timeFactor));
      return {
        ...state,
        targets: state.targets.filter((t) => t.id !== action.id),
        score: state.score + points,
      };
    }

    case "miss": {
      if (state.ended) return state;
      return { ...state, score: Math.max(0, state.score - 1), misses: state.misses + 1 };
    }

    default:
      return state;
  }
}

export function isTerminal(state: TargetPracticeState): { score: number } | null {
  if (!state.ended) return null;
  return { score: state.score };
}
