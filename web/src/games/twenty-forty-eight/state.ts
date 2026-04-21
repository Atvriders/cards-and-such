import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type Dir = "up" | "down" | "left" | "right";

export interface TwoFortyEightState {
  settings: { boardSize: "3" | "4" | "5"; target: "1024" | "2048" | "4096" };
  size: number; // N
  targetValue: number;
  grid: readonly number[]; // row-major, length = size*size. 0 = empty.
  score: number; // sum of tile merges
  rngSeed: number;
  won: boolean; // reached target
  lost: boolean; // no moves possible
  movesMade: number;
  /** True if player has continued past the target for high-score chasing */
  continued: boolean;
  /** True when game is over for scoring purposes */
  ended: boolean;
}

export type TwoFortyEightAction =
  | { type: "slide"; dir: Dir }
  | { type: "continue" } // dismiss win overlay, keep playing for higher tiles
  | { type: "stop" }; // finalize score without reaching a loss

/** Compact, merge, and pad a single row to the left */
export function slide(row: number[], size: number): { next: number[]; score: number } {
  // Compact: remove zeros
  const compacted = row.filter((v) => v !== 0);

  let score = 0;
  const merged: number[] = [];
  let i = 0;
  while (i < compacted.length) {
    if (i + 1 < compacted.length && compacted[i] === compacted[i + 1]) {
      const val = compacted[i]! * 2;
      merged.push(val);
      score += val;
      i += 2;
    } else {
      merged.push(compacted[i]!);
      i++;
    }
  }

  // Pad with zeros on the right
  while (merged.length < size) merged.push(0);

  return { next: merged, score };
}

function spawnTile(grid: number[], rng: () => number): number[] {
  const empty: number[] = [];
  for (let i = 0; i < grid.length; i++) if (grid[i] === 0) empty.push(i);
  if (empty.length === 0) return grid;
  const idx = empty[Math.floor(rng() * empty.length)]!;
  const value = rng() < 0.9 ? 2 : 4;
  const next = [...grid];
  next[idx] = value;
  return next;
}

function applySlide(grid: readonly number[], size: number, dir: Dir): { grid: number[]; score: number } {
  const next = grid.slice() as number[];
  let totalScore = 0;

  if (dir === "left") {
    for (let r = 0; r < size; r++) {
      const row = next.slice(r * size, r * size + size);
      const { next: newRow, score } = slide(row, size);
      for (let c = 0; c < size; c++) next[r * size + c] = newRow[c]!;
      totalScore += score;
    }
  } else if (dir === "right") {
    for (let r = 0; r < size; r++) {
      const row = next.slice(r * size, r * size + size).reverse();
      const { next: newRow, score } = slide(row, size);
      const reversed = newRow.reverse();
      for (let c = 0; c < size; c++) next[r * size + c] = reversed[c]!;
      totalScore += score;
    }
  } else if (dir === "up") {
    for (let c = 0; c < size; c++) {
      const col: number[] = [];
      for (let r = 0; r < size; r++) col.push(next[r * size + c]!);
      const { next: newCol, score } = slide(col, size);
      for (let r = 0; r < size; r++) next[r * size + c] = newCol[r]!;
      totalScore += score;
    }
  } else {
    // down
    for (let c = 0; c < size; c++) {
      const col: number[] = [];
      for (let r = 0; r < size; r++) col.push(next[r * size + c]!);
      const reversed = col.reverse();
      const { next: newCol, score } = slide(reversed, size);
      const unreversed = newCol.reverse();
      for (let r = 0; r < size; r++) next[r * size + c] = unreversed[r]!;
      totalScore += score;
    }
  }

  return { grid: next, score: totalScore };
}

function gridsEqual(a: readonly number[], b: readonly number[]): boolean {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function hasMovesAvailable(grid: readonly number[], size: number): boolean {
  // Has empty cell?
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === 0) return true;
  }
  // Has adjacent equal cells (horizontal)?
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size - 1; c++) {
      if (grid[r * size + c] === grid[r * size + c + 1]) return true;
    }
  }
  // Has adjacent equal cells (vertical)?
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r * size + c] === grid[(r + 1) * size + c]) return true;
    }
  }
  return false;
}

export function initialState(
  seed: number,
  s: { boardSize: "3" | "4" | "5"; target: "1024" | "2048" | "4096" },
): TwoFortyEightState {
  const size = Number(s.boardSize);
  const rng = mulberry32(seed);
  let grid = new Array(size * size).fill(0) as number[];
  grid = spawnTile(grid, rng);
  grid = spawnTile(grid, rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    settings: s,
    size,
    targetValue: Number(s.target),
    grid,
    score: 0,
    rngSeed: nextSeed,
    won: false,
    lost: false,
    movesMade: 0,
    continued: false,
    ended: false,
  };
}

export function reducer(state: TwoFortyEightState, action: TwoFortyEightAction): TwoFortyEightState {
  switch (action.type) {
    case "slide": {
      // If already ended, don't process moves
      if (state.ended) return state;
      // If won (and not continued), don't process moves — waiting for continue/stop
      if (state.won && !state.continued) return state;
      // If lost, don't process moves
      if (state.lost) return state;

      const { grid: newGrid, score: slideScore } = applySlide(state.grid, state.size, action.dir);

      // If grid unchanged, this is a no-op move — no tile spawn
      if (gridsEqual(state.grid, newGrid)) return state;

      // Spawn a new tile
      const rng = mulberry32(state.rngSeed);
      const spawnedGrid = spawnTile(newGrid, rng);
      const nextSeed = Math.floor(rng() * 2 ** 31);

      const newScore = state.score + slideScore;

      // Check for target
      const hitTarget = !state.won && spawnedGrid.some((v) => v >= state.targetValue);
      const won = state.won || hitTarget;

      // Check for no-moves available
      const canMove = hasMovesAvailable(spawnedGrid, state.size);
      const lost = !canMove;
      const ended = lost;

      return {
        ...state,
        grid: spawnedGrid,
        score: newScore,
        rngSeed: nextSeed,
        won,
        lost,
        ended,
        movesMade: state.movesMade + 1,
      };
    }

    case "continue": {
      if (!state.won || state.continued || state.lost) return state;
      return { ...state, continued: true };
    }

    case "stop": {
      if (state.won || state.lost) {
        return { ...state, ended: true };
      }
      return state;
    }

    default:
      return state;
  }
}

export function isTerminal(state: TwoFortyEightState): { score: number } | null {
  if (state.ended) return { score: state.score };
  return null;
}
