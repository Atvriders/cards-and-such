import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import type { DieFace } from "../../engines/dice/index.js";

// Mini Tenzi — get all 10 dice on the same face. The chosen target is
// fixed once the player has rolled and picked it (auto-picked from initial
// roll = the most-common face). Hold/un-hold any dice; reroll unheld.
// First success wins. Score = (max(0, MAX_ROLLS - rolls)) * 10 + bonus.

export const NUM_DICE = 10;
export const MAX_ROLLS = 30;

export interface MiniTenziSettings { dummy: boolean; }

export interface MiniTenziState {
  rngSeed: number;
  dice: DieFace[];
  held: boolean[];
  rolls: number;
  target: DieFace;
  phase: "play" | "won" | "lost";
  startTimeMs: number;
  endTimeMs: number;
}

export type MiniTenziAction =
  | { type: "roll"; nowMs?: number }
  | { type: "toggle"; idx: number }
  | { type: "tick"; nowMs: number };

function rollN(rng: () => number, n: number): DieFace[] {
  const out: DieFace[] = [];
  for (let i = 0; i < n; i++) out.push((1 + Math.floor(rng() * 6)) as DieFace);
  return out;
}

function pickTarget(dice: DieFace[]): DieFace {
  const counts: Record<number, number> = {};
  for (const d of dice) counts[d] = (counts[d] ?? 0) + 1;
  // pick most common face; tie-break: lowest face number for determinism
  let best: DieFace = 1;
  let bestCount = 0;
  for (let f = 1; f <= 6; f++) {
    const c = counts[f] ?? 0;
    if (c > bestCount) { best = f as DieFace; bestCount = c; }
  }
  return best;
}

export function initialState(seed: number, _s: MiniTenziSettings): MiniTenziState {
  const rng = mulberry32(seed);
  const dice = rollN(rng, NUM_DICE);
  const next = Math.floor(rng() * 2 ** 31);
  const target = pickTarget(dice);
  const held = dice.map((d) => d === target);
  // startTimeMs/ endTimeMs are 0 initially; first action sets startTime via tick
  return {
    rngSeed: next,
    dice,
    held,
    rolls: 1,
    target,
    phase: held.every((h) => h) ? "won" : "play",
    startTimeMs: 0,
    endTimeMs: 0,
  };
}

export function reducer(state: MiniTenziState, action: MiniTenziAction): MiniTenziState {
  if (state.phase !== "play") return state;

  if (action.type === "tick") {
    if (state.startTimeMs === 0) return { ...state, startTimeMs: action.nowMs };
    return state;
  }

  if (action.type === "toggle") {
    const held = [...state.held];
    held[action.idx] = !held[action.idx];
    return { ...state, held };
  }

  if (action.type === "roll") {
    const rng = mulberry32(state.rngSeed);
    const dice = state.dice.map((d, i) => state.held[i] ? d : (1 + Math.floor(rng() * 6)) as DieFace);
    const next = Math.floor(rng() * 2 ** 31);
    // Auto-hold any matching target
    const held = state.held.map((h, i) => h || dice[i] === state.target);
    const rolls = state.rolls + 1;
    const startTimeMs = state.startTimeMs === 0 && action.nowMs ? action.nowMs : state.startTimeMs;
    if (held.every((h) => h)) {
      return { ...state, rngSeed: next, dice, held, rolls, phase: "won", startTimeMs, endTimeMs: action.nowMs ?? 0 };
    }
    if (rolls >= MAX_ROLLS) {
      return { ...state, rngSeed: next, dice, held, rolls, phase: "lost", startTimeMs, endTimeMs: action.nowMs ?? 0 };
    }
    return { ...state, rngSeed: next, dice, held, rolls, startTimeMs };
  }

  return state;
}

export function elapsedMs(state: MiniTenziState, nowMs: number): number {
  if (state.startTimeMs === 0) return 0;
  const end = state.endTimeMs > 0 ? state.endTimeMs : nowMs;
  return Math.max(0, end - state.startTimeMs);
}

export function isTerminal(state: MiniTenziState): { score: number } | null {
  if (state.phase === "play") return null;
  if (state.phase === "lost") {
    // partial credit for matching dice
    const matched = state.dice.filter((d) => d === state.target).length;
    return { score: matched * 5 };
  }
  // won — fewer rolls = higher score
  const rollBonus = Math.max(0, MAX_ROLLS - state.rolls) * 10;
  return { score: 100 + rollBonus };
}
