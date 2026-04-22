import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Blokus Duo: 14×14 board, 2 players, 21 polyomino pieces each.
// First piece must cover the player's starting cell.
// Subsequent pieces must touch own pieces corner-to-corner (diagonal)
// and NEVER touch own pieces edge-to-edge.
// Player who cannot place loses. Winner has fewest remaining squares.

export type Cell = 0 | 1 | null;

export interface BlokusDuoSettings {
  dummy?: string;
}

// A piece is defined as an array of [row, col] offsets from origin
export interface Piece {
  id: number;
  name: string;
  squares: ReadonlyArray<readonly [number, number]>;
}

// All 21 standard Blokus pieces (monomino through pentominos)
// We store all rotations/reflections; the reducer tries all
export const PIECES: readonly Piece[] = [
  // 1
  { id: 0, name: "I1", squares: [[0, 0]] },
  // 2
  { id: 1, name: "I2", squares: [[0, 0], [0, 1]] },
  // 3
  { id: 2, name: "I3", squares: [[0, 0], [0, 1], [0, 2]] },
  { id: 3, name: "L3", squares: [[0, 0], [1, 0], [1, 1]] },
  // 4
  { id: 4, name: "I4", squares: [[0, 0], [0, 1], [0, 2], [0, 3]] },
  { id: 5, name: "L4", squares: [[0, 0], [1, 0], [2, 0], [2, 1]] },
  { id: 6, name: "T4", squares: [[0, 0], [0, 1], [0, 2], [1, 1]] },
  { id: 7, name: "O4", squares: [[0, 0], [0, 1], [1, 0], [1, 1]] },
  { id: 8, name: "S4", squares: [[0, 1], [0, 2], [1, 0], [1, 1]] },
  // 5
  { id: 9,  name: "I5", squares: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]] },
  { id: 10, name: "L5", squares: [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1]] },
  { id: 11, name: "Y5", squares: [[0, 1], [1, 0], [1, 1], [2, 1], [3, 1]] },
  { id: 12, name: "N5", squares: [[0, 1], [1, 0], [1, 1], [2, 0], [3, 0]] },
  { id: 13, name: "P5", squares: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0]] },
  { id: 14, name: "T5", squares: [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1]] },
  { id: 15, name: "U5", squares: [[0, 0], [0, 2], [1, 0], [1, 1], [1, 2]] },
  { id: 16, name: "V5", squares: [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]] },
  { id: 17, name: "W5", squares: [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2]] },
  { id: 18, name: "X5", squares: [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]] },
  { id: 19, name: "F5", squares: [[0, 1], [0, 2], [1, 0], [1, 1], [2, 1]] },
  { id: 20, name: "Z5", squares: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2]] },
] as const;

export const BOARD_SIZE = 14;
const P0_START: readonly [number, number] = [4, 4]; // bottom-left quadrant
const P1_START: readonly [number, number] = [9, 9]; // top-right quadrant

// Rotate a piece 90° CW
function rotateCW(squares: ReadonlyArray<readonly [number, number]>): Array<[number, number]> {
  return squares.map(([r, c]) => [c, -r] as [number, number]);
}

// Reflect a piece horizontally
function reflectH(squares: ReadonlyArray<readonly [number, number]>): Array<[number, number]> {
  return squares.map(([r, c]) => [r, -c] as [number, number]);
}

// Normalise: translate so minimum row=0, minimum col=0
function normalise(squares: ReadonlyArray<readonly [number, number]>): Array<[number, number]> {
  const minR = Math.min(...squares.map(([r]) => r));
  const minC = Math.min(...squares.map(([, c]) => c));
  const sorted = squares.map(([r, c]) => [r - minR, c - minC] as [number, number]);
  sorted.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  return sorted;
}

function squaresToKey(squares: ReadonlyArray<readonly [number, number]>): string {
  return normalise(squares).map(([r, c]) => `${r},${c}`).join("|");
}

// All unique orientations of a piece
export function pieceOrientations(piece: Piece): Array<Array<[number, number]>> {
  const seen = new Set<string>();
  const result: Array<Array<[number, number]>> = [];
  let cur: Array<[number, number]> = [...piece.squares.map((s) => [...s] as [number, number])];
  for (let rot = 0; rot < 4; rot++) {
    for (const ref of [cur, reflectH(cur)]) {
      const key = squaresToKey(ref);
      if (!seen.has(key)) {
        seen.add(key);
        result.push(normalise(ref));
      }
    }
    cur = rotateCW(cur);
  }
  return result;
}

export interface PlacedPiece {
  pieceId: number;
  row: number; // top-left origin row on board
  col: number;
  orientation: Array<[number, number]>;
}

