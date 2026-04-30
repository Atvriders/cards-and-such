import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const START_STICKS = 21;

export interface NimGameSettings { dummy: boolean; }

export interface NimGameState {
  rngSeed: number;
  sticks: number;
  turn: "P" | "C";
  result: "P" | "C" | null;
  score: number;
  phase: "playing" | "done";
  lastTake: { who: "P" | "C"; n: number } | null;
}

export type NimGameAction = { type: "take"; n: number } | { type: "reset" };

export function initialState(seed: number, _settings: NimGameSettings): NimGameState {
  return {
    rngSeed: seed,
    sticks: START_STICKS,
    turn: "P",
    result: null,
    score: 0,
    phase: "playing",
    lastTake: null,
  };
}

// Misère Nim subtraction-game strategy: leave (4k + 1) for opponent so the
// last stick is theirs. With 1..3 takes and last-take-loses, the optimal
// number to leave for the opponent is 1 (mod 4). We model a "smart" CPU
// that plays optimally when it can, else random.
function cpuMove(after: number, rng: () => number): number {
  // After your turn, `after` sticks remain. CPU wants to take 1..3 such
  // that remaining ≡ 1 (mod 4). If `after === 1`, CPU is stuck and must take 1.
  if (after <= 1) return 1;
  for (let take = 1; take <= 3 && take < after; take++) {
    if ((after - take - 1) % 4 === 0) return take;
  }
  // No winning move — play randomly.
  return 1 + Math.floor(rng() * Math.min(3, after - 1));
}

export function reducer(state: NimGameState, action: NimGameAction): NimGameState {
  if (action.type === "reset") return initialState(state.rngSeed + 1, { dummy: false });
  if (state.phase === "done") return state;
  if (action.type !== "take") return state;
  if (state.turn !== "P") return state;
  const n = Math.max(1, Math.min(3, action.n));
  if (n > state.sticks) return state;
  const after = state.sticks - n;
  if (after === 0) {
    // Player took the last stick -> player loses (misère).
    return {
      ...state,
      sticks: 0,
      result: "C",
      phase: "done",
      score: 0,
      lastTake: { who: "P", n },
    };
  }
  // CPU's move
  const rng = mulberry32(state.rngSeed);
  const cpuTake = cpuMove(after, rng);
  const seed2 = Math.floor(rng() * 2 ** 31);
  const after2 = after - cpuTake;
  if (after2 === 0) {
    // CPU took the last -> player wins.
    return {
      ...state,
      rngSeed: seed2,
      sticks: 0,
      result: "P",
      phase: "done",
      score: 100,
      lastTake: { who: "C", n: cpuTake },
    };
  }
  return {
    ...state,
    rngSeed: seed2,
    sticks: after2,
    turn: "P",
    lastTake: { who: "C", n: cpuTake },
  };
}

export function isTerminal(state: NimGameState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
