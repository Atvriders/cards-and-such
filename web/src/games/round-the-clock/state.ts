import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Round the Clock: hit 1, 2, 3, ..., 20, then Bullseye in order
// Each turn: throw 3 darts at the current target
// Hit probability based on skill

export const SEQUENCE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25] as const;
export const DARTS_PER_TURN = 3;

export type SkillLevel = "beginner" | "amateur" | "pro";

export interface RoundTheClockSettings {
  skill: SkillLevel;
}

export interface DartThrow {
  aimed: number;
  hit: number | null; // null = miss
}

export interface TurnRecord {
  target: number;
  throws: DartThrow[];
  advanced: boolean; // did this turn advance the target?
}

export interface RoundTheClockState {
  currentTargetIdx: number; // index into SEQUENCE
  turns: TurnRecord[];
  pendingThrows: DartThrow[]; // throws in current turn not yet committed
  won: boolean;
  totalThrows: number;
  rngSeed: number;
  settings: RoundTheClockSettings;
  rngState: number; // mutable rng state stored for subsequent throws
}

export type RoundTheClockAction =
  | { type: "throwDarts" } // throw all 3 darts at current target
  | { type: "nextTurn" }; // commit pending throws, advance if target hit

// Neighbor map for partial hits (realistic dartboard adjacency)
const NEIGHBORS: Record<number, number[]> = {
  1: [18, 4, 20],
  2: [15, 17, 3],
  3: [19, 2, 17],
  4: [18, 13, 1],
  5: [20, 12, 1], // approx
  6: [13, 10, 15],
  7: [19, 16, 8],
  8: [11, 16, 7],
  9: [12, 14, 11],
  10: [15, 6, 6],
  11: [8, 14, 9],
  12: [9, 5, 5],
  13: [6, 4, 6],
  14: [11, 9, 14],
  15: [2, 10, 6],
  16: [8, 7, 7],
  17: [3, 2, 3],
  18: [4, 1, 4],
  19: [3, 7, 3],
  20: [1, 5, 1],
  25: [20, 3, 5],
};

function getNeighbors(n: number): number[] {
  return NEIGHBORS[n] ?? [n];
}

function hitChance(skill: SkillLevel): number {
  if (skill === "pro") return 0.80;
  if (skill === "amateur") return 0.65;
  return 0.50;
}

function simulateThrow(aimed: number, skill: SkillLevel, rng: () => number): DartThrow {
  const r = rng();
  const pHit = hitChance(skill);
  const pNeighbor = 0.10;
  if (r < pHit) {
    return { aimed, hit: aimed };
  } else if (r < pHit + pNeighbor) {
    const nb = getNeighbors(aimed);
    const picked = nb[Math.floor(rng() * nb.length)]!;
    return { aimed, hit: picked };
  } else {
    return { aimed, hit: null }; // complete miss
  }
}

// Encode rng seed + call count into a single state number (simple approach)
export function initialState(seed: number, settings: RoundTheClockSettings): RoundTheClockState {
  return {
    currentTargetIdx: 0,
    turns: [],
    pendingThrows: [],
    won: false,
    totalThrows: 0,
    rngSeed: seed,
    settings,
    rngState: seed,
  };
}

export function reducer(state: RoundTheClockState, action: RoundTheClockAction): RoundTheClockState {
  if (state.won) return state;

  if (action.type === "throwDarts") {
    if (state.pendingThrows.length > 0) return state; // already threw this turn
    const rng = mulberry32(state.rngState);
    // Advance rng state: consume some calls to create new state
    // We'll track rngState as the seed for next batch
    const target = SEQUENCE[state.currentTargetIdx]!;
    const throws: DartThrow[] = [];
    let targetIdx = state.currentTargetIdx;
    for (let i = 0; i < DARTS_PER_TURN; i++) {
      const t = simulateThrow(target, state.settings.skill, rng);
      throws.push(t);
      if (t.hit === target && targetIdx === state.currentTargetIdx) {
        // Don't auto-advance here — just record
      }
    }
    // New rng state: call rng a few more times to advance
    const newRngState = Math.floor(rng() * 0xffffffff);
    return {
      ...state,
      pendingThrows: throws,
      rngState: newRngState,
      totalThrows: state.totalThrows + DARTS_PER_TURN,
    };
  }

  if (action.type === "nextTurn") {
    if (state.pendingThrows.length === 0) return state;
    const target = SEQUENCE[state.currentTargetIdx]!;
    const hitTarget = state.pendingThrows.some((t) => t.hit === target);
    const newTargetIdx = hitTarget
      ? Math.min(state.currentTargetIdx + 1, SEQUENCE.length - 1)
      : state.currentTargetIdx;
    const turn: TurnRecord = {
      target,
      throws: [...state.pendingThrows],
      advanced: hitTarget,
    };
    const won = hitTarget && newTargetIdx >= SEQUENCE.length - 1 && state.currentTargetIdx === SEQUENCE.length - 1;
    return {
      ...state,
      pendingThrows: [],
      turns: [...state.turns, turn],
      currentTargetIdx: hitTarget ? (state.currentTargetIdx + 1 < SEQUENCE.length ? state.currentTargetIdx + 1 : state.currentTargetIdx) : state.currentTargetIdx,
      won: hitTarget && state.currentTargetIdx === SEQUENCE.length - 1,
    };
  }

  return state;
}

export function isTerminal(state: RoundTheClockState): { score: number } | null {
  if (!state.won) return null;
  // Score: fewer total throws = better; perfect = 63 throws (21 targets × 3 darts, 1 turn each)
  const score = Math.max(100, 2000 - state.totalThrows * 10);
  return { score };
}
