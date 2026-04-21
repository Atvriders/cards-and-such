import { Grid } from "../../engines/grid/index.js";
import { minimax } from "../../engines/grid/minimax.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type Cell = 0 | 1 | null; // seat 0 = black, seat 1 = white, null = empty

export interface ReversiSettings {
  botDifficulty: "easy" | "medium" | "hard";
}

export interface ReversiState {
  settings: ReversiSettings;
  grid: Grid<Cell>;
  turn: 0 | 1;
  lastPass: boolean;
  winner: 0 | 1 | "draw" | null;
  movesMade: number;
  blackCount: number;
  whiteCount: number;
  rngSeed: number;
}

export type ReversiAction =
  | { type: "place"; at: { row: number; col: number } }
  | { type: "pass" };

const DIRS: ReadonlyArray<readonly [number, number]> = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];

export function flipsFor(
  grid: Grid<Cell>,
  seat: 0 | 1,
  r: number,
  c: number,
): Array<{ row: number; col: number }> {
  if (grid.get({ row: r, col: c }) !== null) return [];
  const opp = seat === 0 ? 1 : 0;
  const all: Array<{ row: number; col: number }> = [];

  for (const [dr, dc] of DIRS) {
    const line: Array<{ row: number; col: number }> = [];
    let nr = r + dr;
    let nc = c + dc;
    while (
      nr >= 0 && nr < grid.rows &&
      nc >= 0 && nc < grid.cols &&
      grid.get({ row: nr, col: nc }) === opp
    ) {
      line.push({ row: nr, col: nc });
      nr += dr;
      nc += dc;
    }
    if (
      line.length > 0 &&
      nr >= 0 && nr < grid.rows &&
      nc >= 0 && nc < grid.cols &&
      grid.get({ row: nr, col: nc }) === seat
    ) {
      all.push(...line);
    }
  }
  return all;
}

export function legalMoves(grid: Grid<Cell>, seat: 0 | 1): Array<{ row: number; col: number }> {
  const moves: Array<{ row: number; col: number }> = [];
  for (const c of grid.coords()) {
    if (grid.get(c) !== null) continue;
    if (flipsFor(grid, seat, c.row, c.col).length > 0) {
      moves.push(c);
    }
  }
  return moves;
}

function countDiscs(grid: Grid<Cell>): { black: number; white: number } {
  let black = 0;
  let white = 0;
  for (const c of grid.coords()) {
    const v = grid.get(c);
    if (v === 0) black++;
    else if (v === 1) white++;
  }
  return { black, white };
}

function applyMove(
  grid: Grid<Cell>,
  seat: 0 | 1,
  r: number,
  c: number,
): Grid<Cell> {
  const flips = flipsFor(grid, seat, r, c);
  let g = grid.set({ row: r, col: c }, seat);
  for (const f of flips) {
    g = g.set(f, seat);
  }
  return g;
}

function checkTerminal(
  grid: Grid<Cell>,
  blackCount: number,
  whiteCount: number,
  seat0HasMoves: boolean,
  seat1HasMoves: boolean,
): { winner: 0 | 1 | "draw" | null } {
  const total = grid.rows * grid.cols;
  const filled = blackCount + whiteCount === total;
  if (filled || (!seat0HasMoves && !seat1HasMoves)) {
    if (blackCount > whiteCount) return { winner: 0 };
    if (whiteCount > blackCount) return { winner: 1 };
    return { winner: "draw" };
  }
  return { winner: null };
}

// ----- minimax bot -----

interface BotState {
  grid: Grid<Cell>;
  turn: 0 | 1;
  passCount: number; // consecutive passes so far
}

const CORNERS: ReadonlyArray<readonly [number, number]> = [
  [0, 0], [0, 7], [7, 0], [7, 7],
];

function evalBoard(grid: Grid<Cell>, seat: 0 | 1): number {
  const opp: 0 | 1 = seat === 0 ? 1 : 0;
  let score = 0;
  for (const c of grid.coords()) {
    const v = grid.get(c);
    if (v === seat) score++;
    else if (v === opp) score--;
  }
  // corners bonus
  for (const [cr, cc] of CORNERS) {
    const v = grid.get({ row: cr, col: cc });
    if (v === seat) score += 10;
    else if (v === opp) score -= 10;
  }
  return score;
}

function evalBoardHard(grid: Grid<Cell>, seat: 0 | 1): number {
  const opp: 0 | 1 = seat === 0 ? 1 : 0;
  let score = 0;
  for (const c of grid.coords()) {
    const v = grid.get(c);
    if (v === seat) score++;
    else if (v === opp) score--;
  }
  for (const [cr, cc] of CORNERS) {
    const v = grid.get({ row: cr, col: cc });
    if (v === seat) score += 15;
    else if (v === opp) score -= 15;
  }
  // mobility
  score += legalMoves(grid, seat).length * 2;
  score -= legalMoves(grid, opp).length * 2;
  return score;
}

