import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Double Trouble: Roll 2 dice. Doubles = roll again and add (chain doubles for bonus).
// Regular roll: score = sum. Double: score = sum + reroll sum. Double on reroll = +50 bonus.
// 8 rounds.

export interface DiceDoubleTroubleSettings { rounds: "6" | "8" | "10"; }

export interface DiceDoubleTroubleState {
  round: number;
  maxRounds: number;
  dice: [number, number];
  rerollDice: [number, number] | null;
  roundScore: number;
  totalScore: number;
  isDouble: boolean;
  isDoubleDouble: boolean;
  phase: "rolling" | "result" | "gameover";
  rngSeed: number;
}

export type DiceDoubleTroubleAction = { type: "roll" } | { type: "next" };

function roll2(rng: () => number): [number, number] {
  return [Math.floor(rng() * 6) + 1, Math.floor(rng() * 6) + 1];
}

export function initialState(seed: number, settings: DiceDoubleTroubleSettings): DiceDoubleTroubleState {
  return { round: 1, maxRounds: parseInt(settings.rounds, 10), dice: [1, 1], rerollDice: null, roundScore: 0, totalScore: 0, isDouble: false, isDoubleDouble: false, phase: "rolling", rngSeed: seed };
}

export function reducer(state: DiceDoubleTroubleState, action: DiceDoubleTroubleAction): DiceDoubleTroubleState {
  if (state.phase === "gameover") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice = roll2(rng);
    const isDouble = dice[0] === dice[1];
    let rerollDice: [number, number] | null = null;
    let isDoubleDouble = false;
    let roundScore = dice[0] + dice[1];
    if (isDouble) {
      rerollDice = roll2(rng);
      roundScore += rerollDice[0] + rerollDice[1];
      isDoubleDouble = rerollDice[0] === rerollDice[1];
      if (isDoubleDouble) roundScore += 50;
    }
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const phase = state.round >= state.maxRounds ? "gameover" : "result";
    return { ...state, dice, rerollDice, isDouble, isDoubleDouble, roundScore, totalScore: state.totalScore + roundScore, phase, rngSeed: nextSeed };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, dice: [1, 1], rerollDice: null, roundScore: 0, isDouble: false, isDoubleDouble: false, phase: "rolling" };
  }
  return state;
}

export function isTerminal(state: DiceDoubleTroubleState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.totalScore } : null;
}
