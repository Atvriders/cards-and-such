import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Shipping: 6 rounds. Each round: roll 9 dice; choose to keep one of three pre-assigned
// "ships" (slots of 3 dice each). The chosen ship's sum becomes your round score.

export const TOTAL_ROUNDS = 6;

export interface DiceShippingSettings { dummy: boolean; }

export interface DiceShippingState {
  rngSeed: number;
  round: number;
  ships: number[][]; // 3 ships of 3 dice
  chosen: number | null;
  pts: number;
  score: number;
  phase: "choosing" | "scored" | "done";
}

export type DiceShippingAction = { type: "roll" } | { type: "pick"; ship: number } | { type: "next" };

function rollDice(rng: () => number, n: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(1 + Math.floor(rng() * 6));
  return out;
}

function rollShips(rng: () => number): number[][] {
  return [rollDice(rng, 3), rollDice(rng, 3), rollDice(rng, 3)];
}

export function initialState(seed: number, _settings: DiceShippingSettings): DiceShippingState {
  const rng = mulberry32(seed);
  const ships = rollShips(rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rngSeed: nextSeed, round: 1, ships, chosen: null, pts: 0, score: 0, phase: "choosing" };
}

export function reducer(state: DiceShippingState, action: DiceShippingAction): DiceShippingState {
  if (state.phase === "done") return state;
  if (action.type === "pick") {
    if (state.phase !== "choosing") return state;
    const idx = action.ship;
    if (idx < 0 || idx >= state.ships.length) return state;
    const sum = state.ships[idx]!.reduce((a, b) => a + b, 0);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, chosen: idx, pts: sum, score: state.score + sum, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    const rng = mulberry32(state.rngSeed);
    const ships = rollShips(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: nextSeed, round: state.round + 1, ships, chosen: null, pts: 0, phase: "choosing" };
  }
  return state;
}

export function isTerminal(state: DiceShippingState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
