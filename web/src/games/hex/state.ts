import { Grid } from "../../engines/grid/index.js";
import { minimax } from "../../engines/grid/minimax.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type Cell = 0 | 1 | null; // 0 = black (top-bottom), 1 = white (left-right)

export interface HexSettings {
  size: "9" | "11" | "13";
  swapRule: boolean;
}

export interface HexState {
  settings: HexSettings;
  grid: Grid<Cell>;
  turn: 0 | 1;
  winner: 0 | 1 | null;
  movesMade: number;
  swapped: boolean; // second player swapped first move
  rngSeed: number;
}

export type HexAction =
  | { type: "place"; at: { row: number; col: number } }
  | { type: "swap" }; // swap rule: second player can swap first player's stone

// Hex neighbors in offset coordinates (odd-r)
export function hexNeighbors(row: number, col: number, size: number): Array<{ row: number; col: number }> {
  const dirs: ReadonlyArray<readonly [number, number]> = row % 2 === 0
    ? [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]]
    : [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]];
  const result: Array<{ row: number; col: number }> = [];
  for (const [dr, dc] of dirs) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
      result.push({ row: nr, col: nc });
    }
  }
  return result;
}

// BFS to check if seat has won
function checkWinner(grid: Grid<Cell>, seat: 0 | 1): boolean {
  const size = grid.rows;
  const visited = new Set<string>();
  const queue: Array<{ row: number; col: number }> = [];

  // Seat 0 (black): top-to-bottom, start from row 0
  // Seat 1 (white): left-to-right, start from col 0
  if (seat === 0) {
    for (let c = 0; c < size; c++) {
      if (grid.get({ row: 0, col: c }) === 0) {
        const key = `0,${c}`;
        if (!visited.has(key)) { visited.add(key); queue.push({ row: 0, col: c }); }
      }
    }
  } else {
    for (let r = 0; r < size; r++) {
      if (grid.get({ row: r, col: 0 }) === 1) {
        const key = `${r},0`;
        if (!visited.has(key)) { visited.add(key); queue.push({ row: r, col: 0 }); }
      }
    }
  }

  while (queue.length > 0) {
    const curr = queue.shift()!;
    // Check if we reached the opposite side
    if (seat === 0 && curr.row === size - 1) return true;
    if (seat === 1 && curr.col === size - 1) return true;

    for (const nb of hexNeighbors(curr.row, curr.col, size)) {
      const key = `${nb.row},${nb.col}`;
      if (!visited.has(key) && grid.get(nb) === seat) {
        visited.add(key);
        queue.push(nb);
      }
    }
  }
  return false;
}

// Simple heuristic: count of own stones reachable from goal side
function evalHex(grid: Grid<Cell>, seat: 0 | 1): number {
  const opp: 0 | 1 = seat === 0 ? 1 : 0;
  let score = 0;
  for (const c of grid.coords()) {
    const v = grid.get(c);
    if (v === seat) score++;
    else if (v === opp) score--;
  }
  // Bonus for central stones
  const center = Math.floor(grid.rows / 2);
  for (const c of grid.coords()) {
    const v = grid.get(c);
    if (v === null) continue;
    const dist = Math.abs(c.row - center) + Math.abs(c.col - center);
    if (v === seat) score += Math.max(0, 3 - dist);
    else score -= Math.max(0, 3 - dist);
  }
  return score;
}

interface BotSearchState {
  grid: Grid<Cell>;
  turn: 0 | 1;
}

function getBotMove(state: HexState): { row: number; col: number } | null {
  const size = state.grid.rows;
  const result = minimax<BotSearchState, { row: number; col: number }>(
    { grid: state.grid, turn: state.turn as 0 | 1 },
    {
      depth: 3,
      moves(s) {
        if (checkWinner(s.grid, 0) || checkWinner(s.grid, 1)) return [];
        const moves: Array<{ row: number; col: number }> = [];
        for (const c of s.grid.coords()) {
          if (s.grid.get(c) === null) moves.push(c);
        }
        return moves;
      },
      apply(s, m) {
        return { grid: s.grid.set(m, s.turn), turn: (s.turn === 0 ? 1 : 0) as 0 | 1 };
      },
      isTerminal(s) { return checkWinner(s.grid, 0) || checkWinner(s.grid, 1); },
      evaluate(s) { return evalHex(s.grid, 1); },
      maximizing(s) { return s.turn === 1; },
    }
  );
  return result.move ?? ((): { row: number; col: number } | null => {
    // Fallback: pick center or random empty
    const center = Math.floor(size / 2);
    if (state.grid.inBounds({ row: center, col: center }) && state.grid.get({ row: center, col: center }) === null) {
      return { row: center, col: center };
    }
    for (const c of state.grid.coords()) {
      if (state.grid.get(c) === null) return c;
    }
    return null;
  })();
}

export function initialState(seed: number, settings: HexSettings): HexState {
  const size = parseInt(settings.size, 10);
  return {
    settings,
    grid: Grid.filled<Cell>(size, size, null),
    turn: 0,
    winner: null,
    movesMade: 0,
    swapped: false,
    rngSeed: seed,
  };
}

function runBotIfNeeded(state: HexState): HexState {
  let s = state;
  while (s.winner === null && s.turn === 1) {
    const rng = mulberry32(s.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const move = getBotMove(s);
    if (!move) break;
    const newGrid = s.grid.set(move, 1);
    const won = checkWinner(newGrid, 1);
    s = {
      ...s,
      grid: newGrid,
      turn: 0,
      movesMade: s.movesMade + 1,
      winner: won ? 1 : null,
      rngSeed: nextSeed,
    };
    break;
  }
  return s;
}

export function reducer(state: HexState, action: HexAction): HexState {
  if (state.winner !== null) return state;

  if (action.type === "swap") {
    // Swap rule: only available to white (seat 1) on their first move (movesMade === 1)
    if (!state.settings.swapRule) return state;
    if (state.turn !== 1 || state.movesMade !== 1) return state;
    // Find the single black stone and flip it to white
    const size = state.grid.rows;
    let newGrid = state.grid;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (newGrid.get({ row: r, col: c }) === 0) {
          newGrid = newGrid.set({ row: r, col: c }, 1);
        }
      }
    }
    // Now it's black's turn (human's turn)
    return { ...state, grid: newGrid, turn: 0, swapped: true };
  }

  if (action.type === "place") {
    const { row, col } = action.at;
    if (!state.grid.inBounds({ row, col })) return state;
    if (state.grid.get({ row, col }) !== null) return state;
    if (state.turn !== 0) return state; // human is always seat 0

    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);

    const newGrid = state.grid.set({ row, col }, 0);
    const won = checkWinner(newGrid, 0);
    let next: HexState = {
      ...state,
      grid: newGrid,
      turn: 1,
      movesMade: state.movesMade + 1,
      winner: won ? 0 : null,
      rngSeed: nextSeed,
    };
    if (won) return next;

    // Check if swap rule applies (after first move, bot can swap — but we implement it
    // so that the bot *never* swaps to keep gameplay simple)
    next = runBotIfNeeded(next);
    return next;
  }

  return state;
}

export function isTerminal(state: HexState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === 0) return { score: 100 };
  return { score: 0 };
}

export { checkWinner };
