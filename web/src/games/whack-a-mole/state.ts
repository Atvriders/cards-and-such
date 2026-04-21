import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type HoleState =
  | { kind: "empty" }
  | { kind: "mole"; timeRemaining: number; spawnTime: number };

export interface WhackAMoleState {
  settings: { duration: "30" | "60" | "90"; grid: "3" | "4" | "5" };
  holes: readonly HoleState[];
  elapsed: number;
  score: number;
  ended: boolean;
  rngSeed: number;
  /** Internal RNG counter — advances with each spawn decision */
  rngCounter: number;
}

export type WhackAMoleAction =
  | { type: "tick"; dt: number }
  | { type: "whack"; index: number };

const MOLE_MIN_TIME = 1.0;
const MOLE_MAX_TIME = 2.0;
/** Probability per-hole per-tick (at 60fps) that an empty hole spawns a mole */
const SPAWN_CHANCE = 0.01;

function rngAt(seed: number, counter: number): number {
  const rng = mulberry32(seed + counter * 1000003);
  return rng();
}

export function initialState(
  seed: number,
  settings: { duration: "30" | "60" | "90"; grid: "3" | "4" | "5" },
): WhackAMoleState {
  const size = parseInt(settings.grid, 10);
  const holes: HoleState[] = Array(size * size).fill({ kind: "empty" });
  return {
    settings,
    holes,
    elapsed: 0,
    score: 0,
    ended: false,
    rngSeed: seed,
    rngCounter: 0,
  };
}

export function reducer(
  state: WhackAMoleState,
  action: WhackAMoleAction,
): WhackAMoleState {
  if (state.ended && action.type !== "tick") return state;

  switch (action.type) {
    case "tick": {
      const duration = parseInt(state.settings.duration, 10);
      const newElapsed = state.elapsed + action.dt;
      const ended = newElapsed >= duration;

      if (ended && state.ended) return state;

      // Age existing moles, remove expired ones
      let counter = state.rngCounter;
      const newHoles: HoleState[] = state.holes.map((hole) => {
        if (hole.kind === "mole") {
          const tr = hole.timeRemaining - action.dt;
          if (tr <= 0) return { kind: "empty" };
          return { ...hole, timeRemaining: tr };
        }
        return hole;
      });

      // Spawn new moles in empty holes (seeded)
      if (!ended) {
        for (let i = 0; i < newHoles.length; i++) {
          if (newHoles[i]!.kind === "empty") {
            const rv = rngAt(state.rngSeed, counter++);
            if (rv < SPAWN_CHANCE) {
              const rv2 = rngAt(state.rngSeed, counter++);
              const spawnTime = MOLE_MIN_TIME + rv2 * (MOLE_MAX_TIME - MOLE_MIN_TIME);
              newHoles[i] = { kind: "mole", timeRemaining: spawnTime, spawnTime };
            }
          }
        }
      }

      return {
        ...state,
        holes: newHoles,
        elapsed: ended ? duration : newElapsed,
        ended,
        rngCounter: counter,
      };
    }

    case "whack": {
      if (state.ended) return state;
      const hole = state.holes[action.index];
      if (!hole || hole.kind !== "mole") return state;

      const newHoles = state.holes.slice() as HoleState[];
      newHoles[action.index] = { kind: "empty" };
      return { ...state, holes: newHoles, score: state.score + 1 };
    }

    default:
      return state;
  }
}

export function isTerminal(state: WhackAMoleState): { score: number } | null {
  if (!state.ended) return null;
  return { score: state.score };
}
