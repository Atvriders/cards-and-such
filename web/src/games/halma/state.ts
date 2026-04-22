// Halma (10×10 board)
// Each player starts in a corner with 13 pieces.
// Move: one square in any of 8 directions, OR chain-jump over any adjacent piece.
// Goal: first to fill the opposite corner wins.

import type { Coord } from "../../engines/grid/index.js";
import { Grid } from "../../engines/grid/index.js";

export type HalmaPiece = "player" | "bot" | null;

export interface HalmaSettings {
  opponent: "easy" | "medium";
}

export interface HalmaState {
  settings: HalmaSettings;
  rngSeed: number;
  grid: Grid<HalmaPiece>;
  turn: "player" | "bot";
  selected: Coord | null;
  winner: "player" | "bot" | null;
}

export type HalmaAction =
  | { type: "select"; coord: Coord }
  | { type: "move"; to: Coord };

const BOARD_SIZE = 10;

// Player camp: top-left corner (rows 0-3, cols 0-3, minus corners)
// The traditional Halma camp is a triangle in the corner.
// For 10×10 with 13 pieces: rows 0-3 partially

function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
}

// Player camp: top-left triangle (13 cells)
function playerCamp(): Coord[] {
  const cells: Coord[] = [];
  for (let r = 0; r <= 4; r++) {
    for (let c = 0; c <= 4 - r; c++) {
      cells.push({ row: r, col: c });
    }
  }
  return cells; // 5+4+3+2+1 = 15, take first 13
  // Actually that's 15, trim to 13
}

function botCamp(): Coord[] {
  const cells: Coord[] = [];
  for (let r = BOARD_SIZE - 1; r >= BOARD_SIZE - 5; r--) {
    for (let c = BOARD_SIZE - 1; c >= BOARD_SIZE - 1 - (BOARD_SIZE - 1 - r); c--) {
      cells.push({ row: r, col: c });
    }
  }
  return cells;
}

// Player starts in top-left, goal is bottom-right (bot's start camp)
// Bot starts in bottom-right, goal is top-left (player's start camp)
export const PLAYER_CAMP = playerCamp().slice(0, 13);
export const BOT_CAMP = botCamp().slice(0, 13);
export const PLAYER_GOAL = BOT_CAMP;
export const BOT_GOAL = PLAYER_CAMP;

export function initialState(seed: number, settings: HalmaSettings): HalmaState {
  const cells: HalmaPiece[] = new Array(BOARD_SIZE * BOARD_SIZE).fill(null);
  for (const { row, col } of PLAYER_CAMP) cells[row * BOARD_SIZE + col] = "player";
  for (const { row, col } of BOT_CAMP) cells[row * BOARD_SIZE + col] = "bot";
  return {
    settings,
    rngSeed: seed,
    grid: new Grid<HalmaPiece>(BOARD_SIZE, BOARD_SIZE, cells),
    turn: "player",
    selected: null,
    winner: null,
  };
}

const DIRS8: Array<[number, number]> = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];

export function getReachable(grid: Grid<HalmaPiece>, from: Coord): Coord[] {
  const reachable: Coord[] = [];
  const visited = new Set<string>();
  visited.add(`${from.row},${from.col}`);

  // Step moves
  for (const [dr, dc] of DIRS8) {
    const nr = from.row + dr;
    const nc = from.col + dc;
    if (inBounds(nr, nc) && grid.get({ row: nr, col: nc }) === null) {
      reachable.push({ row: nr, col: nc });
    }
  }

  // Jump chain
  const queue: Coord[] = [from];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const [dr, dc] of DIRS8) {
      const nr = cur.row + dr;
      const nc = cur.col + dc;
      const lr = cur.row + dr * 2;
      const lc = cur.col + dc * 2;
      if (!inBounds(nr, nc) || !inBounds(lr, lc)) continue;
      if (grid.get({ row: nr, col: nc }) !== null && grid.get({ row: lr, col: lc }) === null) {
        const key = `${lr},${lc}`;
        if (!visited.has(key)) {
          visited.add(key);
          reachable.push({ row: lr, col: lc });
          queue.push({ row: lr, col: lc });
        }
      }
    }
  }

  return reachable;
}

function checkWinner(grid: Grid<HalmaPiece>): "player" | "bot" | null {
  const playerWon = PLAYER_GOAL.every(({ row, col }) => grid.get({ row, col }) === "player");
  if (playerWon) return "player";
  const botWon = BOT_GOAL.every(({ row, col }) => grid.get({ row, col }) === "bot");
  if (botWon) return "bot";
  return null;
}

// Greedy bot: advance the piece that makes the most progress toward the goal
function botProgress(coord: Coord, color: "player" | "bot"): number {
  // player goal is bottom-right (high row, high col)
  // bot goal is top-left (low row, low col)
  if (color === "bot") {
    return -(coord.row + coord.col); // lower is better (toward top-left)
  }
  return coord.row + coord.col;
}

function runBot(state: HalmaState): HalmaState {
  const grid = state.grid;
  let bestMove: { from: Coord; to: Coord } | null = null;
  let bestImprovement = -Infinity;

  for (const coord of grid.coords()) {
    const p = grid.get(coord);
    if (p !== "bot") continue;
    const reachable = getReachable(grid, coord);
    const fromProgress = botProgress(coord, "bot");
    for (const to of reachable) {
      const toProgress = botProgress(to, "bot");
      const improvement = toProgress - fromProgress;
      if (improvement > bestImprovement) {
        bestImprovement = improvement;
        bestMove = { from: coord, to };
      }
    }
  }

  if (!bestMove) return state;

  const newGrid = grid.set(bestMove.from, null).set(bestMove.to, "bot");
  const winner = checkWinner(newGrid);
  return { ...state, grid: newGrid, turn: "player", winner };
}

export function reducer(state: HalmaState, action: HalmaAction): HalmaState {
  if (state.winner !== null) return state;

  if (action.type === "select") {
    if (state.turn !== "player") return state;
    const p = state.grid.get(action.coord);
    if (p !== "player") return state;
    return { ...state, selected: action.coord };
  }

  if (action.type === "move") {
    if (state.turn !== "player" || state.selected === null) return state;
    const reachable = getReachable(state.grid, state.selected);
    const match = reachable.find((c) => c.row === action.to.row && c.col === action.to.col);
    if (!match) return state;

    const newGrid = state.grid.set(state.selected, null).set(action.to, "player");
    const winner = checkWinner(newGrid);
    if (winner !== null) return { ...state, grid: newGrid, selected: null, winner };

    let next: HalmaState = { ...state, grid: newGrid, turn: "bot", selected: null, winner: null };
    next = runBot(next);
    return next;
  }

  return state;
}

export function isTerminal(state: HalmaState): { score: number } | null {
  if (state.winner === null) return null;
  return state.winner === "player" ? { score: 100 } : { score: 0 };
}
