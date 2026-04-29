import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DragonDiceArenaSettings { rounds: "10"; }

export interface DragonDiceArenaState {
  rngSeed: number;
  score: number;
  round: number;
  maxRounds: number;
  lastRoll: number[];
  lastGain: number;
  phase: "ready" | "rolled" | "gameover";
}

export type DragonDiceArenaAction = { type: "roll" } | { type: "next" };

function rollFive(seed: number): { dice: number[]; nextSeed: number } {
  const rng = mulberry32(seed);
  const dice: number[] = [];
  for (let i = 0; i < 5; i++) dice.push(Math.floor(rng() * 6) + 1);
  return { dice, nextSeed: (seed + 7919) >>> 0 };
}

export function scoreRoll(dice: number[], round: number): number {
  // generic: sum of top 3 + pair bonus + chain bonus
  const sorted = [...dice].sort((a, b) => b - a);
  let s = (sorted[0] ?? 0) + (sorted[1] ?? 0) + (sorted[2] ?? 0);
  const counts: Record<number, number> = {};
  for (const v of dice) counts[v] = (counts[v] ?? 0) + 1;
  for (const k of Object.keys(counts)) {
    const c = counts[Number(k)] ?? 0;
    if (c >= 3) s += 5;
    else if (c === 2) s += 2;
  }
  // small round bonus (so rounds differ)
  if (round % 3 === 0) s += 3;
  return s;
}

export function initialState(seed: number, _settings: DragonDiceArenaSettings): DragonDiceArenaState {
  return {
    rngSeed: seed >>> 0,
    score: 0,
    round: 1,
    maxRounds: 10,
    lastRoll: [],
    lastGain: 0,
    phase: "ready",
  };
}

export function reducer(state: DragonDiceArenaState, action: DragonDiceArenaAction): DragonDiceArenaState {
  if (state.phase === "gameover") return state;
  if (action.type === "roll") {
    if (state.phase !== "ready") return state;
    const { dice, nextSeed } = rollFive(state.rngSeed);
    const gain = scoreRoll(dice, state.round);
    return { ...state, rngSeed: nextSeed, lastRoll: dice, lastGain: gain, score: state.score + gain, phase: "rolled" };
  }
  if (action.type === "next") {
    if (state.phase !== "rolled") return state;
    if (state.round >= state.maxRounds) return { ...state, phase: "gameover" };
    return { ...state, round: state.round + 1, phase: "ready", lastGain: 0, lastRoll: [] };
  }
  return state;
}

export function isTerminal(state: DragonDiceArenaState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
