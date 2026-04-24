import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * Qwixx — solo variant.
 * 4 colored rows: Red/Yellow (2→12 left-to-right), Blue/Green (12→2 right-to-left).
 * Roll 6 dice (2 white + 1 each red, yellow, blue, green).
 * On your turn you MUST mark white1+white2 sum in ANY row (or take a penalty).
 * Optionally also mark white+colorDie in that row's color.
 * Lock a row by marking the 12 (or 2 for Blue/Green) AND having 5+ marks in it.
 * 5 penalties = game over. Game also ends when 2 rows are locked.
 * Score: sum of row scores (1,3,6,10,15,21,28,36) minus penalty (5 pts each).
 */

export interface QwixxSettings {
  mode: "normal" | "easy";
}

export type Color = "red" | "yellow" | "blue" | "green";

const COLORS: Color[] = ["red", "yellow", "blue", "green"];

// For red/yellow rows: values 2,3,4,...,12 (left to right)
// For blue/green rows: values 12,11,10,...,2 (left to right)
const ROW_VALUES: Record<Color, readonly number[]> = {
  red:    [2,3,4,5,6,7,8,9,10,11,12],
  yellow: [2,3,4,5,6,7,8,9,10,11,12],
  blue:   [12,11,10,9,8,7,6,5,4,3,2],
  green:  [12,11,10,9,8,7,6,5,4,3,2],
};

// Row score: marks → score
function rowScore(marks: number): number {
  const table = [0, 1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66, 78];
  return table[Math.min(marks, table.length - 1)] ?? 0;
}

export interface QwixxState {
  settings: QwixxSettings;
  rngSeed: number;
  /** Per-color: set of indices (into ROW_VALUES) that are checked */
  checked: Record<Color, boolean[]>;
  locked: Record<Color, boolean>;
  penalties: number;
  whiteDice: [number, number];
  colorDice: Record<Color, number>;
  phase: "preRoll" | "rolled" | "done";
  penaltyThisTurn: boolean;
  rollCount: number;
}

export type QwixxAction =
  | { type: "roll" }
  | { type: "markWhite"; color: Color; index: number }
  | { type: "markColor"; color: Color; index: number }
  | { type: "takePenalty" };

function rollDie(seed: number): { value: number; nextSeed: number } {
  const rng = mulberry32(seed);
  const v1 = rng();
  const nextSeed = (Math.floor(v1 * 2 ** 31)) >>> 0;
  const rng2 = mulberry32(seed);
  return { value: Math.floor(rng2() * 6) + 1, nextSeed };
}

function rollAll(seed: number): { whiteDice: [number, number]; colorDice: Record<Color, number>; nextSeed: number } {
  let s = seed;
  const results: number[] = [];
  for (let i = 0; i < 6; i++) {
    const { value, nextSeed } = rollDie(s);
    results.push(value);
    s = nextSeed;
  }
  return {
    whiteDice: [results[0] ?? 1, results[1] ?? 1],
    colorDice: { red: results[2] ?? 1, yellow: results[3] ?? 1, blue: results[4] ?? 1, green: results[5] ?? 1 },
    nextSeed: s,
  };
}

function rightmostChecked(checked: boolean[]): number {
  for (let i = checked.length - 1; i >= 0; i--) {
    if (checked[i]) return i;
  }
  return -1;
}

function canMark(checked: readonly boolean[], locked: boolean, index: number): boolean {
  if (locked) return false;
  if (checked[index]) return false;
  // Must mark to the right of the rightmost checked
  const last = rightmostChecked([...checked] as boolean[]);
  return index > last;
}

function checkLock(checked: boolean[], index: number, rowLen: number): boolean {
  // Lock if marking the last position AND have 5+ marks
  const marks = checked.filter(Boolean).length + 1; // +1 for the one we're about to mark
  return index === rowLen - 1 && marks >= 5;
}

