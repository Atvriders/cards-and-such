// International Draughts (10×10)
// - 20 pieces per side on dark squares of first 4 rows
// - Men capture forward OR backward
// - Flying kings (slide multiple squares diagonally)
// - Mandatory maximum-capture rule

import type { Coord } from "../../engines/grid/index.js";
import { Grid } from "../../engines/grid/index.js";
import { minimax } from "../../engines/grid/minimax.js";

export interface IDPiece {
  color: "white" | "black";
  king: boolean;
}

export interface IDSettings {
  opponent: "easy" | "medium" | "hard";
}

export interface IDState {
  settings: IDSettings;
  rngSeed: number;
  grid: Grid<IDPiece | null>;
  turn: "white" | "black";
  selected: Coord | null;
  mustContinueFrom: Coord | null;
  winner: "white" | "black" | null;
}

export type IDAction = { type: "move"; from: Coord; to: Coord };

function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < 10 && c >= 0 && c < 10;
}

export interface IDMove {
  from: Coord;
  to: Coord;
  captures: Coord[];
}

function findJumpsFlying(
  grid: Grid<IDPiece | null>,
  from: Coord,
  piece: IDPiece,
  alreadyCaptured: Set<string>,
): IDMove[] {
  const results: IDMove[] = [];
  const dirs: Array<[number, number]> = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

  if (piece.king) {
    // Flying king: slide any number, capture any enemy along way, land any square beyond
    for (const [dr, dc] of dirs) {
      let r = from.row + dr;
      let c = from.col + dc;
      let capturedCoord: Coord | null = null;

      while (inBounds(r, c)) {
        const at = grid.get({ row: r, col: c });
        if (at === null) {
          if (capturedCoord !== null) {
            // We've passed a captured piece; this is a valid landing square
            const capKey = `${capturedCoord.row},${capturedCoord.col}`;
            const land: Coord = { row: r, col: c };
            // Try extending chain from here
            const newCaptured = new Set(alreadyCaptured);
            newCaptured.add(capKey);

            // Simulate: remove captured piece, place piece at landing
            let newGrid = grid.set(capturedCoord, null).set(from, null).set(land, piece);
            const chains = findJumpsFlying(newGrid, land, piece, newCaptured);

            if (chains.length === 0) {
              results.push({ from, to: land, captures: [capturedCoord] });
            } else {
              for (const chain of chains) {
                results.push({ from, to: chain.to, captures: [capturedCoord, ...chain.captures] });
              }
            }
          }
          r += dr;
          c += dc;
        } else if (at.color !== piece.color) {
          const key = `${r},${c}`;
          if (alreadyCaptured.has(key)) break; // already captured this piece
          if (capturedCoord !== null) break; // can't jump two pieces in a row
          capturedCoord = { row: r, col: c };
          r += dr;
          c += dc;
        } else {
          break; // own piece
        }
      }
    }
  } else {
    // Men: can capture forward and backward, jump exactly 2 squares
    for (const [dr, dc] of dirs) {
      const midR = from.row + dr;
      const midC = from.col + dc;
      const landR = from.row + dr * 2;
      const landC = from.col + dc * 2;

      if (!inBounds(midR, midC) || !inBounds(landR, landC)) continue;

      const mid: Coord = { row: midR, col: midC };
      const land: Coord = { row: landR, col: landC };
      const midKey = `${midR},${midC}`;

      const midPiece = grid.get(mid);
      const landPiece = grid.get(land);

      if (
        midPiece !== null &&
        midPiece.color !== piece.color &&
        landPiece === null &&
        !alreadyCaptured.has(midKey)
      ) {
        const becomesKing =
          !piece.king &&
          ((piece.color === "white" && landR === 0) || (piece.color === "black" && landR === 9));

        const movedPiece: IDPiece = becomesKing ? { ...piece, king: true } : piece;
        let newGrid = grid.set(mid, null).set(from, null).set(land, movedPiece);
        const newCaptured = new Set(alreadyCaptured);
        newCaptured.add(midKey);

        let chains: IDMove[] = [];
        if (!becomesKing) {
          chains = findJumpsFlying(newGrid, land, movedPiece, newCaptured);
        }

        if (chains.length === 0) {
          results.push({ from, to: land, captures: [mid] });
        } else {
          for (const chain of chains) {
            results.push({ from, to: chain.to, captures: [mid, ...chain.captures] });
          }
        }
      }
    }
  }

  return results;
}

export function getLegalMoves(
  grid: Grid<IDPiece | null>,
  color: "white" | "black",
  mustContinueFrom: Coord | null,
): IDMove[] {
  const allMoves: IDMove[] = [];
  const jumpMoves: IDMove[] = [];

  const sources: Coord[] = mustContinueFrom
    ? [mustContinueFrom]
    : [...grid.coords()].filter((c) => {
        const p = grid.get(c);
        return p !== null && p.color === color;
      });

  for (const from of sources) {
    const piece = grid.get(from);
    if (!piece || piece.color !== color) continue;

    const jumps = findJumpsFlying(grid, from, piece, new Set());
    jumpMoves.push(...jumps);

    if (!mustContinueFrom) {
      const dirs: Array<[number, number]> = piece.king
        ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
        : color === "white"
          ? [[-1, -1], [-1, 1]]
          : [[1, -1], [1, 1]];

      if (piece.king) {
        // Flying king slides
        for (const [dr, dc] of dirs) {
          let r = from.row + dr;
          let c = from.col + dc;
          while (inBounds(r, c) && grid.get({ row: r, col: c }) === null) {
            allMoves.push({ from, to: { row: r, col: c }, captures: [] });
            r += dr;
            c += dc;
          }
        }
      } else {
        for (const [dr, dc] of dirs) {
          const r = from.row + dr;
          const c = from.col + dc;
          if (!inBounds(r, c)) continue;
          if (grid.get({ row: r, col: c }) === null) {
            allMoves.push({ from, to: { row: r, col: c }, captures: [] });
          }
        }
      }
    }
  }

  // Mandatory maximum capture
  if (jumpMoves.length > 0) {
    const maxCaptures = Math.max(...jumpMoves.map((m) => m.captures.length));
    return jumpMoves.filter((m) => m.captures.length === maxCaptures);
  }
  return allMoves;
}

