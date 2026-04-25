import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Firework Show: tap the screen to launch fireworks at the right moment
// Hit targets in the sky for points; miss and lose multiplier

export type FireworkColor = "red" | "gold" | "blue" | "green" | "purple";

export interface Target {
  id: number;
  x: number;    // 0-100
  y: number;    // 0-100
  radius: number;
  color: FireworkColor;
  timeLeft: number;  // ticks remaining before target disappears
  points: number;
  hit: boolean;
}

export interface FireworkState {
  rngSeed: number;
  tick: number;
  maxTicks: number;
  score: number;
  multiplier: number;
  targets: Target[];
  nextId: number;
  hits: number;
  misses: number;
  phase: "playing" | "done";
  spawnCooldown: number;
}

const COLORS: FireworkColor[] = ["red", "gold", "blue", "green", "purple"];
const COLOR_POINTS: Record<FireworkColor, number> = {
  red: 10, gold: 25, blue: 15, green: 12, purple: 20,
};

export function initialState(seed: number): FireworkState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    tick: 0,
    maxTicks: 400,
    score: 0,
    multiplier: 1,
    targets: [],
    nextId: 0,
    hits: 0,
    misses: 0,
    phase: "playing",
    spawnCooldown: 0,
  };
}

export type FireworkAction =
  | { type: "tick" }
  | { type: "tap"; targetId: number };

export function reducer(state: FireworkState, action: FireworkAction): FireworkState {
  if (state.phase === "done") return state;

  if (action.type === "tap") {
    const target = state.targets.find(t => t.id === action.targetId && !t.hit && t.timeLeft > 0);
    if (!target) return state;
    const earned = target.points * state.multiplier;
    const newTargets = state.targets.map(t =>
      t.id === action.targetId ? { ...t, hit: true } : t
    );
    const newMultiplier = Math.min(8, state.multiplier + 0.5);
    return {
      ...state,
      targets: newTargets,
      score: state.score + earned,
      multiplier: newMultiplier,
      hits: state.hits + 1,
    };
  }

  // tick
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const newTick = state.tick + 1;

  // decrement target timers, detect newly expired
  let missCount = 0;
  const newTargets = state.targets
    .map(t => {
      if (t.hit) return t;
      const tl = t.timeLeft - 1;
      if (tl <= 0 && !t.hit) missCount++;
      return { ...t, timeLeft: tl };
    })
    .filter(t => t.hit || t.timeLeft > 0);

  const newMultiplier = missCount > 0 ? 1 : state.multiplier;
  let spawnCd = state.spawnCooldown - 1;
  let nid = state.nextId;
  let spawnTarget: Target | null = null;

  if (spawnCd <= 0) {
    const rng2 = mulberry32(nextSeed);
    const color: FireworkColor = COLORS[Math.floor(rng2() * 5) % 5] ?? "red";
    spawnTarget = {
      id: nid++,
      x: 10 + Math.floor(rng2() * 80),
      y: 10 + Math.floor(rng2() * 60),
      radius: 8 + Math.floor(rng2() * 10),
      color,
      timeLeft: 30 + Math.floor(rng2() * 20),
      points: COLOR_POINTS[color],
      hit: false,
    };
    spawnCd = 10 + Math.floor(rng2() * 15);
  }

  const finalTargets = spawnTarget ? [...newTargets, spawnTarget] : newTargets;
  const phase = newTick >= state.maxTicks ? "done" : "playing";

  return {
    ...state,
    rngSeed: nextSeed,
    tick: newTick,
    targets: finalTargets,
    nextId: nid,
    spawnCooldown: spawnCd,
    multiplier: newMultiplier,
    misses: state.misses + missCount,
    phase,
  };
}

export function isTerminal(state: FireworkState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.min(100, Math.round(state.score / 50)) };
}
