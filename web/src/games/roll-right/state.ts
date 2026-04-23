import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Roll Right — each player has 5 dice. Roll any dice, score each face value.
// Goal: be first to score 100. Single player vs bot.

export const GOAL = 100;
export const NUM_DICE = 5;

export interface RollRightSettings { dummy: boolean }

export interface RollRightState {
  settings: RollRightSettings;
  rngSeed: number;
  scores: readonly number[];   // [human, bot]
  dice: readonly number[];     // 1-6 face values, 5 dice
  kept: readonly boolean[];    // which dice are kept
  rollsThisTurn: number;       // 0 = not rolled yet
  phase: "select" | "scored";  // select = choose dice to keep; scored = after scoring
  currentPlayer: number;       // 0 = human, 1 = bot
  winner: number | null;
  turnScore: number;           // score earned this turn (for display)
}

export type RollRightAction =
  | { type: "roll" }
  | { type: "toggleKeep"; index: number }
  | { type: "score" }           // bank current dice values
  | { type: "confirm" };        // after bot turn

function rollDice(rng: () => number, count: number): number[] {
  return Array.from({ length: count }, () => Math.floor(rng() * 6) + 1);
}

export function initialState(seed: number, settings: RollRightSettings): RollRightState {
  return {
    settings,
    rngSeed: seed,
    scores: [0, 0],
    dice: [1, 1, 1, 1, 1],
    kept: [false, false, false, false, false],
    rollsThisTurn: 0,
    phase: "select",
    currentPlayer: 0,
    winner: null,
    turnScore: 0,
  };
}

function sumDice(dice: readonly number[], kept: readonly boolean[]): number {
  return dice.reduce((sum, v, i) => sum + (kept[i] ? v : 0), 0);
}

function botTurn(state: RollRightState): RollRightState {
  // Bot strategy: roll all 5, keep all with value >= 4, score and end turn
  const rng = mulberry32(state.rngSeed);
  const d1 = rollDice(rng, NUM_DICE);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  // Bot keeps all dice >= 4
  const kept = d1.map((v) => v >= 4);
  const anyKept = kept.some(Boolean);
  const finalKept = anyKept ? kept : kept.map(() => true); // keep all if nothing qualifies
  const earned = d1.reduce((s, v, i) => s + (finalKept[i] ? v : 0), 0);
  const newScores = [...state.scores];
  newScores[1] = newScores[1]! + earned;
  const winner = newScores[1]! >= GOAL ? 1 : null;
  return {
    ...state,
    rngSeed: nextSeed,
    scores: newScores,
    dice: d1,
    kept: finalKept,
    currentPlayer: winner !== null ? 1 : 0,
    phase: "scored",
    turnScore: earned,
    rollsThisTurn: 1,
    winner,
  };
}

export function reducer(state: RollRightState, action: RollRightAction): RollRightState {
  if (state.winner !== null) return state;

  if (action.type === "roll" && state.currentPlayer === 0) {
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const newDice = state.rollsThisTurn === 0
      ? rollDice(mulberry32(state.rngSeed), NUM_DICE)
      : state.dice.map((v, i) => state.kept[i] ? v : rollDice(mulberry32(state.rngSeed + i + 1), 1)[0]!);
    // Re-roll unkept dice properly
    const rng2 = mulberry32(state.rngSeed);
    const freshDice = Array.from({ length: NUM_DICE }, (_, i) =>
      (state.rollsThisTurn === 0 || !state.kept[i]) ? Math.floor(rng2() * 6) + 1 : state.dice[i]!
    );
    return {
      ...state,
      rngSeed: nextSeed,
      dice: freshDice,
      kept: state.rollsThisTurn === 0 ? [false, false, false, false, false] : state.kept,
      rollsThisTurn: state.rollsThisTurn + 1,
      phase: "select",
    };
  }

  if (action.type === "toggleKeep" && state.currentPlayer === 0 && state.rollsThisTurn > 0 && state.phase === "select") {
    const newKept = [...state.kept];
    newKept[action.index] = !newKept[action.index];
    return { ...state, kept: newKept };
  }

  if (action.type === "score" && state.currentPlayer === 0 && state.rollsThisTurn > 0) {
    // Score all kept dice (or all dice if none kept)
    const effectiveKept = state.kept.some(Boolean) ? state.kept : state.kept.map(() => true);
    const earned = sumDice(state.dice, effectiveKept);
    const newScores = [...state.scores];
    newScores[0] = newScores[0]! + earned;
    const winner = newScores[0]! >= GOAL ? 0 : null;
    return {
      ...state,
      scores: newScores,
      turnScore: earned,
      phase: "scored",
      currentPlayer: winner !== null ? 0 : 1,
      winner,
    };
  }

  if (action.type === "confirm" && state.phase === "scored" && state.currentPlayer === 1) {
    const afterBot = botTurn(state);
    // Reset for human next turn
    return {
      ...afterBot,
      currentPlayer: afterBot.winner !== null ? 1 : 0,
      phase: afterBot.winner !== null ? "scored" : "select",
      dice: [1, 1, 1, 1, 1],
      kept: [false, false, false, false, false],
      rollsThisTurn: 0,
    };
  }

  if (action.type === "confirm" && state.phase === "scored" && state.currentPlayer === 0) {
    return {
      ...state,
      phase: "select",
      dice: [1, 1, 1, 1, 1],
      kept: [false, false, false, false, false],
      rollsThisTurn: 0,
      turnScore: 0,
    };
  }

  return state;
}

export function isTerminal(state: RollRightState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? state.scores[0]! : 0 };
}
