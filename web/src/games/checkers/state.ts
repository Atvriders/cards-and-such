import type { Coord } from "../../engines/grid/index.js";
import { Grid } from "../../engines/grid/index.js";
import { minimax } from "../../engines/grid/minimax.js";

export interface Piece {
  color: "red" | "black";
  king: boolean;
}

export interface CheckersSettings {
  mandatoryCapture: boolean;
  // TODO(plan-d): implement flyingKings (kings slide multiple squares in any direction)
  opponent: "bot" | "hot-seat";
  botDepth: "2" | "3" | "4";
}

export interface CheckersState {
  settings: CheckersSettings;
  rngSeed: number;
  grid: Grid<Piece | null>;
  turn: "red" | "black";
  selected: Coord | null;
  mustContinueFrom: Coord | null;
  winner: "red" | "black" | null;
  movesWithoutCapture: number;
}

export type CheckersAction = { type: "move"; from: Coord; to: Coord };

// ----- Initialization -----

export function initialState(seed: number, settings: CheckersSettings): CheckersState {
  // 8x8 board. Dark squares: (row+col) % 2 === 1
  const cells: (Piece | null)[] = new Array(64).fill(null);

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        if (row < 3) {
          cells[row * 8 + col] = { color: "black", king: false };
        } else if (row > 4) {
          cells[row * 8 + col] = { color: "red", king: false };
        }
      }
    }
  }

  return {
    settings,
    rngSeed: seed,
    grid: new Grid<Piece | null>(8, 8, cells),
    turn: "red",
    selected: null,
    mustContinueFrom: null,
    winner: null,
    movesWithoutCapture: 0,
  };
}

// ----- Move generation -----

export interface CheckersMove {
  from: Coord;
  to: Coord;
  captures: Coord[]; // squares whose pieces are removed
}

/** Get diagonal directions for a piece */
function getDirs(piece: Piece): Array<[number, number]> {
  if (piece.king) {
    return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  }
  // Red moves up (decreasing row), black moves down (increasing row)
  return piece.color === "red"
    ? [[-1, -1], [-1, 1]]
    : [[1, -1], [1, 1]];
}

function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

/** Find all jump chains from a given square */
function findJumps(
  grid: Grid<Piece | null>,
  from: Coord,
  piece: Piece,
  alreadyCaptured: Set<string>,
): CheckersMove[] {
  const dirs = getDirs(piece);
  const results: CheckersMove[] = [];

  for (const [dr, dc] of dirs) {
    const midR = from.row + dr;
    const midC = from.col + dc;
    const landR = from.row + dr * 2;
    const landC = from.col + dc * 2;

    if (!inBounds(midR, midC) || !inBounds(landR, landC)) continue;

    const mid = { row: midR, col: midC };
    const land = { row: landR, col: landC };
    const midKey = `${midR},${midC}`;

    const midPiece = grid.get(mid);
    const landPiece = grid.get(land);

    if (
      midPiece !== null &&
      midPiece.color !== piece.color &&
      landPiece === null &&
      !alreadyCaptured.has(midKey)
    ) {
      // Valid jump — check if we become a king on landing (for further chain direction)
      const becomesKing =
        !piece.king &&
        ((piece.color === "red" && landR === 0) || (piece.color === "black" && landR === 7));

      const movedPiece: Piece = becomesKing ? { ...piece, king: true } : piece;

      // Simulate jump: remove captured piece, place piece at landing
      let newGrid = grid.set(mid, null).set(from, null).set(land, movedPiece);
      const newCaptured = new Set(alreadyCaptured);
      newCaptured.add(midKey);

      // If piece just became a king, no further chaining (standard American rules)
      let chains: CheckersMove[] = [];
      if (!becomesKing) {
        chains = findJumps(newGrid, land, movedPiece, newCaptured);
      }

      if (chains.length === 0) {
        results.push({ from, to: land, captures: [mid] });
      } else {
        // Extend each chain
        for (const chain of chains) {
          results.push({
            from,
            to: chain.to,
            captures: [mid, ...chain.captures],
          });
        }
      }
    }
  }

  return results;
}

