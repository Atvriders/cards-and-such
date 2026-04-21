import type { Coord } from "../../engines/grid/index.js";
import { Grid, findWinningLine } from "../../engines/grid/index.js";
import { minimax } from "../../engines/grid/minimax.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface TTTSettings {
  boardSize: "3" | "4" | "5";
  winLength: "3" | "4" | "5";
  opponent: "bot" | "hot-seat";
  botStrength: "easy" | "hard";
}

export interface TTTState {
  settings: TTTSettings;
  rngSeed: number;
  grid: Grid<"X" | "O" | null>;
  turn: "X" | "O";
  winner: "X" | "O" | "draw" | null;
  winningLine: Coord[] | null;
}

export type TTTAction = { type: "place"; at: Coord };

export function initialState(seed: number, settings: TTTSettings): TTTState {
  const size = parseInt(settings.boardSize, 10);
  return {
    settings,
    rngSeed: seed,
    grid: Grid.filled<"X" | "O" | null>(size, size, null),
    turn: "X",
    winner: null,
    winningLine: null,
  };
}

function checkWinner(
  grid: Grid<"X" | "O" | null>,
  winLength: number,
): { winner: "X" | "O" | "draw" | null; winningLine: Coord[] | null } {
  const line = findWinningLine(
    grid,
    winLength,
    (v) => v !== null,
    (a, b) => a === b,
  );
  if (line) {
    const val = grid.get(line[0]!);
    return { winner: val as "X" | "O", winningLine: line };
  }
  // Check draw — board full?
  const full = [...grid.coords()].every((c) => grid.get(c) !== null);
  if (full) return { winner: "draw", winningLine: null };
  return { winner: null, winningLine: null };
}

function emptyCells(grid: Grid<"X" | "O" | null>): Coord[] {
  return [...grid.coords()].filter((c) => grid.get(c) === null);
}

function randomMove(grid: Grid<"X" | "O" | null>, rng: () => number): Coord | null {
  const cells = emptyCells(grid);
  if (cells.length === 0) return null;
  return cells[Math.floor(rng() * cells.length)]!;
}

interface BotSearchState {
  grid: Grid<"X" | "O" | null>;
  turn: "X" | "O";
}

function minimaxMove(
  grid: Grid<"X" | "O" | null>,
  turn: "X" | "O",
  winLength: number,
): Coord | null {
  const result = minimax<BotSearchState, Coord>(
    { grid, turn },
    {
      depth: 9,
      moves(s) {
        const { winner } = checkWinner(s.grid, winLength);
        if (winner !== null) return [];
        return emptyCells(s.grid);
      },
      apply(s, move) {
        return {
          grid: s.grid.set(move, s.turn),
          turn: s.turn === "X" ? "O" : "X",
        };
      },
      isTerminal(s) {
        return checkWinner(s.grid, winLength).winner !== null;
      },
      evaluate(s) {
        const { winner } = checkWinner(s.grid, winLength);
        if (winner === "O") return 1000;
        if (winner === "X") return -1000;
        return 0;
      },
      maximizing(s) {
        // Bot is O, X is human
        return s.turn === "O";
      },
    },
  );
  return result.move;
}

function applyBotMove(state: TTTState): TTTState {
  const { settings, grid, rngSeed } = state;
  const winLength = parseInt(settings.winLength, 10);
  const size = grid.rows;
  const rng = mulberry32(rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  let at: Coord | null;
  if (settings.botStrength === "hard" && size === 3) {
    at = minimaxMove(grid, "O", winLength);
  } else {
    at = randomMove(grid, mulberry32(rngSeed));
  }

  if (!at) return { ...state, rngSeed: nextSeed };

  const nextGrid = grid.set(at, "O");
  const { winner, winningLine } = checkWinner(nextGrid, winLength);
  return {
    ...state,
    rngSeed: nextSeed,
    grid: nextGrid,
    turn: "X",
    winner,
    winningLine,
  };
}

export function reducer(state: TTTState, action: TTTAction): TTTState {
  if (action.type !== "place") return state;
  if (state.winner !== null) return state; // game over

  const { at } = action;
  if (!state.grid.inBounds(at)) return state;
  if (state.grid.get(at) !== null) return state; // occupied

  const winLength = parseInt(state.settings.winLength, 10);
  const nextGrid = state.grid.set(at, state.turn);
  const { winner, winningLine } = checkWinner(nextGrid, winLength);

  let next: TTTState = {
    ...state,
    grid: nextGrid,
    turn: state.turn === "X" ? "O" : "X",
    winner,
    winningLine,
  };

  // If game over after player move, no bot
  if (winner !== null) return next;

  // Bot move
  if (state.settings.opponent === "bot" && next.turn === "O") {
    next = applyBotMove(next);
  }

  return next;
}

export function isTerminal(state: TTTState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.settings.opponent !== "bot") return { score: 0 };
  if (state.winner === "X") return { score: 10 };
  if (state.winner === "draw") return { score: 5 };
  return { score: 0 }; // loss
}