export interface BlokusDuoState {
  settings: BlokusDuoSettings;
  board: readonly Cell[]; // BOARD_SIZE × BOARD_SIZE
  turn: 0 | 1;
  // Which piece IDs remain for each player
  remaining: readonly [readonly number[], readonly number[]];
  // Whether each player has placed at least one piece
  hasPlaced: readonly [boolean, boolean];
  winner: 0 | 1 | "draw" | null;
  // UI: selected piece id and orientation index for human
  selectedPiece: number | null;
  selectedOriIdx: number;
  rngSeed: number;
  movesMade: number;
}

export type BlokusDuoAction =
  | { type: "selectPiece"; pieceId: number }
  | { type: "rotatePiece" }
  | { type: "placePiece"; row: number; col: number };

function getCell(board: readonly Cell[], row: number, col: number): Cell {
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return null;
  return board[row * BOARD_SIZE + col] ?? null;
}

function setCell(board: readonly Cell[], row: number, col: number, val: Cell): Cell[] {
  const nb = [...board];
  nb[row * BOARD_SIZE + col] = val;
  return nb;
}

// Check if placing an orientation at (row, col) is valid for player
function canPlace(
  board: readonly Cell[],
  orientation: Array<[number, number]>,
  row: number,
  col: number,
  player: 0 | 1,
  hasPlaced: boolean,
): boolean {
  const startCell = player === 0 ? P0_START : P1_START;
  const coversStart = !hasPlaced;

  let touchesStart = false;
  let touchesCorner = false;

  for (const [dr, dc] of orientation) {
    const r = row + dr;
    const c = col + dc;
    // Must be on board
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return false;
    // Must be empty
    if (getCell(board, r, c) !== null) return false;
    // Must not touch own pieces edge-to-edge
    const edgeNeighbors = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
    for (const [nr, nc] of edgeNeighbors) {
      if (getCell(board, nr!, nc!) === player) return false;
    }
    // Check corner adjacency (for subsequent pieces)
    const cornerNeighbors = [[r - 1, c - 1], [r - 1, c + 1], [r + 1, c - 1], [r + 1, c + 1]];
    for (const [nr, nc] of cornerNeighbors) {
      if (getCell(board, nr!, nc!) === player) touchesCorner = true;
    }
    // Check if this square covers start cell
    if (coversStart && r === startCell[0] && c === startCell[1]) touchesStart = true;
  }

  if (!hasPlaced) {
    return touchesStart; // first piece must cover start cell
  }
  return touchesCorner; // subsequent must touch corner
}

// Find all valid placements for a piece orientation
function validPlacements(
  board: readonly Cell[],
  orientation: Array<[number, number]>,
  player: 0 | 1,
  hasPlaced: boolean,
): Array<[number, number]> {
  const results: Array<[number, number]> = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (canPlace(board, orientation, row, col, player, hasPlaced)) {
        results.push([row, col]);
      }
    }
  }
  return results;
}

function applyPlacement(
  board: readonly Cell[],
  orientation: Array<[number, number]>,
  row: number,
  col: number,
  player: 0 | 1,
): Cell[] {
  let nb = [...board];
  for (const [dr, dc] of orientation) {
    nb = setCell(nb, row + dr, col + dc, player);
  }
  return nb;
}

function remainingSquares(remaining: readonly number[]): number {
  return remaining.reduce((sum, id) => sum + PIECES[id]!.squares.length, 0);
}

// Bot: greedy — place largest piece that leaves furthest corners open
function getBotMove(
  board: readonly Cell[],
  remaining: readonly number[],
  hasPlaced: boolean,
): PlacedPiece | null {
  // Sort remaining by size descending
  const sorted = [...remaining].sort((a, b) => PIECES[b]!.squares.length - PIECES[a]!.squares.length);

  for (const pieceId of sorted) {
    const piece = PIECES[pieceId]!;
    const oris = pieceOrientations(piece);
    for (const ori of oris) {
      const placements = validPlacements(board, ori, 1, hasPlaced);
      if (placements.length > 0) {
        // Pick placement closest to center
        let best: [number, number] | null = null;
        let bestDist = Infinity;
        for (const [r, c] of placements) {
          const dist = Math.abs(r - 7) + Math.abs(c - 7);
          if (dist < bestDist) { bestDist = dist; best = [r, c]; }
        }
        if (best) {
          return { pieceId, row: best[0], col: best[1], orientation: ori };
        }
      }
    }
  }
  return null;
}

