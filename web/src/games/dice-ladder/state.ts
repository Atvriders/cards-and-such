import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DiceLadderSettings {
  rungs: "10" | "15" | "20";
  dice: "1" | "2";
}

export interface DiceLadderState {
  settings: DiceLadderSettings;
  rngSeed: number;
  rungs: number;
  currentRung: number; // 0 = start (below rung 1), rungs = at top (won)
  lastRoll: number[];
  turnsTaken: number;
  gameOver: boolean;
  won: boolean;
}

export type DiceLadderAction =
  | { type: "roll" }
  | { type: "climbUp" }
  | { type: "climbDown" }
  | { type: "restart" };

export interface DiceLadderPhase {
  rolled: boolean;
  canClimbUp: boolean;
  canClimbDown: boolean;
}

function nextSeed(seed: number): number {
  return (mulberry32(seed)() * 2 ** 31) >>> 0;
}

function rollDice(seed: number, count: number): { values: number[]; nextSeed: number } {
  let s = seed;
  const values: number[] = [];
  for (let i = 0; i < count; i++) {
    const rng = mulberry32(s);
    values.push(Math.floor(rng() * 6) + 1);
    s = nextSeed(s);
  }
  return { values, nextSeed: s };
}

export function initialState(seed: number, settings: DiceLadderSettings): DiceLadderState {
  return {
    settings,
    rngSeed: seed >>> 0,
    rungs: parseInt(settings.rungs, 10),
    currentRung: 0,
    lastRoll: [],
    turnsTaken: 0,
    gameOver: false,
    won: false,
  };
}

export function reducer(state: DiceLadderState, action: DiceLadderAction): DiceLadderState {
  if (action.type === "restart") {
    return initialState(nextSeed(state.rngSeed), state.settings);
  }
  if (state.gameOver) return state;

  if (action.type === "roll") {
    const diceCount = parseInt(state.settings.dice, 10);
    const { values, nextSeed: ns } = rollDice(state.rngSeed, diceCount);
    return { ...state, rngSeed: ns, lastRoll: values };
  }

  if (action.type === "climbUp") {
    if (state.lastRoll.length === 0) return state;
    const rollSum = state.lastRoll.reduce((a, b) => a + b, 0);
    // Can only climb by roll sum — cap at total rungs
    const newRung = Math.min(state.rungs, state.currentRung + rollSum);
    const won = newRung >= state.rungs;
    return {
      ...state,
      currentRung: newRung,
      lastRoll: [],
      turnsTaken: state.turnsTaken + 1,
      gameOver: won,
      won,
    };
  }

  if (action.type === "climbDown") {
    if (state.lastRoll.length === 0) return state;
    // Climb down by minimum die value to slip back a bit
    const minRoll = Math.min(...state.lastRoll);
    const newRung = Math.max(0, state.currentRung - minRoll);
    return {
      ...state,
      currentRung: newRung,
      lastRoll: [],
      turnsTaken: state.turnsTaken + 1,
    };
  }

  return state;
}

export function isTerminal(state: DiceLadderState): { score: number } | null {
  if (!state.gameOver) return null;
  // Score: base 1000 minus 20 per turn taken (min 100)
  const raw = 1000 - state.turnsTaken * 20;
  return { score: Math.max(100, raw) };
}

export function getPhase(state: DiceLadderState): DiceLadderPhase {
  const rolled = state.lastRoll.length > 0;
  return {
    rolled,
    canClimbUp: rolled,
    canClimbDown: rolled && state.currentRung > 0,
  };
}
