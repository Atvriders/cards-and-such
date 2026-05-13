import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type DieFace = 1 | 2 | 3 | 4 | 5 | 6;

export interface FarkleFullSettings {
  target: "5000" | "10000";
  cpuRisk: "cautious" | "balanced" | "aggressive";
}

export type Player = 0 | 1; // 0 = human, 1 = CPU

export type Phase =
  | "preRoll"     // current player can press Roll
  | "rolled"      // dice on table; current player must pick
  | "farkled"     // current player farkled; click to continue
  | "cpuThinking" // CPU is mid-decision (after a roll, before pick)
  | "gameOver";

export interface FarkleFullState {
  settings: FarkleFullSettings;
  rngSeed: number;
  scores: [number, number];
  current: Player;
  diceRemaining: number;
  /** Dice currently on the table (length = diceRemaining when rolled, [] otherwise). */
  roll: DieFace[];
  /** Dice already locked in this turn. Display-only. */
  setAside: DieFace[];
  turnScore: number;
  phase: Phase;
  /** Set of indices currently selected in the roll (by the human). */
  selected: number[];
  /** Most recent message — surfaced in the UI. */
  message: string;
  /** Winner once gameOver. */
  winner: Player | null;
}

export type FarkleFullAction =
  | { type: "roll" }
  | { type: "toggleSelect"; index: number }
  | { type: "setAside" }
  | { type: "bank" }
  | { type: "nextTurn" }
  | { type: "cpuStep" };

/* ============================================================ */
/* Scoring                                                      */
/* ============================================================ */

function countsOf(values: readonly DieFace[]): Record<DieFace, number> {
  const c = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 } as Record<DieFace, number>;
  for (const v of values) c[v]++;
  return c;
}

/**
 * Score a selection of dice values under full Farkle rules.
 * Returns 0 if the selection includes any dice that don't contribute.
 *
 * Scoring:
 *   straight 1-6 (exactly 6 dice, one of each) → 1500
 *   three pairs (exactly 6 dice, three pairs)  → 1500
 *   two triplets (exactly 6 dice, two triples) → 2500
 *   three 1s  → 1000      four 1s → 2000   five 1s → 4000   six 1s → 8000
 *   three Ns  → 100·N     four Ns → 200·N  five Ns → 400·N  six Ns → 800·N  (for N=2..6)
 *   single 1 → 100        single 5 → 50
 */
export function scoreSelection(values: readonly DieFace[]): number {
  if (values.length === 0) return 0;
  const counts = countsOf(values);
  const n = values.length;

  // 6-die specials
  if (n === 6) {
    // Straight 1-6
    if ([1, 2, 3, 4, 5, 6].every((f) => counts[f as DieFace] === 1)) return 1500;
    // Three pairs (no triplets, three pairs)
    const distinct = Object.values(counts).filter((c) => c > 0).length;
    const pairs = Object.values(counts).filter((c) => c === 2).length;
    if (pairs === 3 && distinct === 3) return 1500;
    // Two triplets
    const triples = Object.values(counts).filter((c) => c === 3).length;
    if (triples === 2) return 2500;
  }

  let total = 0;
  let used = 0;
  for (const face of [1, 2, 3, 4, 5, 6] as DieFace[]) {
    const k = counts[face];
    if (k >= 3) {
      const base = face === 1 ? 1000 : face * 100;
      // four = 2x, five = 4x, six = 8x  (double for each extra die)
      const mult = Math.pow(2, k - 3);
      total += base * mult;
      used += k;
    } else if (face === 1) {
      total += k * 100;
      used += k;
    } else if (face === 5) {
      total += k * 50;
      used += k;
    }
  }
  // If any dice were not scored (e.g. a lone 2), the selection is invalid.
  if (used < values.length) return 0;
  return total;
}

