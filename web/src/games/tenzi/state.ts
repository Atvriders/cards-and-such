import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Tenzi: Roll N dice. After each roll, set aside all dice showing a chosen target face.
// Reroll the rest. Repeat until all N dice show the target face.
// Score = N * 10 - rolls taken (fewer rolls is better).

export type DieFace = 1 | 2 | 3 | 4 | 5 | 6;

export interface TenziSettings {
  dice: "10" | "15" | "20";
}

export type Phase = "pickTarget" | "rolling" | "done";

export interface TenziState {
  settings: TenziSettings;
  rngSeed: number;
  numDice: number;
  target: DieFace | null;
  /** Current dice values (all dice) */
  dice: DieFace[];
  /** Which dice are locked (showing target) */
  locked: boolean[];
  rollCount: number;
  phase: Phase;
  winner: true | null;
  message: string;
}

export type TenziAction =
  | { type: "roll" }
  | { type: "setTarget"; face: DieFace };

function rollDiceArr(n: number, rng: () => number): DieFace[] {
  return Array.from({ length: n }, () => (Math.floor(rng() * 6) + 1) as DieFace);
}

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  // Advance once to get nextSeed
  const nextSeed = Math.floor(rng() * 2 ** 31) >>> 0;
  return { rng: mulberry32(seed), nextSeed };
}

export function initialState(seed: number, settings: TenziSettings): TenziState {
  const numDice = parseInt(settings.dice, 10);
  // Roll all dice initially so player can see what they have
  const { rng, nextSeed } = advanceSeed(seed >>> 0);
  const dice = rollDiceArr(numDice, rng);
  return {
    settings,
    rngSeed: nextSeed,
    numDice,
    target: null,
    dice,
    locked: Array(numDice).fill(false),
    rollCount: 1,
    phase: "pickTarget",
    winner: null,
    message: "Look at your dice and pick a target face to collect!",
  };
}

export function reducer(state: TenziState, action: TenziAction): TenziState {
  if (state.winner !== null) return state;

  switch (action.type) {
    case "setTarget": {
      if (state.phase !== "pickTarget") return state;
      const { face } = action;
      if (face < 1 || face > 6) return state;

      // Lock all dice already showing target
      const locked = state.dice.map((d) => d === face);
      const allLocked = locked.every(Boolean);

      return {
        ...state,
        target: face,
        locked,
        phase: allLocked ? "done" : "rolling",
        winner: allLocked ? true : null,
        message: allLocked
          ? `Incredible! All dice show ${face} already! Rolls: ${state.rollCount}`
          : `Target is ${face}. ${locked.filter(Boolean).length} locked. Click Roll!`,
      };
    }

    case "roll": {
      if (state.phase !== "rolling") return state;
      if (state.target === null) return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const newDice = state.dice.map((d, i) =>
        state.locked[i] ? d : ((Math.floor(rng() * 6) + 1) as DieFace),
      );
      // Consume extra rng to ensure nextSeed advances
      const newRollCount = state.rollCount + 1;
      const newLocked = newDice.map((d) => d === state.target);
      const allDone = newLocked.every(Boolean);

      return {
        ...state,
        rngSeed: nextSeed,
        dice: newDice,
        locked: newLocked,
        rollCount: newRollCount,
        phase: allDone ? "done" : "rolling",
        winner: allDone ? true : null,
        message: allDone
          ? `Done in ${newRollCount} rolls!`
          : `${newLocked.filter(Boolean).length}/${state.numDice} locked. Roll #${newRollCount}.`,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: TenziState): { score: number } | null {
  if (!state.winner) return null;
  // Higher score for fewer rolls: base = numDice * 10, subtract rollCount
  const base = state.numDice * 10;
  return { score: Math.max(0, base - state.rollCount) };
}