function runBot(state: BlokusDuoState): BlokusDuoState {
  let s = state;
  while (s.turn === 1 && s.winner === null) {
    const rng = mulberry32(s.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);

    const move = getBotMove(s.board, s.remaining[1], s.hasPlaced[1]);
    if (!move) {
      // Bot can't move — check if human can also move
      const humanCanMove = s.remaining[0].some((id) =>
        pieceOrientations(PIECES[id]!).some(
          (ori) => validPlacements(s.board, ori, 0, s.hasPlaced[0]).length > 0
        )
      );
      if (!humanCanMove) {
        // Both stuck: winner by fewest remaining squares
        const sq0 = remainingSquares(s.remaining[0]);
        const sq1 = remainingSquares(s.remaining[1]);
        const winner: 0 | 1 | "draw" | null = sq0 < sq1 ? 0 : sq1 < sq0 ? 1 : "draw";
        return { ...s, winner, rngSeed: nextSeed };
      }
      // Bot stuck, human continues
      return { ...s, turn: 0, rngSeed: nextSeed };
    }

    const newBoard = applyPlacement(s.board, move.orientation, move.row, move.col, 1);
    const newRemaining: [readonly number[], readonly number[]] = [
      s.remaining[0],
      s.remaining[1].filter((id) => id !== move.pieceId),
    ];
    const newHasPlaced: [boolean, boolean] = [s.hasPlaced[0], true];
    s = {
      ...s,
      board: newBoard,
      remaining: newRemaining,
      hasPlaced: newHasPlaced,
      turn: 0,
      movesMade: s.movesMade + 1,
      rngSeed: nextSeed,
    };
    break;
  }
  return s;
}

export function initialState(seed: number, settings: BlokusDuoSettings): BlokusDuoState {
  const allIds = PIECES.map((p) => p.id);
  return {
    settings,
    board: new Array(BOARD_SIZE * BOARD_SIZE).fill(null),
    turn: 0,
    remaining: [allIds, allIds],
    hasPlaced: [false, false],
    winner: null,
    selectedPiece: null,
    selectedOriIdx: 0,
    rngSeed: seed,
    movesMade: 0,
  };
}

export function reducer(state: BlokusDuoState, action: BlokusDuoAction): BlokusDuoState {
  if (state.winner !== null) return state;
  if (state.turn !== 0) return state;

  if (action.type === "selectPiece") {
    if (!state.remaining[0].includes(action.pieceId)) return state;
    return {
      ...state,
      selectedPiece: action.pieceId,
      selectedOriIdx: 0,
    };
  }

  if (action.type === "rotatePiece") {
    if (state.selectedPiece === null) return state;
    const piece = PIECES[state.selectedPiece];
    if (!piece) return state;
    const oris = pieceOrientations(piece);
    return { ...state, selectedOriIdx: (state.selectedOriIdx + 1) % oris.length };
  }

  if (action.type === "placePiece") {
    if (state.selectedPiece === null) return state;
    const piece = PIECES[state.selectedPiece];
    if (!piece) return state;
    const oris = pieceOrientations(piece);
    const ori = oris[state.selectedOriIdx];
    if (!ori) return state;

    if (!canPlace(state.board, ori, action.row, action.col, 0, state.hasPlaced[0])) {
      return state;
    }

    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);

    const newBoard = applyPlacement(state.board, ori, action.row, action.col, 0);
    const newRemaining: [readonly number[], readonly number[]] = [
      state.remaining[0].filter((id) => id !== state.selectedPiece),
      state.remaining[1],
    ];
    const newHasPlaced: [boolean, boolean] = [true, state.hasPlaced[1]];

    let next: BlokusDuoState = {
      ...state,
      board: newBoard,
      remaining: newRemaining,
      hasPlaced: newHasPlaced,
      turn: 1,
      selectedPiece: null,
      selectedOriIdx: 0,
      movesMade: state.movesMade + 1,
      rngSeed: nextSeed,
    };

    // Check if game is over
    if (newRemaining[0].length === 0 && newRemaining[1].length === 0) {
      next = { ...next, winner: "draw", turn: 0 };
      return next;
    }

    next = runBot(next);

    // After bot, check if human can still move
    if (next.winner === null) {
      const humanCanMove = next.remaining[0].some((id) =>
        pieceOrientations(PIECES[id]!).some(
          (ori2) => validPlacements(next.board, ori2, 0, next.hasPlaced[0]).length > 0
        )
      );
      if (!humanCanMove && next.remaining[0].length > 0) {
        // Human stuck — bot might still play, or game ends
        const botCanMove = next.remaining[1].some((id) =>
          pieceOrientations(PIECES[id]!).some(
            (ori2) => validPlacements(next.board, ori2, 1, next.hasPlaced[1]).length > 0
          )
        );
        if (!botCanMove) {
          const sq0 = remainingSquares(next.remaining[0]);
          const sq1 = remainingSquares(next.remaining[1]);
          const winner: 0 | 1 | "draw" | null = sq0 < sq1 ? 0 : sq1 < sq0 ? 1 : "draw";
          next = { ...next, winner };
        }
      }
    }

    return next;
  }

  return state;
}

export function isTerminal(state: BlokusDuoState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === 0) return { score: 100 };
  if (state.winner === "draw") return { score: 50 };
  return { score: 0 };
}

export { canPlace, validPlacements, remainingSquares };