/** True if the given roll has at least one scoring set-aside option. */
export function hasScoringOption(values: readonly DieFace[]): boolean {
  if (scoreSelection(values) > 0) return true;
  for (const v of values) if (scoreSelection([v]) > 0) return true;
  // Also: triple of any non-1/5 face (e.g. three 4s) is checked through scoreSelection
  // on the full set when no 1s/5s are present. The full-array check covers any triple.
  // But sub-selections like {3,3,3,2,4,6} need a triple check too:
  const c = countsOf(values);
  for (const face of [1, 2, 3, 4, 5, 6] as DieFace[]) {
    if (c[face] >= 3) return true;
  }
  return false;
}

/* ============================================================ */
/* RNG                                                          */
/* ============================================================ */

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  // Use a separate draw for the nextSeed to keep determinism stable.
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed ^ 0x9E3779B1), nextSeed };
}

function rollN(n: number, rng: () => number): DieFace[] {
  const out: DieFace[] = [];
  for (let i = 0; i < n; i++) {
    out.push(((Math.floor(rng() * 6) + 1) as DieFace));
  }
  return out;
}

/* ============================================================ */
/* Initial state                                                */
/* ============================================================ */

export function initialState(seed: number, settings: FarkleFullSettings): FarkleFullState {
  return {
    settings,
    rngSeed: seed >>> 0,
    scores: [0, 0],
    current: 0,
    diceRemaining: 6,
    roll: [],
    setAside: [],
    turnScore: 0,
    phase: "preRoll",
    selected: [],
    message: "Your turn — roll 6 dice.",
    winner: null,
  };
}

/* ============================================================ */
/* Helpers                                                      */
/* ============================================================ */

function nextPlayer(p: Player): Player {
  return p === 0 ? 1 : 0;
}

function endTurn(state: FarkleFullState, bank: boolean): FarkleFullState {
  const target = parseInt(state.settings.target, 10);
  const newScores: [number, number] = [state.scores[0], state.scores[1]];
  if (bank) newScores[state.current] += state.turnScore;

  if (bank && newScores[state.current] >= target) {
    return {
      ...state,
      scores: newScores,
      phase: "gameOver",
      winner: state.current,
      turnScore: 0,
      roll: [],
      setAside: [],
      selected: [],
      diceRemaining: 6,
      message: state.current === 0 ? "You win!" : "CPU wins!",
    };
  }

  const next = nextPlayer(state.current);
  return {
    ...state,
    scores: newScores,
    current: next,
    diceRemaining: 6,
    roll: [],
    setAside: [],
    turnScore: 0,
    selected: [],
    phase: next === 1 ? "cpuThinking" : "preRoll",
    message:
      next === 0
        ? "Your turn — roll 6 dice."
        : "CPU is taking its turn...",
  };
}

/* ============================================================ */
/* CPU strategy                                                 */
/* ============================================================ */

/**
 * Greedy "best scoring subset" pick from a roll.
 * Returns the indices to set aside and the total score.
 * Strategy: prefer the maximum-score scoring subset. To keep it simple yet
 * playable, we enumerate canonical scoring groups (special 6-die patterns,
 * triplets/quads/etc, then leftover 1s and 5s) and take everything that
 * scores — this maximises score for that roll and keeps hot-dice live.
 */
export function bestPick(roll: readonly DieFace[]): { indices: number[]; score: number } {
  // First check 6-die specials when applicable
  if (roll.length === 6) {
    const fullScore = scoreSelection(roll);
    if (fullScore > 0) {
      return { indices: roll.map((_, i) => i), score: fullScore };
    }
  }

  // Greedy: pick all triples/quads/etc, plus all 1s and 5s.
  const counts = countsOf(roll);
  const include: Record<DieFace, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  for (const face of [1, 2, 3, 4, 5, 6] as DieFace[]) {
    const k = counts[face];
    if (k >= 3) {
      include[face] = k;
    } else if (face === 1 || face === 5) {
      include[face] = k;
    }
  }

  const indices: number[] = [];
  const used: Record<DieFace, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  for (let i = 0; i < roll.length; i++) {
    const v = roll[i]!;
    if (used[v] < include[v]) {
      indices.push(i);
      used[v]++;
    }
  }
  const selected = indices.map((i) => roll[i]!);
  const score = scoreSelection(selected);
  return { indices, score };
}

