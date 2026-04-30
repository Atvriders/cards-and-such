import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { scoreFarkleSelection, hasFarkleScoringOption } from "../../engines/dice/index.js";
import type { DieFace } from "../../engines/dice/index.js";

// Real Farkle Mini — full Farkle rules over 8 rounds.
// Per turn: roll 6 dice. Pick scoring dice to set aside (real combos:
// 1=100, 5=50, three-of-a-kind = N×100 with 1s = 1000, four-of-a-kind = ×2,
// five-of-a-kind = ×4, six-of-a-kind = ×8, straight 1-6 = 1500,
// three pairs = 1500, four-of-kind + pair = 1500). At least one die must
// score per roll. Bank or roll the leftover dice. "Hot dice": all 6 set
// aside? Get a fresh 6 dice and keep rolling. Roll with no scoring option
// = FARKLE: lose round bank, end the round.

export const TOTAL_ROUNDS = 8;
export const DICE_COUNT = 6;

export interface FarkleMiniSettings { dummy: boolean; }

export interface FarkleDie {
  value: DieFace;
  // "active" = currently in this roll, may be picked
  // "picked" = selected this roll for set-aside (not yet committed)
  // "kept"  = committed to this turn's tableau (cannot be unpicked)
  status: "active" | "picked" | "kept";
}

export interface FarkleMiniState {
  rngSeed: number;
  round: number;
  dice: FarkleDie[];          // up to 6
  roundBank: number;          // committed this round (from previous picks)
  pendingScore: number;       // value of currently-picked dice (preview)
  totalScore: number;
  phase: "rollReady" | "decide" | "scored" | "done";
  // Resulting feedback for "scored" phase:
  lastFarkle: boolean;
  lastBanked: number;
}

export type FarkleMiniAction =
  | { type: "roll" }
  | { type: "togglePick"; idx: number }
  | { type: "bank" }
  | { type: "next" };

function rollN(rng: () => number, n: number): DieFace[] {
  const out: DieFace[] = [];
  for (let i = 0; i < n; i++) out.push((1 + Math.floor(rng() * 6)) as DieFace);
  return out;
}

export function initialState(seed: number, _settings: FarkleMiniSettings): FarkleMiniState {
  return {
    rngSeed: seed,
    round: 1,
    dice: [],
    roundBank: 0,
    pendingScore: 0,
    totalScore: 0,
    phase: "rollReady",
    lastFarkle: false,
    lastBanked: 0,
  };
}

function activeDice(state: FarkleMiniState): FarkleDie[] {
  return state.dice.filter((d) => d.status === "active");
}

function pickedValues(state: FarkleMiniState): DieFace[] {
  return state.dice.filter((d) => d.status === "picked").map((d) => d.value);
}

function activeCount(state: FarkleMiniState): number {
  return state.dice.filter((d) => d.status !== "kept").length;
}

function pendingScoreOf(values: DieFace[]): number {
  if (values.length === 0) return 0;
  return scoreFarkleSelection(values);
}