function applyIDMove(state: IDState, move: IDMove): IDState {
  let grid = state.grid;
  const piece = grid.get(move.from)!;

  for (const cap of move.captures) {
    grid = grid.set(cap, null);
  }
  grid = grid.set(move.from, null);

  const becomesKing =
    !piece.king &&
    ((piece.color === "white" && move.to.row === 0) || (piece.color === "black" && move.to.row === 9));
  const movedPiece: IDPiece = becomesKing ? { ...piece, king: true } : piece;
  grid = grid.set(move.to, movedPiece);

  const isCapture = move.captures.length > 0;

  // Check for continuation
  if (isCapture && !becomesKing) {
    const cont = findJumpsFlying(grid, move.to, movedPiece, new Set());
    // Max capture rule: must continue if there are continuation jumps
    if (cont.length > 0) {
      return { ...state, grid, mustContinueFrom: move.to };
    }
  }

  const nextTurn: "white" | "black" = state.turn === "white" ? "black" : "white";
  const opponentMoves = getLegalMoves(grid, nextTurn, null);
  const winner = opponentMoves.length === 0 ? state.turn : null;

  return {
    ...state,
    grid,
    turn: nextTurn,
    selected: null,
    mustContinueFrom: null,
    winner,
  };
}

interface BotIDState {
  grid: Grid<IDPiece | null>;
  turn: "white" | "black";
  mustContinueFrom: Coord | null;
}

function evalID(grid: Grid<IDPiece | null>): number {
  let score = 0;
  for (const c of grid.coords()) {
    const p = grid.get(c);
    if (!p) continue;
    const val = p.king ? 300 : 100;
    // Advancement
    const adv = p.color === "white"
      ? (9 - c.row) * 3
      : c.row * 3;
    score += p.color === "black" ? (val + adv) : -(val + adv);
  }
  return score;
}

function runBotID(state: IDState): IDState {
  const depth = state.settings.opponent === "easy" ? 2 : state.settings.opponent === "medium" ? 3 : 4;

  const result = minimax<BotIDState, IDMove>(
    { grid: state.grid, turn: state.turn, mustContinueFrom: null },
    {
      depth,
      moves(s) { return getLegalMoves(s.grid, s.turn, s.mustContinueFrom); },
      apply(s, move) {
        let grid = s.grid;
        const piece = grid.get(move.from)!;
        for (const cap of move.captures) { grid = grid.set(cap, null); }
        grid = grid.set(move.from, null);
        const becomesKing = !piece.king && (
          (piece.color === "white" && move.to.row === 0) || (piece.color === "black" && move.to.row === 9)
        );
        const movedPiece: IDPiece = becomesKing ? { ...piece, king: true } : piece;
        grid = grid.set(move.to, movedPiece);

        if (move.captures.length > 0 && !becomesKing) {
          const cont = findJumpsFlying(grid, move.to, movedPiece, new Set());
          if (cont.length > 0) return { ...s, grid, mustContinueFrom: move.to };
        }
        return { grid, turn: s.turn === "white" ? "black" : "white", mustContinueFrom: null };
      },
      isTerminal(s) { return getLegalMoves(s.grid, s.turn, s.mustContinueFrom).length === 0; },
      evaluate(s) { return evalID(s.grid); },
      maximizing(s) { return s.turn === "black"; },
    },
  );

  if (!result.move) return state;
  return applyIDMove(state, result.move);
}

export function initialState(seed: number, settings: IDSettings): IDState {
  const cells: (IDPiece | null)[] = new Array(100).fill(null);
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      if ((r + c) % 2 === 1) {
        if (r < 4) cells[r * 10 + c] = { color: "black", king: false };
        else if (r >= 6) cells[r * 10 + c] = { color: "white", king: false };
      }
    }
  }
  return {
    settings,
    rngSeed: seed,
    grid: new Grid<IDPiece | null>(10, 10, cells),
    turn: "white",
    selected: null,
    mustContinueFrom: null,
    winner: null,
  };
}

export function reducer(state: IDState, action: IDAction): IDState {
  if (action.type !== "move") return state;
  if (state.winner !== null) return state;

  const { from, to } = action;

  if (state.mustContinueFrom) {
    if (from.row !== state.mustContinueFrom.row || from.col !== state.mustContinueFrom.col) return state;
  }

  const piece = state.grid.get(from);
  if (!piece || piece.color !== state.turn) return state;

  const legalMovesArr = getLegalMoves(state.grid, state.turn, state.mustContinueFrom);
  const match = legalMovesArr.find(
    (m) => m.from.row === from.row && m.from.col === from.col && m.to.row === to.row && m.to.col === to.col,
  );
  if (!match) return state;

  let next = applyIDMove(state, match);
  if (next.winner !== null) return next;
  if (next.mustContinueFrom !== null) return next;

  if (next.turn === "black" && next.winner === null) {
    next = runBotID(next);
    while (next.mustContinueFrom !== null && next.winner === null) {
      next = runBotID(next);
    }
  }

  return next;
}

export function isTerminal(state: IDState): { score: number } | null {
  if (state.winner === null) return null;
  return state.winner === "white" ? { score: 100 } : { score: 0 };
}