/** Pick the smallest valid scoring subset (single 1 or single 5 preferred). */
export function minimalPick(roll: readonly DieFace[]): { indices: number[]; score: number } | null {
  // Look for a single 1 first
  for (let i = 0; i < roll.length; i++) {
    if (roll[i] === 1) return { indices: [i], score: 100 };
  }
  for (let i = 0; i < roll.length; i++) {
    if (roll[i] === 5) return { indices: [i], score: 50 };
  }
  // Else try a triple
  const c = countsOf(roll);
  for (const face of [2, 3, 4, 6] as DieFace[]) {
    if (c[face] >= 3) {
      const idx: number[] = [];
      for (let i = 0; i < roll.length; i++) {
        if (roll[i] === face && idx.length < 3) idx.push(i);
      }
      return { indices: idx, score: face * 100 };
    }
  }
  // Fall back to bestPick (covers special 6-die patterns when no 1s/5s/triples)
  const best = bestPick(roll);
  return best.score > 0 ? best : null;
}

/**
 * Decide whether the CPU should bank or push given current state.
 * Used after a successful set-aside (preRoll phase with diceRemaining/turnScore).
 */
export function cpuShouldBank(
  turnScore: number,
  diceRemaining: number,
  cpuTotal: number,
  humanTotal: number,
  target: number,
  risk: FarkleFullSettings["cpuRisk"],
): boolean {
  // If banking wins the game, bank.
  if (cpuTotal + turnScore >= target) return true;

  // If the human is one bank away and we trail, push more aggressively.
  const humanClose = humanTotal >= target - 500;

  // Risk thresholds: bank when turnScore reaches X, weighted by remaining dice.
  const baseThreshold =
    risk === "cautious" ? 300 : risk === "balanced" ? 500 : 750;
  // More dice in hand = more options; allow higher push.
  const diceFactor =
    diceRemaining >= 4 ? 1.4 : diceRemaining === 3 ? 1.0 : diceRemaining === 2 ? 0.6 : 0.35;
  const threshold = Math.round(baseThreshold * diceFactor);

  if (humanClose) {
    // Trailing chase: push harder
    return turnScore >= threshold * 1.8;
  }
  // Always cash out tiny single-die pushes after first roll.
  if (diceRemaining === 1 && turnScore < 1000) return turnScore >= 250;
  return turnScore >= threshold;
}

/* ============================================================ */
/* Reducer                                                      */
/* ============================================================ */

