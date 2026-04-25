import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Baseball: simulate a full 9-inning baseball game with two dice.
// Two dice rolled each at-bat. Result depends on sum.
// Sum 2 = Home Run (1 run + advance all)
// Sum 3 = Triple (3 bases)
// Sum 4 = Double (2 bases)
// Sum 5 or 9 = Single (1 base)
// Sum 6 or 8 = Fly Out
// Sum 7 = Ground Out (double play if bases loaded or men on)
// Sum 10 = Walk
// Sum 11 = Strike Out
// Sum 12 = Home Run

export interface DiceBaseballSettings {
  innings: "3" | "6" | "9";
}

export type BaseballResult =
  | "homeRun" | "triple" | "double" | "single"
  | "walk" | "flyOut" | "groundOut" | "strikeOut";

export interface DiceBaseballState {
  settings: DiceBaseballSettings;
  rngSeed: number;
  inning: number;        // 1..innings
  outs: number;          // 0..2
  bases: [boolean, boolean, boolean]; // 1st, 2nd, 3rd
  runs: number;
  lastRoll: [number, number] | null;
  lastResult: BaseballResult | null;
  gameOver: boolean;
}

export type DiceBaseballAction = { type: "roll" };

export function initialState(seed: number, settings: DiceBaseballSettings): DiceBaseballState {
  return {
    settings,
    rngSeed: seed,
    inning: 1,
    outs: 0,
    bases: [false, false, false],
    runs: 0,
    lastRoll: null,
    lastResult: null,
    gameOver: false,
  };
}

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

function rollTwo(rng: () => number): [number, number] {
  const d1 = Math.floor(rng() * 6) + 1;
  const d2 = Math.floor(rng() * 6) + 1;
  return [d1, d2];
}

function sumToResult(sum: number): BaseballResult {
  switch (sum) {
    case 2:  return "homeRun";
    case 3:  return "triple";
    case 4:  return "double";
    case 5:  return "single";
    case 6:  return "flyOut";
    case 7:  return "groundOut";
    case 8:  return "flyOut";
    case 9:  return "single";
    case 10: return "walk";
    case 11: return "strikeOut";
    case 12: return "homeRun";
    default: return "flyOut";
  }
}

// Advance bases by N bases. Returns [newBases, runsScored].
function advanceBases(
  bases: [boolean, boolean, boolean],
  advance: number,
  runnerAdvances = true
): { newBases: [boolean, boolean, boolean]; scored: number } {
  let scored = 0;
  // Shift runners
  const runners = [false, ...bases]; // index 0=batter, 1=1B, 2=2B, 3=3B
  // Advance each runner by `advance` bases
  const newPositions: boolean[] = [false, false, false, false]; // 1B,2B,3B,home
  for (let i = 0; i <= 3; i++) {
    if (i === 0 || (i >= 1 && runners[i]!)) {
      const newPos = i + advance;
      if (newPos >= 4) {
        scored++;
      } else {
        newPositions[newPos - 1] = true;
      }
    }
  }
  return {
    newBases: [newPositions[0]!, newPositions[1]!, newPositions[2]!],
    scored,
  };
}

export function reducer(state: DiceBaseballState, action: DiceBaseballAction): DiceBaseballState {
  if (state.gameOver) return state;
  if (action.type !== "roll") return state;

  const maxInnings = parseInt(state.settings.innings, 10);
  const { rng, nextSeed } = advanceSeed(state.rngSeed);
  const roll = rollTwo(rng);
  const sum = roll[0] + roll[1];
  const result = sumToResult(sum);

  let { outs, bases, runs, inning } = state;

  if (result === "strikeOut" || result === "flyOut") {
    outs += 1;
  } else if (result === "groundOut") {
    // Double play if runner on first, else just one out
    if (bases[0]) {
      outs += 2;
      bases = [false, bases[1], bases[2]];
    } else {
      outs += 1;
    }
  } else if (result === "homeRun") {
    const { scored } = advanceBases(bases, 4);
    runs += scored + 1; // batter + runners
    bases = [false, false, false];
  } else if (result === "triple") {
    const { scored } = advanceBases(bases, 3);
    runs += scored;
    bases = [false, false, true];
  } else if (result === "double") {
    const { scored } = advanceBases(bases, 2);
    runs += scored;
    bases = [false, true, false];
  } else if (result === "single" || result === "walk") {
    const advance = result === "walk" ? 1 : 1;
    const { newBases, scored } = advanceBases(bases, advance);
    runs += scored;
    bases = newBases;
  }

  // Check for inning over
  if (outs >= 3) {
    inning += 1;
    outs = 0;
    bases = [false, false, false];
  }

  const gameOver = inning > maxInnings;

  return {
    ...state,
    rngSeed: nextSeed,
    inning: Math.min(inning, maxInnings + 1),
    outs: gameOver ? 3 : outs,
    bases: gameOver ? [false, false, false] : bases,
    runs,
    lastRoll: roll,
    lastResult: result,
    gameOver,
  };
}

export function isTerminal(state: DiceBaseballState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.runs * 100 };
}
