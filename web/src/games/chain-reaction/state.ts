import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const ROWS = 6;
export const COLS = 6;

export type Owner = 0 | 1 | null;

export interface Cell {
  owner: Owner;
  orbs: number;
}

export interface ChainReactionState {
  grid: Cell[];
  turn: 0 | 1;
  won: boolean;
  lost: boolean;
  score: number;
  moveCount: number;
  rngSeed: number;
}

export type ChainReactionAction = { type: "place"; row: number; col: number };

function idx(row: number, col: number): number {
  return row * COLS + col;
}

function capacity(row: number, col: number): number {
  const isEdgeRow = row === 0 || row === ROWS - 1;
  const isEdgeCol = col === 0 || col === COLS - 1;
  if (isEdgeRow && isEdgeCol) return 2;
  if (isEdgeRow || isEdgeCol) return 3;
  return 4;
}

function neighbors(row: number, col: number): [number, number][] {
  const result: [number, number][] = [];
  if (row > 0) result.push([row - 1, col]);
  if (row < ROWS - 1) result.push([row + 1, col]);
  if (col > 0) result.push([row, col - 1]);
  if (col < COLS - 1) result.push([row, col + 1]);
  return result;
}

function cloneGrid(grid: Cell[]): Cell[] {
  return grid.map(c => ({ ...c }));
}

function explode(grid: Cell[], maxIter: number = 200): Cell[] {
  let g = cloneGrid(grid);
  let changed = true;
  let iter = 0;
  while (changed && iter < maxIter) {
    changed = false;
    iter++;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = g[idx(r, c)]!;
        const cap = capacity(r, c);
        if (cell.orbs >= cap) {
          changed = true;
          const owner = cell.owner;
          g[idx(r, c)] = { owner: cell.orbs - cap === 0 ? null : owner, orbs: cell.orbs - cap };
          if (g[idx(r, c)]!.orbs === 0) g[idx(r, c)] = { owner: null, orbs: 0 };
          for (const [nr, nc] of neighbors(r, c)) {
            const n = g[idx(nr, nc)]!;
            g[idx(nr, nc)] = { owner, orbs: n.orbs + 1 };
          }
        }
      }
    }
  }
  return g;
}

function checkWinner(grid: Cell[], moveCount: number): Owner {
  if (moveCount < 2) return null; // Need at least one move each before elimination counts
  const owners = new Set(grid.map(c => c.owner).filter(o => o !== null));
  if (owners.size === 1) return [...owners][0]!;
  if (owners.size === 0) return null;
  return null;
}

function totalOrbs(grid: Cell[], owner: Owner): number {
  return grid.filter(c => c.owner === owner).reduce((s, c) => s + c.orbs, 0);
}

// Bot: greedy heuristic — pick the cell that, after explosion, maximizes bot's orbs
function botMove(state: ChainReactionState): [number, number] | null {
  let bestScore = -Infinity;
  let bestCell: [number, number] | null = null;
  const rng = mulberry32(state.rngSeed + state.moveCount);

  // Try all valid cells
  const candidates: [number, number][] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = state.grid[idx(r, c)]!;
      if (cell.owner === 0) continue; // can't place on opponent
      candidates.push([r, c]);
    }
  }
  if (candidates.length === 0) return null;

  // Shuffle to break ties randomly
  candidates.sort(() => rng() - 0.5);

  for (const [r, c] of candidates) {
    const testGrid = cloneGrid(state.grid);
    const cell = testGrid[idx(r, c)]!;
    testGrid[idx(r, c)] = { owner: 1, orbs: cell.orbs + 1 };
    const afterExplosion = explode(testGrid);
    const botOrbs = totalOrbs(afterExplosion, 1);
    const playerOrbs = totalOrbs(afterExplosion, 0);
    const score = botOrbs - playerOrbs * 0.8;
    if (score > bestScore) {
      bestScore = score;
      bestCell = [r, c];
    }
  }

  return bestCell;
}

export function initialState(seed: number): ChainReactionState {
  const grid: Cell[] = Array(ROWS * COLS).fill(null).map(() => ({ owner: null, orbs: 0 }));
  return {
    grid,
    turn: 0,
    won: false,
    lost: false,
    score: 0,
    moveCount: 0,
    rngSeed: seed,
  };
}

function applyPlace(state: ChainReactionState, row: number, col: number, player: 0 | 1): ChainReactionState {
  const cell = state.grid[idx(row, col)]!;
  if (cell.owner !== null && cell.owner !== player) return state;

  const newGrid = cloneGrid(state.grid);
  newGrid[idx(row, col)] = { owner: player, orbs: cell.orbs + 1 };
  const exploded = explode(newGrid);

  const moveCount = state.moveCount + 1;
  const winner = checkWinner(exploded, moveCount);
  const won = winner === 0;
  const lost = winner === 1;

  return {
    ...state,
    grid: exploded,
    turn: player === 0 ? 1 : 0,
    won,
    lost,
    score: won ? 100 : 0,
    moveCount,
  };
}

export function reducer(state: ChainReactionState, action: ChainReactionAction): ChainReactionState {
  if (state.won || state.lost) return state;
  if (action.type !== "place") return state;
  if (state.turn !== 0) return state;

  const { row, col } = action;
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return state;
  const cell = state.grid[idx(row, col)]!;
  if (cell.owner === 1) return state; // bot's cell

  let next = applyPlace(state, row, col, 0);
  if (next.won || next.lost) return next;

  // Bot move
  const botCell = botMove(next);
  if (botCell) {
    next = applyPlace(next, botCell[0], botCell[1], 1);
  }

  return next;
}

export function isTerminal(state: ChainReactionState): { score: number } | null {
  if (state.won) return { score: 100 };
  if (state.lost) return { score: 0 };
  return null;
}

export { capacity, neighbors, idx };
