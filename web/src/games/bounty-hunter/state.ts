import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 10;

export type Difficulty = "easy" | "medium" | "hard";

export interface Target {
  name: string;
  bounty: number;
  evasion: number; // 0-1, chance they escape
  danger: number;  // 0-1, chance of taking damage
}

export interface BountyHunterState {
  rngSeed: number;
  round: number;
  credits: number;
  health: number;
  target: Target;
  phase: "hunt" | "result" | "done";
  lastResult: string;
  log: readonly string[];
}

export type BountyHunterAction =
  | { type: "pursue" }
  | { type: "skip" }
  | { type: "nextRound" };

const NAMES = ["Sly Fox", "Iron Kate", "Vex", "Nox", "Rook", "Blade", "Ghost", "Cipher", "Rix", "Fang"];

function makeTarget(rng: () => number, round: number): Target {
  const nameIdx = Math.floor(rng() * NAMES.length);
  const tier = Math.min(3, Math.floor(round / 3));
  const bounty = Math.round(50 + tier * 40 + rng() * 60);
  const evasion = 0.1 + tier * 0.08 + rng() * 0.15;
  const danger = 0.1 + tier * 0.1 + rng() * 0.1;
  return { name: NAMES[nameIdx] ?? "Unknown", bounty, evasion: Math.min(0.7, evasion), danger: Math.min(0.6, danger) };
}

export function initialState(seed: number): BountyHunterState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const rng2 = mulberry32(nextSeed);
  const target = makeTarget(rng2, 1);
  return {
    rngSeed: nextSeed,
    round: 1,
    credits: 100,
    health: 100,
    target,
    phase: "hunt",
    lastResult: "",
    log: [],
  };
}

export function reducer(state: BountyHunterState, action: BountyHunterAction): BountyHunterState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "pursue": {
      if (state.phase !== "hunt") return state;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const escaped = rng() < state.target.evasion;
      const hurt = rng() < state.target.danger;
      const dmg = hurt ? Math.round(15 + rng() * 20) : 0;
      const newHealth = Math.max(0, state.health - dmg);
      const earned = escaped ? 0 : state.target.bounty;
      const newCredits = state.credits + earned;
      const result = escaped
        ? `${state.target.name} escaped!${hurt ? ` You took ${dmg} damage.` : ""}`
        : `Caught ${state.target.name}! +$${earned}${hurt ? ` but took ${dmg} damage.` : ""}`;
      const dead = newHealth <= 0;
      return {
        ...state,
        rngSeed: nextSeed,
        credits: newCredits,
        health: newHealth,
        phase: dead ? "done" : "result",
        lastResult: result,
        log: [...state.log, result],
      };
    }

    case "skip": {
      if (state.phase !== "hunt") return state;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      return {
        ...state,
        rngSeed: nextSeed,
        phase: "result",
        lastResult: `Skipped ${state.target.name}.`,
        log: [...state.log, `Skipped ${state.target.name}.`],
      };
    }

    case "nextRound": {
      if (state.phase !== "result") return state;
      const newRound = state.round + 1;
      if (newRound > TOTAL_ROUNDS) return { ...state, round: newRound, phase: "done" };
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const rng2 = mulberry32(nextSeed);
      const target = makeTarget(rng2, newRound);
      return { ...state, rngSeed: nextSeed, round: newRound, target, phase: "hunt" };
    }
  }
}

export function isTerminal(state: BountyHunterState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, Math.min(100, Math.round((state.credits / 700) * 100))) };
}
