import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface RollASixSettings {
  // no settings
}

export interface RollASixState {
  settings: RollASixSettings;
  rngSeed: number;
  rolls: number;
  sixesRolled: number;
  lastDie: number | null;
  done: boolean;
}

export type RollASixAction = { type: "roll" };

const TARGET_SIXES = 10;

function nextSeed(seed: number): number {
  return (mulberry32(seed)() * 2 ** 31) >>> 0;
}

function rollDie(seed: number): number {
  const rng = mulberry32(seed);
  return Math.floor(rng() * 6) + 1;
}

export function initialState(seed: number, settings: RollASixSettings): RollASixState {
  return {
    settings,
    rngSeed: seed >>> 0,
    rolls: 0,
    sixesRolled: 0,
    lastDie: null,
    done: false,
  };
}

export function reducer(state: RollASixState, action: RollASixAction): RollASixState {
  if (state.done) return state;
  if (action.type !== "roll") return state;

  const die = rollDie(state.rngSeed);
  const newSeed = nextSeed(state.rngSeed);
  const sixesRolled = state.sixesRolled + (die === 6 ? 1 : 0);
  const rolls = state.rolls + 1;
  const done = sixesRolled >= TARGET_SIXES;

  return {
    ...state,
    rngSeed: newSeed,
    rolls,
    sixesRolled,
    lastDie: die,
    done,
  };
}

export function isTerminal(state: RollASixState): { score: number } | null {
  if (!state.done) return null;
  const score = Math.max(0, 100 - state.rolls);
  return { score };
}

export { TARGET_SIXES };