export function getLegalMoves(
  grid: Grid<Piece | null>,
  color: "red" | "black",
  mandatoryCapture: boolean,
  mustContinueFrom: Coord | null,
): CheckersMove[] {
  const allMoves: CheckersMove[] = [];
  const jumpMoves: CheckersMove[] = [];

  const sources: Coord[] = mustContinueFrom
    ? [mustContinueFrom]
    : [...grid.coords()].filter((c) => {
        const p = grid.get(c);
        return p !== null && p.color === color;
      });

  for (const from of sources) {
    const piece = grid.get(from);
    if (!piece || piece.color !== color) continue;

    // Jumps
    const jumps = findJumps(grid, from, piece, new Set());
    jumpMoves.push(...jumps);

    // Simple moves (only if not in mid-chain)
    if (!mustContinueFrom) {
      const dirs = getDirs(piece);
      for (const [dr, dc] of dirs) {
        const toR = from.row + dr;
        const toC = from.col + dc;
        if (!inBounds(toR, toC)) continue;
        const to = { row: toR, col: toC };
        if (grid.get(to) === null) {
          allMoves.push({ from, to, captures: [] });
        }
      }
    }
  }

  if (mandatoryCapture && jumpMoves.length > 0) return jumpMoves;
  if (jumpMoves.length > 0) allMoves.push(...jumpMoves);
  return allMoves;
}

// ----- Apply a move -----

function applyCheckerMove(
  state: CheckersState,
  move: CheckersMove,
): CheckersState {
  let grid = state.grid;
  const piece = grid.get(move.from)!;

  // Remove captured pieces
  for (const cap of move.captures) {
    grid = grid.set(cap, null);
  }

  // Move piece
  grid = grid.set(move.from, null);

  // King promotion
  const becomesKing =
    !piece.king &&
    ((piece.color === "red" && move.to.row === 0) ||
      (piece.color === "black" && move.to.row === 7));
  const movedPiece: Piece = becomesKing ? { ...piece, king: true } : piece;
  grid = grid.set(move.to, movedPiece);

  const isCapture = move.captures.length > 0;
  const newMovesWithoutCapture = isCapture ? 0 : state.movesWithoutCapture + 1;

  // Check for continuation jumps (if this was a capture and piece isn't newly kinged)
  if (isCapture && !becomesKing) {
    const continuationJumps = findJumps(grid, move.to, movedPiece, new Set());
    if (continuationJumps.length > 0) {
      return {
        ...state,
        grid,
        mustContinueFrom: move.to,
        movesWithoutCapture: newMovesWithoutCapture,
      };
    }
  }

  // Flip turn
  const nextTurn = state.turn === "red" ? "black" : "red";

  // Check win: opponent has no pieces or no moves
  const opponentMoves = getLegalMoves(grid, nextTurn, state.settings.mandatoryCapture, null);
  const winner = opponentMoves.length === 0 ? state.turn : null;

  return {
    ...state,
    grid,
    turn: nextTurn,
    selected: null,
    mustContinueFrom: null,
    winner,
    movesWithoutCapture: newMovesWithoutCapture,
  };
}

// ----- Bot -----

interface BotState {
  grid: Grid<Piece | null>;
  turn: "red" | "black";
  mustContinueFrom: Coord | null;
  settings: CheckersSettings;
}

function countPieces(grid: Grid<Piece | null>, color: "red" | "black"): number {
  let count = 0;
  for (const c of grid.coords()) {
    const p = grid.get(c);
    if (p && p.color === color) count++;
  }
  return count;
}

function countKings(grid: Grid<Piece | null>, color: "red" | "black"): number {
  let count = 0;
  for (const c of grid.coords()) {
    const p = grid.get(c);
    if (p && p.color === color && p.king) count++;
  }
  return count;
}

function advancementScore(grid: Grid<Piece | null>, color: "red" | "black"): number {
  let score = 0;
  for (const c of grid.coords()) {
    const p = grid.get(c);
    if (p && p.color === color && !p.king) {
      // Red advances toward row 0, black toward row 7
      score += color === "red" ? (7 - c.row) : c.row;
    }
  }
  return score;
}

function centerControl(grid: Grid<Piece | null>, color: "red" | "black"): number {
  const CENTER = [{ row: 3, col: 3 }, { row: 3, col: 4 }, { row: 4, col: 3 }, { row: 4, col: 4 }];
  let score = 0;
  for (const c of CENTER) {
    const p = grid.get(c);
    if (p && p.color === color) score++;
  }
  return score;
}

