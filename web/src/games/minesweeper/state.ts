import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type CellState = "hidden" | "revealed" | "flagged";

export interface MinesweeperSettings {
  difficulty: "beginner" | "intermediate" | "expert";
}

export interface MinesweeperState {
  settings: MinesweeperSettings;
  rows: number;
  cols: number;
  mineCount: number;
  /** Row-major. true = mine. null during "pre-first-click" — mines haven't been placed yet. */
  mines: readonly boolean[] | null;
  /** Row-major. Adjacent-mine counts. -1 for mine cells. null until mines placed. */
  adj: readonly number[] | null;
  state: readonly CellState[]; // length rows*cols
  rngSeed: number;
  flagsUsed: number;
  revealedCount: number;
  lost: boolean;
  won: boolean;
  firstMove: boolean; // true until first reveal happens
}

export type MinesweeperAction =
  | { type: "reveal"; row: number; col: number }
  | { type: "flag"; row: number; col: number }
  | { type: "chord"; row: number; col: number };

const DIFFICULTY_CONFIG = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 },
} as const;

export function initialState(seed: number, settings: MinesweeperSettings): MinesweeperState {
  const config = DIFFICULTY_CONFIG[settings.difficulty];
  const total = config.rows * config.cols;

  return {
    settings,
    rows: config.rows,
    cols: config.cols,
    mineCount: config.mines,
    mines: null,
    adj: null,
    state: new Array(total).fill("hidden") as CellState[],
    rngSeed: seed,
    flagsUsed: 0,
    revealedCount: 0,
    lost: false,
    won: false,
    firstMove: true,
  };
}

function placeMines(
  rows: number,
  cols: number,
  count: number,
  safeIdx: number,
  rng: () => number,
): boolean[] {
  const total = rows * cols;
  const safeCells = new Set<number>([safeIdx]);
  const sr = Math.floor(safeIdx / cols);
  const sc = safeIdx % cols;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = sr + dr;
      const c = sc + dc;
      if (r >= 0 && r < rows && c >= 0 && c < cols) safeCells.add(r * cols + c);
    }
  }

  const candidates: number[] = [];
  for (let i = 0; i < total; i++) if (!safeCells.has(i)) candidates.push(i);

  // Fisher-Yates shuffle using rng, take first `count`
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j]!, candidates[i]!];
  }

  const minePositions = new Set(candidates.slice(0, count));
  const mines = new Array(total).fill(false) as boolean[];
  for (const p of minePositions) mines[p] = true;
  return mines;
}

function computeAdj(mines: boolean[], rows: number, cols: number): number[] {
  const adj = new Array(rows * cols).fill(0) as number[];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (mines[idx]) {
        adj[idx] = -1;
        continue;
      }
      let n = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
          if (mines[nr * cols + nc]) n++;
        }
      }
      adj[idx] = n;
    }
  }
  return adj;
}

/** BFS flood-reveal starting from idx. Mutates cellState in-place and returns how many newly revealed. */
function floodReveal(
  startIdx: number,
  adj: readonly number[],
  rows: number,
  cols: number,
  cellState: CellState[],
): number {
  let revealed = 0;
  const queue: number[] = [startIdx];
  const visited = new Set<number>();
  visited.add(startIdx);

  while (queue.length > 0) {
    const idx = queue.shift()!;
    if (cellState[idx] !== "hidden") continue;
    cellState[idx] = "revealed";
    revealed++;

    if (adj[idx] === 0) {
      const r = Math.floor(idx / cols);
      const c = idx % cols;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
          const nIdx = nr * cols + nc;
          if (!visited.has(nIdx) && cellState[nIdx] === "hidden") {
            visited.add(nIdx);
            queue.push(nIdx);
          }
        }
      }
    }
  }

  return revealed;
}

