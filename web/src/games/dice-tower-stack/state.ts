import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Tower Stack: 10 rounds. Each round, roll 5 dice. Then "stack" them in
// ascending order (any subset of dice with strictly ascending values, in roll
// order). Score = sum of stacked dice. Bonus +20 per round if all 5 form a
// strictly ascending sequence ("perfect ascending").

export const ROUNDS = 10;
export const DICE_COUNT = 5;
export const PERFECT_BONUS = 20;

export interface DiceTowerStackSettings {
  diceSides: 6 | 8 | 10;
}

export type Phase = "rolling" | "stacking" | "done";

export interface DiceTowerStackState {
  rngSeed: number;
  rngCounter: number;
  settings: DiceTowerStackSettings;
  round: number; // 1..ROUNDS
  dice: number[]; // current 5 dice values
  selected: number[]; // indices into dice (chosen ascending stack)
  committed: boolean; // round committed
  totalScore: number;
  perfectCount: number;
  phase: Phase;
}

export type DiceTowerStackAction =
  | { type: "roll" }
  | { type: "select"; idx: number }
  | { type: "clear" }
  | { type: "commit" }
  | { type: "next" };

function rollDice(seed: number, counter: number, sides: number, count: number): number[] {
  const rng = mulberry32(seed + counter * 7919);
  const out: number[] = [];
  for (let i = 0; i < count; i++) out.push(1 + Math.floor(rng() * sides));
  return out;
}

export function initialState(seed: number, settings: DiceTowerStackSettings): DiceTowerStackState {
  return {
    rngSeed: (seed >>> 0) || 1,
    rngCounter: 0,
    settings,
    round: 1,
    dice: rollDice((seed >>> 0) || 1, 0, settings.diceSides, DICE_COUNT),
    selected: [],
    committed: false,
    totalScore: 0,
    perfectCount: 0,
    phase: "stacking",
  };
}

/** Validate and normalize a selection of dice indices. The selection must be
 *  in roll order (indices strictly increasing) AND values strictly ascending.
 *  Returns the selection unchanged if valid; otherwise returns null. */
export function isValidStack(dice: number[], selected: number[]): boolean {
  for (let i = 1; i < selected.length; i++) {
    if (selected[i]! <= selected[i - 1]!) return false;
    if (dice[selected[i]!] <= dice[selected[i - 1]!]) return false;
  }
  return true;
}

export function stackScore(dice: number[], selected: number[]): number {
  let s = 0;
  for (const i of selected) s += dice[i] ?? 0;
  return s;
}

export function isPerfect(dice: number[], selected: number[]): boolean {
  if (selected.length !== dice.length) return false;
  return isValidStack(dice, selected);
}

export function reducer(
  state: DiceTowerStackState,
  action: DiceTowerStackAction,
): DiceTowerStackState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "roll": {
      // Re-roll within stacking phase is not allowed; included for resilience.
      if (state.committed) return state;
      const counter = state.rngCounter + 1;
      const dice = rollDice(state.rngSeed, counter, state.settings.diceSides, DICE_COUNT);
      return { ...state, dice, selected: [], rngCounter: counter };
    }
    case "select": {
      if (state.committed) return state;
      if (action.idx < 0 || action.idx >= state.dice.length) return state;
      // Toggle: if already in selection, remove it (and everything after it).
      const idxPos = state.selected.indexOf(action.idx);
      if (idxPos >= 0) {
        return { ...state, selected: state.selected.slice(0, idxPos) };
      }
      // Append; must keep selection valid (roll order + ascending values).
      const next = [...state.selected, action.idx];
      if (!isValidStack(state.dice, next)) return state;
      return { ...state, selected: next };
    }
    case "clear": {
      if (state.committed) return state;
      return { ...state, selected: [] };
    }
    case "commit": {
      if (state.committed) return state;
      const score = stackScore(state.dice, state.selected);
      const perfect = isPerfect(state.dice, state.selected);
      const bonus = perfect ? PERFECT_BONUS : 0;
      return {
        ...state,
        committed: true,
        totalScore: state.totalScore + score + bonus,
        perfectCount: state.perfectCount + (perfect ? 1 : 0),
      };
    }
    case "next": {
      if (!state.committed) return state;
      if (state.round >= ROUNDS) {
        return { ...state, phase: "done" };
      }
      const counter = state.rngCounter + 1;
      const dice = rollDice(state.rngSeed, counter, state.settings.diceSides, DICE_COUNT);
      return {
        ...state,
        round: state.round + 1,
        dice,
        selected: [],
        committed: false,
        rngCounter: counter,
      };
    }
    default:
      return state;
  }
}

export function isTerminal(state: DiceTowerStackState): { score: number } | null {
  return state.phase === "done" ? { score: state.totalScore } : null;
}