export function initialState(seed: number, settings: QwixxSettings): QwixxState {
  const emptyChecked = () => Array(11).fill(false) as boolean[];
  return {
    settings,
    rngSeed: seed >>> 0,
    checked: { red: emptyChecked(), yellow: emptyChecked(), blue: emptyChecked(), green: emptyChecked() },
    locked: { red: false, yellow: false, blue: false, green: false },
    penalties: 0,
    whiteDice: [0, 0],
    colorDice: { red: 0, yellow: 0, blue: 0, green: 0 },
    phase: "preRoll",
    penaltyThisTurn: false,
    rollCount: 0,
  };
}

function countLocked(locked: Record<Color, boolean>): number {
  return COLORS.filter((c) => locked[c]).length;
}

function checkDone(state: QwixxState): boolean {
  return state.penalties >= 4 || countLocked(state.locked) >= 2;
}

export function reducer(state: QwixxState, action: QwixxAction): QwixxState {
  switch (action.type) {
    case "roll": {
      if (state.phase !== "preRoll") return state;
      const { whiteDice, colorDice, nextSeed } = rollAll(state.rngSeed);
      return {
        ...state,
        rngSeed: nextSeed,
        whiteDice,
        colorDice,
        phase: "rolled",
        penaltyThisTurn: false,
        rollCount: state.rollCount + 1,
      };
    }

    case "markWhite": {
      if (state.phase !== "rolled") return state;
      const { color, index } = action;
      if (state.locked[color]) return state;
      const whiteSum = state.whiteDice[0] + state.whiteDice[1];
      const vals = ROW_VALUES[color];
      if (vals[index] !== whiteSum) return state;
      if (!canMark(state.checked[color], state.locked[color], index)) return state;

      const newChecked = { ...state.checked, [color]: [...state.checked[color]] };
      newChecked[color][index] = true;
      const willLock = checkLock(state.checked[color], index, vals.length);
      const newLocked = willLock ? { ...state.locked, [color]: true } : state.locked;

      const next: QwixxState = { ...state, checked: newChecked, locked: newLocked };
      if (checkDone(next)) return { ...next, phase: "done" };
      return next;
    }

    case "markColor": {
      if (state.phase !== "rolled") return state;
      const { color, index } = action;
      if (state.locked[color]) return state;
      const colorVal = state.colorDice[color];
      const whiteVal = state.whiteDice[0] === state.whiteDice[1]
        ? state.whiteDice[0]
        : null; // need specific white die — simplified: use either white
      const sum1 = state.whiteDice[0] + colorVal;
      const sum2 = state.whiteDice[1] + colorVal;
      const vals = ROW_VALUES[color];
      if (vals[index] !== sum1 && vals[index] !== sum2) return state;
      void whiteVal;
      if (!canMark(state.checked[color], state.locked[color], index)) return state;

      const newChecked = { ...state.checked, [color]: [...state.checked[color]] };
      newChecked[color][index] = true;
      const willLock = checkLock(state.checked[color], index, vals.length);
      const newLocked = willLock ? { ...state.locked, [color]: true } : state.locked;

      const next: QwixxState = { ...state, checked: newChecked, locked: newLocked };
      if (checkDone(next)) return { ...next, phase: "done" };
      // After marking color, move to next turn
      return { ...next, phase: "preRoll" };
    }

    case "takePenalty": {
      if (state.phase !== "rolled") return state;
      const newPenalties = state.penalties + 1;
      const next: QwixxState = { ...state, penalties: newPenalties, phase: "preRoll", penaltyThisTurn: true };
      if (checkDone(next)) return { ...next, phase: "done" };
      return next;
    }

    default:
      return state;
  }
}

export function calcScore(state: QwixxState): number {
  let total = 0;
  for (const color of COLORS) {
    const marks = state.checked[color].filter(Boolean).length
      + (state.locked[color] ? 1 : 0);
    total += rowScore(marks);
  }
  total -= state.penalties * 5;
  return total;
}

export function isTerminal(state: QwixxState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, calcScore(state)) };
}