export function reducer(state: MinesweeperState, action: MinesweeperAction): MinesweeperState {
  switch (action.type) {
    case "reveal": {
      if (state.lost || state.won) return state;

      const { row, col, ..._ } = action;
      const idx = row * state.cols + col;

      if (state.state[idx] !== "hidden") return state;

      let mines = state.mines;
      let adj = state.adj;
      let rngSeed = state.rngSeed;

      if (state.firstMove) {
        // Place mines avoiding the clicked cell and its neighbors
        const rng = mulberry32(state.rngSeed);
        rngSeed = Math.floor(rng() * 2 ** 31);
        const rng2 = mulberry32(state.rngSeed);
        mines = placeMines(state.rows, state.cols, state.mineCount, idx, rng2);
        adj = computeAdj(mines as boolean[], state.rows, state.cols);
      }

      const newCellState = state.state.slice() as CellState[];

      // Check if this cell is a mine
      if (mines![idx]) {
        // Reveal all mines on loss
        for (let i = 0; i < mines!.length; i++) {
          if (mines![i]) newCellState[i] = "revealed";
        }
        return {
          ...state,
          mines,
          adj,
          rngSeed,
          state: newCellState,
          lost: true,
          firstMove: false,
        };
      }

      // Safe cell — flood reveal
      const newlyRevealed = floodReveal(idx, adj!, state.rows, state.cols, newCellState);
      const revealedCount = state.revealedCount + newlyRevealed;
      const won = revealedCount === state.rows * state.cols - state.mineCount;

      return {
        ...state,
        mines,
        adj,
        rngSeed,
        state: newCellState,
        revealedCount,
        won,
        firstMove: false,
      };
    }

    case "flag": {
      if (state.lost || state.won) return state;

      const idx = action.row * state.cols + action.col;
      const cell = state.state[idx];

      if (cell === "revealed") return state;

      const newCellState = state.state.slice() as CellState[];
      let flagsUsed = state.flagsUsed;

      if (cell === "hidden") {
        newCellState[idx] = "flagged";
        flagsUsed++;
      } else {
        // flagged → hidden
        newCellState[idx] = "hidden";
        flagsUsed--;
      }

      return { ...state, state: newCellState, flagsUsed };
    }

    case "chord": {
      if (state.lost || state.won) return state;

      const idx = action.row * state.cols + action.col;
      if (state.state[idx] !== "revealed") return state;
      if (!state.adj) return state;

      const adjCount = state.adj[idx];
      if (adjCount === undefined || adjCount <= 0) return state;

      // Count flagged neighbors
      const { rows, cols } = state;
      const r = action.row;
      const c = action.col;
      let flaggedCount = 0;
      const hiddenNeighbors: number[] = [];

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
          const nIdx = nr * cols + nc;
          if (state.state[nIdx] === "flagged") flaggedCount++;
          else if (state.state[nIdx] === "hidden") hiddenNeighbors.push(nIdx);
        }
      }

      if (flaggedCount !== adjCount) return state;

      // Reveal all unflagged hidden neighbors
      const newCellState = state.state.slice() as CellState[];
      let revealedCount = state.revealedCount;
      let lost: boolean = state.lost;

      for (const nIdx of hiddenNeighbors) {
        if (state.mines![nIdx]) {
          // Hit a mine during chord
          for (let i = 0; i < state.mines!.length; i++) {
            if (state.mines![i]) newCellState[i] = "revealed";
          }
          lost = true;
          break;
        } else {
          const newlyRevealed = floodReveal(nIdx, state.adj!, rows, cols, newCellState);
          revealedCount += newlyRevealed;
        }
      }

      if (lost) {
        return { ...state, state: newCellState, lost: true };
      }

      const won = revealedCount === rows * cols - state.mineCount;
      return { ...state, state: newCellState, revealedCount, won };
    }

    default:
      return state;
  }
}

export function isTerminal(state: MinesweeperState): { score: number } | null {
  if (state.won) {
    return { score: 1000 * state.revealedCount };
  }
  if (state.lost) {
    return { score: 0 };
  }
  return null;
}