function botMove(
  grid: Grid<Cell>,
  seat: 0 | 1,
  difficulty: "easy" | "medium" | "hard",
  rng: () => number,
): { row: number; col: number } | null {
  const moves = legalMoves(grid, seat);
  if (moves.length === 0) return null;

  if (difficulty === "easy") {
    return moves[Math.floor(rng() * moves.length)]!;
  }

  const depth = difficulty === "hard" ? 5 : 3;
  const evalFn = difficulty === "hard" ? evalBoardHard : evalBoard;

  const result = minimax<BotState, { row: number; col: number }>(
    { grid, turn: seat, passCount: 0 },
    {
      depth,
      moves(s) {
        if (s.passCount >= 2) return [];
        const ms = legalMoves(s.grid, s.turn);
        if (ms.length === 0) {
          // pass is a "move" represented as sentinel { row: -1, col: -1 }
          return [{ row: -1, col: -1 }];
        }
        return ms;
      },
      apply(s, m) {
        const opp: 0 | 1 = s.turn === 0 ? 1 : 0;
        if (m.row === -1) {
          return { grid: s.grid, turn: opp, passCount: s.passCount + 1 };
        }
        const ng = applyMove(s.grid, s.turn, m.row, m.col);
        return { grid: ng, turn: opp, passCount: 0 };
      },
      isTerminal(s) {
        if (s.passCount >= 2) return true;
        const { black, white } = countDiscs(s.grid);
        if (black + white === s.grid.rows * s.grid.cols) return true;
        return legalMoves(s.grid, 0).length === 0 && legalMoves(s.grid, 1).length === 0;
      },
      evaluate(s) {
        // Bot is always seat 1 (white); maximizing = seat 1's perspective
        return evalFn(s.grid, 1);
      },
      maximizing(s) {
        return s.turn === 1;
      },
    },
  );

  if (!result.move || result.move.row === -1) return null;
  return result.move;
}

export function initialState(seed: number, settings: ReversiSettings): ReversiState {
  const size = 8;
  let grid = Grid.filled<Cell>(size, size, null);
  grid = grid.set({ row: 3, col: 3 }, 1); // white
  grid = grid.set({ row: 3, col: 4 }, 0); // black
  grid = grid.set({ row: 4, col: 3 }, 0); // black
  grid = grid.set({ row: 4, col: 4 }, 1); // white

  return {
    settings,
    grid,
    turn: 0,
    lastPass: false,
    winner: null,
    movesMade: 0,
    blackCount: 2,
    whiteCount: 2,
    rngSeed: seed,
  };
}

function runBotIfNeeded(state: ReversiState): ReversiState {
  let s = state;
  // Run bot while it's seat 1's turn and game not over
  while (s.winner === null && s.turn === 1) {
    const rng = mulberry32(s.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);

    const botLegal = legalMoves(s.grid, 1);
    if (botLegal.length === 0) {
      // Bot must pass
      if (s.lastPass) {
        // Both passed => game over
        const { black, white } = countDiscs(s.grid);
        const { winner } = checkTerminal(s.grid, black, white, false, false);
        s = { ...s, winner, rngSeed: nextSeed };
      } else {
        // Bot passes, switch to human
        s = { ...s, turn: 0, lastPass: true, rngSeed: nextSeed };
      }
      break;
    }

    const move = botMove(s.grid, 1, s.settings.botDifficulty, mulberry32(s.rngSeed));
    if (!move) {
      s = { ...s, turn: 0, lastPass: false, rngSeed: nextSeed };
      break;
    }

    const newGrid = applyMove(s.grid, 1, move.row, move.col);
    const { black, white } = countDiscs(newGrid);
    const humanLegal = legalMoves(newGrid, 0);
    const botLegal2 = legalMoves(newGrid, 1);
    const { winner } = checkTerminal(newGrid, black, white, humanLegal.length > 0, botLegal2.length > 0);

    s = {
      ...s,
      grid: newGrid,
      turn: 0,
      lastPass: false,
      movesMade: s.movesMade + 1,
      blackCount: black,
      whiteCount: white,
      winner,
      rngSeed: nextSeed,
    };
    break; // only one bot move per call
  }
  return s;
}

export function reducer(state: ReversiState, action: ReversiAction): ReversiState {
  if (state.winner !== null) return state;

  if (action.type === "pass") {
    const myMoves = legalMoves(state.grid, state.turn);
    if (myMoves.length > 0) return state; // can't pass if you have moves
    if (state.lastPass) {
      const { black, white } = countDiscs(state.grid);
      const { winner } = checkTerminal(state.grid, black, white, false, false);
      return { ...state, winner };
    }
    const opp: 0 | 1 = state.turn === 0 ? 1 : 0;
    let next: ReversiState = { ...state, turn: opp, lastPass: true };
    next = runBotIfNeeded(next);
    return next;
  }

  if (action.type === "place") {
    const { row, col } = action.at;
    if (!state.grid.inBounds({ row, col })) return state;
    if (state.grid.get({ row, col }) !== null) return state;
    const flips = flipsFor(state.grid, state.turn, row, col);
    if (flips.length === 0) return state; // illegal

    const newGrid = applyMove(state.grid, state.turn, row, col);
    const { black, white } = countDiscs(newGrid);
    const opp: 0 | 1 = state.turn === 0 ? 1 : 0;
    const oppLegal = legalMoves(newGrid, opp);
    const myLegal = legalMoves(newGrid, state.turn);
    const { winner } = checkTerminal(newGrid, black, white, myLegal.length > 0, oppLegal.length > 0);

    let next: ReversiState = {
      ...state,
      grid: newGrid,
      turn: opp,
      lastPass: false,
      movesMade: state.movesMade + 1,
      blackCount: black,
      whiteCount: white,
      winner,
    };

    if (winner !== null) return next;

    // If opponent has no legal moves
    if (oppLegal.length === 0) {
      if (myLegal.length === 0) {
        // Both have no moves => game over
        const { winner: w2 } = checkTerminal(newGrid, black, white, false, false);
        return { ...next, winner: w2 };
      }
      // Opponent passes, turn stays with current seat
      next = { ...next, turn: state.turn, lastPass: true };
      return next;
    }

    // Bot's turn
    next = runBotIfNeeded(next);
    return next;
  }

  return state;
}

export function isTerminal(state: ReversiState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === 0) return { score: 100 + (state.blackCount - state.whiteCount) * 5 };
  if (state.winner === "draw") return { score: 50 };
  return { score: Math.max(0, state.blackCount - 10) };
}
