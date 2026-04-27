import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Relay: 4-stage relay per round. Stage targets: 3, 5, 7, 9 (sum of 2 dice).
// Roll 2 dice each stage. If sum >= target, advance; else round ends. +10 per cleared stage.
// 6 rounds.

export const TOTAL_ROUNDS = 6;
export const STAGE_TARGETS = [3, 5, 7, 9];

export interface DiceRelaySettings { dummy: boolean; }

export interface DiceRelayState {
  rngSeed: number;
  round: number;
  stage: number; // 0..3 within round
  lastRoll: [number, number] | null;
  score: number;
  phase: "rolling" | "result" | "done";
  lastCleared: boolean;
  roundEnded: boolean;
}

export type DiceRelayAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceRelaySettings): DiceRelayState {
  return { rngSeed: seed, round: 1, stage: 0, lastRoll: null, score: 0, phase: "rolling", lastCleared: false, roundEnded: false };
}

export function reducer(state: DiceRelayState, action: DiceRelayAction): DiceRelayState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6);
    const b = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const sum = a + b;
    const target = STAGE_TARGETS[state.stage]!;
    const cleared = sum >= target;
    const pts = cleared ? 10 : 0;
    return { ...state, rngSeed: nextSeed, lastRoll: [a, b], score: state.score + pts, phase: "result", lastCleared: cleared, roundEnded: !cleared };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    const advancedStage = state.lastCleared && state.stage < STAGE_TARGETS.length - 1 ? state.stage + 1 : null;
    const isLastRound = state.round >= TOTAL_ROUNDS;
    if (advancedStage !== null) {
      return { ...state, stage: advancedStage, lastRoll: null, phase: "rolling", lastCleared: false, roundEnded: false };
    }
    // round done -> next round or end
    if (isLastRound) return { ...state, phase: "done", lastRoll: null };
    return { ...state, round: state.round + 1, stage: 0, lastRoll: null, phase: "rolling", lastCleared: false, roundEnded: false };
  }
  return state;
}

export function isTerminal(state: DiceRelayState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
