import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * Zilch — roll 6 dice, set aside scoring dice, keep rolling remaining dice.
 * Scoring: 1=100pts, 5=50pts, three-of-a-kind = face×100 (1s=1000).
 * Zilch: no scoring dice in a roll = lose all turn points (a "zilch").
 * Three zilches in a row = -500 pts.
 * First to 10,000 wins.
 */

export interface ZilchSettings {
  target: "5000" | "10000";
}

export type DieFace = 1 | 2 | 3 | 4 | 5 | 6;

export interface ZilchState {
  settings: ZilchSettings;
  rngSeed: number;
  score: number;
  turnScore: number;
  currentRoll: DieFace[];
  heldIndices: number[];
  diceLeft: number;
  phase: "preRoll" | "rolled" | "zilched" | "won";
  consecutiveZilches: number;
  rollCount: number;
}

export type ZilchAction =
  | { type: "roll" }
  | { type: "toggleHold"; index: number }
  | { type: "bank" }
  | { type: "nextTurn" };

function rollN(n: number, seed: number): { values: DieFace[]; nextSeed: number } {
  let s = seed >>> 0;
  const values: DieFace[] = [];
  for (let i = 0; i < n; i++) {
    const rng = mulberry32(s);
    const v1 = rng();
    const ns = (Math.floor(v1 * 2 ** 31)) >>> 0;
    const rng2 = mulberry32(s);
    values.push((Math.floor(rng2() * 6) + 1) as DieFace);
    s = ns;
  }
  return { values, nextSeed: s };
}

export function scoreSelection(values: DieFace[]): number {
  if (values.length === 0) return 0;
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  for (const v of values) counts[v] = (counts[v] ?? 0) + 1;

  let total = 0;
  for (const face of [1, 2, 3, 4, 5, 6] as DieFace[]) {
    const n = counts[face] ?? 0;
    if (n >= 3) {
      total += (face === 1 ? 1000 : face * 100) * Math.pow(2, n - 3);
    }
  }
  const c1 = counts[1] ?? 0;
  const c5 = counts[5] ?? 0;
  const rem1 = c1 < 3 ? c1 : 0;
  const rem5 = c5 < 3 ? c5 : 0;
  total += rem1 * 100 + rem5 * 50;
  return total;
}

function hasAnyScore(values: DieFace[]): boolean {
  return scoreSelection(values) > 0 || values.some((v) => v === 1 || v === 5);
}

export function initialState(seed: number, settings: ZilchSettings): ZilchState {
  return {
    settings,
    rngSeed: seed >>> 0,
    score: 0,
    turnScore: 0,
    currentRoll: [],
    heldIndices: [],
    diceLeft: 6,
    phase: "preRoll",
    consecutiveZilches: 0,
    rollCount: 0,
  };
}

export function reducer(state: ZilchState, action: ZilchAction): ZilchState {
  switch (action.type) {
    case "roll": {
      if (state.phase !== "preRoll") return state;
      const { values, nextSeed } = rollN(state.diceLeft, state.rngSeed);
      const zilch = !hasAnyScore(values);
      if (zilch) {
        const newZilches = state.consecutiveZilches + 1;
        const penalty = newZilches >= 3 ? -500 : 0;
        return {
          ...state,
          rngSeed: nextSeed,
          currentRoll: values,
          heldIndices: [],
          phase: "zilched",
          turnScore: 0,
          score: state.score + penalty,
          consecutiveZilches: newZilches >= 3 ? 0 : newZilches,
          rollCount: state.rollCount + 1,
        };
      }
      return {
        ...state,
        rngSeed: nextSeed,
        currentRoll: values,
        heldIndices: [],
        phase: "rolled",
        rollCount: state.rollCount + 1,
      };
    }

    case "toggleHold": {
      if (state.phase !== "rolled") return state;
      const { index } = action;
      if (index < 0 || index >= state.currentRoll.length) return state;
      const held = state.heldIndices.includes(index)
        ? state.heldIndices.filter((i) => i !== index)
        : [...state.heldIndices, index];
      return { ...state, heldIndices: held };
    }

    case "bank": {
      if (state.phase !== "rolled") return state;
      if (state.heldIndices.length === 0) return state;
      const heldVals = state.heldIndices.map((i) => state.currentRoll[i]).filter((v): v is DieFace => v !== undefined);
      const pts = scoreSelection(heldVals);
      if (pts === 0) return state; // invalid selection
      const newTurnScore = state.turnScore + pts;
      const newScore = state.score + newTurnScore;
      const target = Number(state.settings.target);
      const won = newScore >= target;
      return {
        ...state,
        score: newScore,
        turnScore: 0,
        diceLeft: 6,
        currentRoll: [],
        heldIndices: [],
        phase: won ? "won" : "preRoll",
        consecutiveZilches: 0,
        rollCount: 0,
      };
    }

    case "nextTurn": {
      // Continue rolling (keep held dice, reroll rest)
      if (state.phase !== "rolled") return state;
      if (state.heldIndices.length === 0) return state;
      const heldVals = state.heldIndices.map((i) => state.currentRoll[i]).filter((v): v is DieFace => v !== undefined);
      const pts = scoreSelection(heldVals);
      if (pts === 0) return state;
      const newTurnScore = state.turnScore + pts;
      const newDiceLeft = state.diceLeft - state.heldIndices.length;
      const resetDice = newDiceLeft <= 0 ? 6 : newDiceLeft;
      return {
        ...state,
        turnScore: newTurnScore,
        diceLeft: resetDice,
        currentRoll: [],
        heldIndices: [],
        phase: "preRoll",
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: ZilchState): { score: number } | null {
  if (state.phase !== "won") return null;
  return { score: state.score };
}