export function reducer(state: FarkleFullState, action: FarkleFullAction): FarkleFullState {
  if (state.phase === "gameOver") return state;

  switch (action.type) {
    case "roll": {
      if (state.phase !== "preRoll" && state.phase !== "cpuThinking") return state;
      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const newRoll = rollN(state.diceRemaining, rng);
      if (!hasScoringOption(newRoll)) {
        // Farkle.
        if (state.current === 0) {
          return {
            ...state,
            rngSeed: nextSeed,
            roll: newRoll,
            selected: [],
            phase: "farkled",
            message: "FARKLE! No scoring dice — turn lost. Click Next Turn.",
          };
        }
        // CPU farkles — auto-progress on next cpuStep.
        return {
          ...state,
          rngSeed: nextSeed,
          roll: newRoll,
          selected: [],
          phase: "farkled",
          message: "CPU farkled! No scoring dice — CPU loses its turn.",
        };
      }
      return {
        ...state,
        rngSeed: nextSeed,
        roll: newRoll,
        selected: [],
        phase: state.current === 0 ? "rolled" : "cpuThinking",
        message:
          state.current === 0
            ? "Pick at least one scoring die, then set aside."
            : "CPU is thinking...",
      };
    }

    case "toggleSelect": {
      if (state.phase !== "rolled") return state;
      if (state.current !== 0) return state;
      const idx = action.index;
      if (idx < 0 || idx >= state.roll.length) return state;
      const sel = state.selected.includes(idx)
        ? state.selected.filter((i) => i !== idx)
        : [...state.selected, idx];
      return { ...state, selected: sel };
    }

    case "setAside": {
      if (state.phase !== "rolled") return state;
      if (state.current !== 0) return state;
      if (state.selected.length === 0) return state;
      const values = state.selected.map((i) => state.roll[i]!).filter((v) => v !== undefined) as DieFace[];
      const pts = scoreSelection(values);
      if (pts === 0) return state;

      const remaining = state.diceRemaining - state.selected.length;
      const newDiceRemaining = remaining === 0 ? 6 : remaining;
      return {
        ...state,
        diceRemaining: newDiceRemaining,
        roll: [],
        setAside: [...state.setAside, ...values],
        turnScore: state.turnScore + pts,
        selected: [],
        phase: "preRoll",
        message:
          remaining === 0
            ? "HOT DICE! Roll all 6 again, or bank."
            : `Set aside +${pts}. Roll again or bank.`,
      };
    }

    case "bank": {
      if (state.phase !== "preRoll") return state;
      if (state.current !== 0) return state;
      if (state.turnScore === 0) return state;
      return endTurn(state, true);
    }

    case "nextTurn": {
      if (state.phase !== "farkled") return state;
      // Farkle loses the turn — no bank.
      return endTurn(state, false);
    }

    case "cpuStep": {
      if (state.current !== 1) return state;
      const target = parseInt(state.settings.target, 10);

      if (state.phase === "farkled") {
        return endTurn(state, false);
      }
      if (state.phase === "cpuThinking") {
        // If we don't have a roll on the table, roll. Otherwise pick & decide.
        if (state.roll.length === 0) {
          // Equivalent of pressing Roll for CPU
          const { rng, nextSeed } = advanceSeed(state.rngSeed);
          const newRoll = rollN(state.diceRemaining, rng);
          if (!hasScoringOption(newRoll)) {
            return {
              ...state,
              rngSeed: nextSeed,
              roll: newRoll,
              selected: [],
              phase: "farkled",
              message: "CPU farkled!",
            };
          }
          return {
            ...state,
            rngSeed: nextSeed,
            roll: newRoll,
            phase: "cpuThinking",
            message: "CPU is thinking...",
          };
        }

        // Decide pick from current roll.
        // If banking now would win, take a minimal pick to push over the line if possible,
        // else take the best pick and bank.
        const projectedIfBestNow = (() => {
          const b = bestPick(state.roll);
          return state.scores[1] + state.turnScore + b.score;
        })();
        const pick =
          projectedIfBestNow >= target
            ? bestPick(state.roll)
            : bestPick(state.roll); // default: greedy
        if (pick.score === 0) {
          // Shouldn't happen since hasScoringOption was true, but guard.
          return endTurn(state, false);
        }

        // Apply the pick
        const remaining = state.diceRemaining - pick.indices.length;
        const newDiceRemaining = remaining === 0 ? 6 : remaining;
        const afterPick: FarkleFullState = {
          ...state,
          diceRemaining: newDiceRemaining,
          roll: [],
          setAside: [...state.setAside, ...pick.indices.map((i) => state.roll[i]!)],
          turnScore: state.turnScore + pick.score,
          phase: "cpuThinking",
          message: `CPU set aside +${pick.score}.`,
        };

        // Decide bank vs push using CPU strategy
        const bank = cpuShouldBank(
          afterPick.turnScore,
          afterPick.diceRemaining,
          afterPick.scores[1],
          afterPick.scores[0],
          target,
          afterPick.settings.cpuRisk,
        );

        if (bank) {
          return endTurn(afterPick, true);
        }
        // Otherwise, the CPU will roll again on the next cpuStep tick.
        return afterPick;
      }
      // CPU not in an actionable phase — ignore.
      return state;
    }

    default:
      return state;
  }
}

/* ============================================================ */
/* Terminal                                                     */
/* ============================================================ */

export function isTerminal(state: FarkleFullState): { score: number } | null {
  if (state.phase !== "gameOver") return null;
  if (state.winner === 0) {
    // Human wins. Score = points banked over CPU, clamped >= 1.
    const margin = state.scores[0] - state.scores[1];
    return { score: Math.max(1, margin) };
  }
  // CPU won — no leaderboard credit
  return { score: 0 };
}
