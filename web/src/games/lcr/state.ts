import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Left Center Right (LCR) dice game
// 3 players, 3 chips each. Roll 3 dice per turn.
// L = pass chip left, R = pass chip right, C = put chip in center pot, * = keep chip
// Last player with chips wins the pot.

export interface LCRSettings { dummy: boolean }

export type LCRFace = "L" | "C" | "R" | "*";

export interface LCRState {
  settings: LCRSettings;
  rngSeed: number;
  chips: readonly number[];   // chips[player], 3 players
  pot: number;                // chips in center pot
  currentPlayer: number;
  dice: readonly LCRFace[];   // last roll results
  phase: "rolling" | "result";
  winner: number | null;
}

export type LCRAction =
  | { type: "roll" }
  | { type: "confirm" };

const FACES: LCRFace[] = ["L", "C", "R", "*", "*", "*"];

function rollLCR(rng: () => number, count: number): LCRFace[] {
  return Array.from({ length: count }, () => FACES[Math.floor(rng() * 6)]!);
}

export function initialState(seed: number, settings: LCRSettings): LCRState {
  return {
    settings,
    rngSeed: seed,
    chips: [3, 3, 3],
    pot: 0,
    currentPlayer: 0,
    dice: [],
    phase: "rolling",
    winner: null,
  };
}

function nextPlayer(current: number, chips: readonly number[]): number {
  for (let i = 1; i <= 3; i++) {
    const p = (current + i) % 3;
    if (chips[p]! > 0) return p;
  }
  return current;
}

function playersWithChips(chips: readonly number[]): number {
  return chips.filter((c) => c > 0).length;
}

export function reducer(state: LCRState, action: LCRAction): LCRState {
  if (state.winner !== null) return state;

  if (action.type === "roll" && state.phase === "rolling") {
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const playerChips = state.chips[state.currentPlayer]!;
    const rollCount = Math.min(playerChips, 3);
    const dice = rollLCR(mulberry32(state.rngSeed), rollCount);

    // Apply dice results
    const chips = [...state.chips];
    let pot = state.pot;
    const p = state.currentPlayer;
    const left = (p + 2) % 3;
    const right = (p + 1) % 3;

    for (const face of dice) {
      if (chips[p]! === 0) break;
      if (face === "L") { chips[p]!--; chips[left]!++; }
      else if (face === "R") { chips[p]!--; chips[right]!++; }
      else if (face === "C") { chips[p]!--; pot++; }
      // "*" = keep, do nothing
    }

    const alive = playersWithChips(chips);
    let winner: number | null = null;
    if (alive === 1) {
      winner = chips.findIndex((c) => c > 0);
    }

    return {
      ...state,
      rngSeed: nextSeed,
      chips,
      pot,
      dice,
      phase: "result",
      winner,
    };
  }

  if (action.type === "confirm" && state.phase === "result") {
    if (state.winner !== null) return state;
    const next = nextPlayer(state.currentPlayer, state.chips);
    return { ...state, phase: "rolling", currentPlayer: next, dice: [] };
  }

  return state;
}

export function isTerminal(state: LCRState): { score: number } | null {
  if (state.winner === null) return null;
  // Score: 100 if human (player 0) wins, else 0
  return { score: state.winner === 0 ? 100 + state.pot * 10 : 0 };
}
