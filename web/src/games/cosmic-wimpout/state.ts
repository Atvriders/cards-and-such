import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CosmicWimpoutSettings {
  target: "100" | "200" | "500";
}

export type CwPhase = "preRoll" | "rolled" | "wimpout" | "won";

export interface CosmicWimpoutState {
  settings: CosmicWimpoutSettings;
  rngSeed: number;
  bankedScore: number;
  turnScore: number;
  turnsPlayed: number;
  lastRoll: number[];
  keptIndices: number[];
  rollsThisTurn: number;
  phase: CwPhase;
}

export type CosmicWimpoutAction =
  | { type: "roll" }
  | { type: "keep"; index: number }
  | { type: "bank" }
  | { type: "nextTurn" };

export function scoreDice(dice: number[]): number {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  for (const d of dice) counts[d] = (counts[d] ?? 0) + 1;
  let score = 0;
  for (let face = 1; face <= 6; face++) {
    const n = counts[face] ?? 0;
    if (n >= 3) {
      score += face === 1 ? 100 * Math.pow(2, n - 3) : face * 10 * Math.pow(2, n - 3);
    } else {
      if (face === 1) score += n * 10;
      if (face === 5) score += n * 5;
    }
  }
  return score;
}

export function hasScoring(dice: number[]): boolean {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  for (const d of dice) counts[d] = (counts[d] ?? 0) + 1;
  if ((counts[1] ?? 0) > 0 || (counts[5] ?? 0) > 0) return true;
  for (let face = 1; face <= 6; face++) {
    if ((counts[face] ?? 0) >= 3) return true;
  }
  return false;
}

export function initialState(seed: number, settings: CosmicWimpoutSettings): CosmicWimpoutState {
  return {
    settings,
    rngSeed: seed,
    bankedScore: 0,
    turnScore: 0,
    turnsPlayed: 0,
    lastRoll: [],
    keptIndices: [],
    rollsThisTurn: 0,
    phase: "preRoll",
  };
}

function advanceSeed(seed: number): { rng: () => number; newSeed: number } {
  const rng = mulberry32(seed);
  const newSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), newSeed };
}

function rollN(n: number, rng: () => number): number[] {
  return Array.from({ length: n }, () => Math.floor(rng() * 6) + 1);
}

export function reducer(state: CosmicWimpoutState, action: CosmicWimpoutAction): CosmicWimpoutState {
  if (state.phase === "won") return state;

  const target = parseInt(state.settings.target, 10);

  switch (action.type) {
    case "roll": {
      if (state.phase !== "preRoll") return state;

      const { rng, newSeed } = advanceSeed(state.rngSeed);
      const rollCount = 5 - state.keptIndices.length;
      const newDice = rollN(rollCount, rng);

      // Build full dice array
      const fullDice: number[] = Array(5).fill(0) as number[];
      let newIdx = 0;
      for (let i = 0; i < 5; i++) {
        if (state.keptIndices.includes(i) && state.lastRoll.length > 0) {
          fullDice[i] = state.lastRoll[i] ?? 0;
        } else {
          fullDice[i] = newDice[newIdx++] ?? 1;
        }
      }

      const freshDice = fullDice.filter((_, i) => !state.keptIndices.includes(i));
      const wimpout = !hasScoring(freshDice);

      if (wimpout) {
        return {
          ...state,
          rngSeed: newSeed,
          lastRoll: fullDice,
          rollsThisTurn: state.rollsThisTurn + 1,
          phase: "wimpout",
        };
      }

      return {
        ...state,
        rngSeed: newSeed,
        lastRoll: fullDice,
        rollsThisTurn: state.rollsThisTurn + 1,
        phase: "rolled",
      };
    }

    case "keep": {
      if (state.phase !== "rolled") return state;
      const { index } = action;
      if (index < 0 || index >= 5) return state;
      if (state.keptIndices.includes(index)) return state;

      const die = state.lastRoll[index] ?? 0;
      const singleScore = scoreDice([die]);
      if (singleScore === 0) return state;

      const newKept = [...state.keptIndices, index];
      const keptValues = newKept.map((i) => state.lastRoll[i] ?? 0);
      const newTurnScore = scoreDice(keptValues);
      const allKept = newKept.length === 5;

      if (allKept) {
        const newBanked = state.bankedScore + newTurnScore;
        const won = newBanked >= target;
        return {
          ...state,
          keptIndices: [],
          lastRoll: [],
          bankedScore: newBanked,
          turnScore: 0,
          turnsPlayed: state.turnsPlayed + 1,
          phase: won ? "won" : "preRoll",
        };
      }

      return {
        ...state,
        keptIndices: newKept,
        turnScore: newTurnScore,
        phase: "rolled",
      };
    }

    case "bank": {
      if (state.phase !== "rolled") return state;
      if (state.turnScore === 0) return state;

      const newBanked = state.bankedScore + state.turnScore;
      const won = newBanked >= target;

      return {
        ...state,
        bankedScore: newBanked,
        turnScore: 0,
        keptIndices: [],
        lastRoll: [],
        rollsThisTurn: 0,
        turnsPlayed: state.turnsPlayed + 1,
        phase: won ? "won" : "preRoll",
      };
    }

    case "nextTurn": {
      if (state.phase !== "wimpout") return state;
      return {
        ...state,
        turnScore: 0,
        keptIndices: [],
        lastRoll: [],
        rollsThisTurn: 0,
        turnsPlayed: state.turnsPlayed + 1,
        phase: "preRoll",
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: CosmicWimpoutState): { score: number } | null {
  if (state.phase !== "won") return null;
  return { score: Math.max(0, 1000 - state.turnsPlayed * 10) };
}
