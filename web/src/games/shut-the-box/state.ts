import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Shut the Box: 9 tiles 1-9, all start open.
// Roll 2 dice. Close tiles whose numbers sum to the dice total.
// Continue until no valid combination exists. Score = sum of open tiles (lower is better).

export interface ShutTheBoxSettings {
  targetScore: "25" | "20" | "15";
}

export type Phase = "preRoll" | "chooseTiles" | "gameOver";

export interface ShutTheBoxState {
  settings: ShutTheBoxSettings;
  rngSeed: number;
  tiles: boolean[]; // tiles[0] = tile 1, true = open
  roll: [number, number] | null;
  rollSum: number;
  phase: Phase;
  score: number; // sum of open tiles
  won: boolean;
  message: string;
  turnCount: number;
}

export type ShutTheBoxAction =
  | { type: "roll" }
  | { type: "closeTiles"; indices: number[] }; // 0-based indices of tiles to close

export function initialState(seed: number, settings: ShutTheBoxSettings): ShutTheBoxState {
  return {
    settings,
    rngSeed: seed,
    tiles: Array(9).fill(true), // all open
    roll: null,
    rollSum: 0,
    phase: "preRoll",
    score: 45,
    won: false,
    message: "Roll the dice to start!",
    turnCount: 0,
  };
}

function rollTwo(seed: number): { a: number; b: number; nextSeed: number } {
  const rng = mulberry32(seed);
  const a = Math.floor(rng() * 6) + 1;
  const b = Math.floor(rng() * 6) + 1;
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { a, b, nextSeed };
}

/** Return all subsets of open tiles that sum to total */
export function validCombinations(tiles: boolean[], total: number): number[][] {
  const openIndices = tiles
    .map((open, i) => (open ? i + 1 : null))
    .filter((v): v is number => v !== null);

  const results: number[][] = [];

  function dfs(start: number, remaining: number, current: number[]) {
    if (remaining === 0) {
      results.push([...current]);
      return;
    }
    for (let i = start; i < openIndices.length; i++) {
      const v = openIndices[i]!;
      if (v > remaining) break; // sorted ascending
      current.push(v);
      dfs(i + 1, remaining - v, current);
      current.pop();
    }
  }
  dfs(0, total, []);
  return results;
}

export function hasValidMove(tiles: boolean[], total: number): boolean {
  return validCombinations(tiles, total).length > 0;
}

export function computeScore(tiles: boolean[]): number {
  return tiles.reduce((sum, open, i) => sum + (open ? i + 1 : 0), 0);
}

export function reducer(state: ShutTheBoxState, action: ShutTheBoxAction): ShutTheBoxState {
  if (state.phase === "gameOver") return state;

  switch (action.type) {
    case "roll": {
      if (state.phase !== "preRoll") return state;
      const { a, b, nextSeed } = rollTwo(state.rngSeed);
      const rollSum = a + b;
      const canMove = hasValidMove(state.tiles, rollSum);

      if (!canMove) {
        const score = computeScore(state.tiles);
        const target = Number(state.settings.targetScore);
        const won = score <= target;
        return {
          ...state,
          rngSeed: nextSeed,
          roll: [a, b],
          rollSum,
          phase: "gameOver",
          score,
          won,
          message: `Rolled ${a}+${b}=${rollSum}. No valid moves! Score: ${score}${won ? " — You beat the target!" : ` — target was ${target}.`}`,
          turnCount: state.turnCount + 1,
        };
      }

      return {
        ...state,
        rngSeed: nextSeed,
        roll: [a, b],
        rollSum,
        phase: "chooseTiles",
        message: `Rolled ${a}+${b}=${rollSum}. Click tiles below to close (must sum to ${rollSum}).`,
        turnCount: state.turnCount + 1,
      };
    }

    case "closeTiles": {
      if (state.phase !== "chooseTiles") return state;
      const { indices } = action;
      if (indices.length === 0) return state;

      // Validate: indices are open and sum to rollSum
      const tileValues = indices.map((i) => i + 1);
      const sum = tileValues.reduce((s, v) => s + v, 0);
      if (sum !== state.rollSum) return state;
      if (!indices.every((i) => i >= 0 && i < 9 && state.tiles[i])) return state;

      const newTiles = state.tiles.map((open, i) => (indices.includes(i) ? false : open));
      const newScore = computeScore(newTiles);

      if (newScore === 0) {
        return {
          ...state,
          tiles: newTiles,
          score: 0,
          phase: "gameOver",
          won: true,
          message: "You shut the box! Perfect score!",
        };
      }

      return {
        ...state,
        tiles: newTiles,
        score: newScore,
        phase: "preRoll",
        roll: null,
        rollSum: 0,
        message: `Closed tiles [${tileValues.join(", ")}]. Score so far: ${newScore}. Roll again!`,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: ShutTheBoxState): { score: number } | null {
  if (state.phase !== "gameOver") return null;
  // Invert score: perfect = 100, worse = lower
  return { score: Math.max(0, 100 - state.score * 2) };
}