function evaluateBot(grid: Grid<Piece | null>): number {
  // Black is maximizing
  const blackPieces = countPieces(grid, "black");
  const redPieces = countPieces(grid, "red");
  const blackKings = countKings(grid, "black");
  const redKings = countKings(grid, "red");
  const blackAdv = advancementScore(grid, "black");
  const redAdv = advancementScore(grid, "red");
  const blackCenter = centerControl(grid, "black");
  const redCenter = centerControl(grid, "red");

  return (blackPieces - redPieces) * 100
    + (blackKings - redKings) * 50
    + (blackAdv - redAdv) * 5
    + (blackCenter - redCenter) * 2;
}

function applyBotCheckerMove(grid: Grid<Piece | null>, move: CheckersMove, turn: "red" | "black"): Grid<Piece | null> {
  const piece = grid.get(move.from)!;
  let g = grid;
  for (const cap of move.captures) {
    g = g.set(cap, null);
  }
  g = g.set(move.from, null);
  const becomesKing =
    !piece.king &&
    ((piece.color === "red" && move.to.row === 0) ||
      (piece.color === "black" && move.to.row === 7));
  g = g.set(move.to, becomesKing ? { ...piece, king: true } : piece);
  return g;
}

function runBot(state: CheckersState): CheckersState {
  const depth = parseInt(state.settings.botDepth, 10);

  const result = minimax<BotState, CheckersMove>(
    {
      grid: state.grid,
      turn: state.turn,
      mustContinueFrom: null,
      settings: state.settings,
    },
    {
      depth,
      moves(s) {
        return getLegalMoves(s.grid, s.turn, s.settings.mandatoryCapture, s.mustContinueFrom);
      },
      apply(s, move) {
        const newGrid = applyBotCheckerMove(s.grid, move, s.turn);
        const piece = newGrid.get(move.to);
        const isCapture = move.captures.length > 0;
        const becomesKing = piece?.king ?? false;

        // Check continuation
        if (isCapture && !becomesKing && piece) {
          const contJumps = findJumps(newGrid, move.to, piece, new Set());
          if (contJumps.length > 0) {
            return { ...s, grid: newGrid, mustContinueFrom: move.to };
          }
        }

        return {
          ...s,
          grid: newGrid,
          turn: s.turn === "red" ? "black" : "red",
          mustContinueFrom: null,
        };
      },
      isTerminal(s) {
        const moves = getLegalMoves(s.grid, s.turn, s.settings.mandatoryCapture, s.mustContinueFrom);
        return moves.length === 0;
      },
      evaluate(s) {
        return evaluateBot(s.grid);
      },
      maximizing(s) {
        return s.turn === "black";
      },
    },
  );

  if (!result.move) return state;

  // Apply the bot move through the real reducer logic
  return applyCheckerMove(state, result.move);
}

// ----- Reducer -----

export function reducer(state: CheckersState, action: CheckersAction): CheckersState {
  if (action.type !== "move") return state;
  if (state.winner !== null) return state;

  const { from, to } = action;

  // Must continue from a specific square?
  if (state.mustContinueFrom) {
    if (from.row !== state.mustContinueFrom.row || from.col !== state.mustContinueFrom.col) {
      return state;
    }
  }

  // Validate piece belongs to current player
  const piece = state.grid.get(from);
  if (!piece || piece.color !== state.turn) return state;

  // Find matching legal move
  const legalMoves = getLegalMoves(
    state.grid,
    state.turn,
    state.settings.mandatoryCapture,
    state.mustContinueFrom,
  );

  const match = legalMoves.find(
    (m) =>
      m.from.row === from.row &&
      m.from.col === from.col &&
      m.to.row === to.row &&
      m.to.col === to.col,
  );

  if (!match) return state;

  let next = applyCheckerMove(state, match);

  // If game over, return
  if (next.winner !== null) return next;

  // If still in chain, don't run bot
  if (next.mustContinueFrom !== null) return next;

  // Bot's turn
  if (state.settings.opponent === "bot" && next.turn === "black" && next.winner === null) {
    next = runBot(next);
    // If bot wins
    if (next.winner !== null) return next;
    // Bot might also chain - keep running until chain done
    while (next.mustContinueFrom !== null) {
      next = runBot(next);
    }
  }

  return next;
}

// ----- isTerminal -----

export function isTerminal(state: CheckersState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.settings.opponent !== "bot") return { score: 0 };
  if (state.winner === "red") {
    const remaining = countPieces(state.grid, "red");
    return { score: remaining * 10 };
  }
  return { score: 0 }; // loss
}