export function reducer(state: FarkleMiniState, action: FarkleMiniAction): FarkleMiniState {
  if (state.phase === "done") return state;

  if (action.type === "roll") {
    if (state.phase === "rollReady") {
      // Fresh round roll: 6 dice
      const rng = mulberry32(state.rngSeed);
      const values = rollN(rng, DICE_COUNT);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const dice: FarkleDie[] = values.map((v) => ({ value: v, status: "active" }));
      const farkle = !hasFarkleScoringOption(dice.map((d) => ({ value: d.value, kept: false })));
      if (farkle) {
        const isLast = state.round >= TOTAL_ROUNDS;
        return {
          ...state,
          rngSeed: nextSeed,
          dice,
          roundBank: 0,
          pendingScore: 0,
          phase: isLast ? "done" : "scored",
          lastFarkle: true,
          lastBanked: 0,
        };
      }
      return {
        ...state,
        rngSeed: nextSeed,
        dice,
        roundBank: 0,
        pendingScore: 0,
        phase: "decide",
        lastFarkle: false,
      };
    }
    if (state.phase === "decide") {
      // Player must commit at least one scoring die before re-rolling.
      const picks = pickedValues(state);
      const pts = pendingScoreOf(picks);
      if (picks.length === 0 || pts === 0) return state;
      // Commit picks to "kept", remove kept-but-still-shown dice, then re-roll remaining.
      const newRoundBank = state.roundBank + pts;
      const remainingActive = state.dice.filter((d) => d.status === "active");
      // Hot dice: all six dice set aside this turn? give a fresh 6.
      const allSetAside =
        remainingActive.length === 0 &&
        state.dice.filter((d) => d.status === "picked").length + state.dice.filter((d) => d.status === "kept").length >= 0;
      const rng = mulberry32(state.rngSeed);
      let rollCount = remainingActive.length;
      // Hot dice if no remaining active dice AND we picked all of them
      const pickedNow = state.dice.filter((d) => d.status === "picked").length;
      const keptBefore = state.dice.filter((d) => d.status === "kept").length;
      const totalSetAside = pickedNow + keptBefore;
      if (rollCount === 0 && totalSetAside > 0 && totalSetAside % DICE_COUNT === 0) {
        // hot dice: fresh roll of 6
        rollCount = DICE_COUNT;
      }
      if (!allSetAside) {
        // normal path
      }
      if (rollCount === 0) {
        // Should not occur, but bank in that case
        const isLast = state.round >= TOTAL_ROUNDS;
        return {
          ...state,
          roundBank: newRoundBank,
          pendingScore: 0,
          totalScore: state.totalScore + newRoundBank,
          phase: isLast ? "done" : "scored",
          lastFarkle: false,
          lastBanked: newRoundBank,
        };
      }
      const values = rollN(rng, rollCount);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const newDice: FarkleDie[] = [];
      // Promote picked → kept (we drop them from view to keep board clean,
      // but display via roundBank). To keep dice array tidy, retain only the freshly-rolled set.
      for (const v of values) newDice.push({ value: v, status: "active" });
      const farkle = !hasFarkleScoringOption(newDice.map((d) => ({ value: d.value, kept: false })));
      if (farkle) {
        const isLast = state.round >= TOTAL_ROUNDS;
        return {
          ...state,
          rngSeed: nextSeed,
          dice: newDice,
          roundBank: 0,
          pendingScore: 0,
          phase: isLast ? "done" : "scored",
          lastFarkle: true,
          lastBanked: 0,
        };
      }
      return {
        ...state,
        rngSeed: nextSeed,
        dice: newDice,
        roundBank: newRoundBank,
        pendingScore: 0,
        phase: "decide",
        lastFarkle: false,
      };
    }
    return state;
  }

  if (action.type === "togglePick") {
    if (state.phase !== "decide") return state;
    const die = state.dice[action.idx];
    if (!die) return state;
    if (die.status === "kept") return state;
    const next = state.dice.map((d, i) =>
      i === action.idx
        ? { ...d, status: d.status === "active" ? "picked" as const : "active" as const }
        : d,
    );
    const picks = next.filter((d) => d.status === "picked").map((d) => d.value);
    const pendingScore = pendingScoreOf(picks);
    return { ...state, dice: next, pendingScore };
  }

  if (action.type === "bank") {
    if (state.phase !== "decide") return state;
    const picks = pickedValues(state);
    const pts = pendingScoreOf(picks);
    // Banking is allowed when picks score a valid combo (or zero picks but already non-zero bank from prior commits).
    // To bank you must have a positive total: roundBank + (valid pendingScore).
    if (picks.length > 0 && pts === 0) return state;
    const total = state.roundBank + pts;
    if (total === 0) return state;
    const isLast = state.round >= TOTAL_ROUNDS;
    return {
      ...state,
      totalScore: state.totalScore + total,
      roundBank: 0,
      pendingScore: 0,
      phase: isLast ? "done" : "scored",
      lastFarkle: false,
      lastBanked: total,
    };
  }

  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return {
      ...state,
      round: state.round + 1,
      dice: [],
      roundBank: 0,
      pendingScore: 0,
      phase: "rollReady",
      lastFarkle: false,
      lastBanked: 0,
    };
  }

  return state;
}

export function isTerminal(state: FarkleMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.totalScore } : null;
}

// Helpers exported for tests
export { activeDice, pickedValues, activeCount, pendingScoreOf };
