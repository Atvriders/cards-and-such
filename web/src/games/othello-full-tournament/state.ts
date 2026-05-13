import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// =============================================================================
// Othello (Full Tournament)
// -----------------------------------------------------------------------------
// 8x8 Reversi/Othello with the polished tournament-edition trimmings:
//   - Named opening detector (Diagonal, Tiger, Bear, etc.)
//   - "Completed games this session" counter (match progress)
//   - Alpha-beta with iterative deepening + position-aware evaluation
//   - Edax-flavoured corner / X-square / mobility weighting
//
// NOTE: byo-yomi clocks are intentionally OUT OF SCOPE for this platform
//       (no realtime tick infrastructure in the plugin contract).
// =============================================================================

export type Cell = 0 | 1 | null; // 0 = Black (human), 1 = White (CPU)
export type Seat = 0 | 1;
export type Difficulty = "easy" | "normal" | "hard" | "expert";

export interface OthelloFTSettings {
  difficulty: Difficulty;
}

export interface OthelloFTState {
  settings: OthelloFTSettings;
  board: readonly Cell[];
  turn: Seat;
  blackCount: number;
  whiteCount: number;
  /** True when the most recent ply was a pass (used to detect double pass). */
  lastPass: boolean;
  /** Final outcome from Black's perspective. */
  winner: 0 | 1 | "draw" | null;
  movesMade: number;
  /** Identifier of the recognised opening sequence, if any. */
  openingName: string | null;
  /** Ordered list of (row, col) plies — used to fingerprint openings. */
  history: ReadonlyArray<{ seat: Seat; row: number; col: number; pass: boolean }>;
  /** "Completed games this session" surfaced in the UI. */
  completedThisSession: number;
  rngSeed: number;
}

export type OthelloFTAction =
  | { type: "place"; row: number; col: number }
  | { type: "pass" }
  | { type: "newGame" };

export const SIZE = 8;

const DIRS: ReadonlyArray<readonly [number, number]> = [
  [-1, -1], [-1, 0], [-1, 1],
  [ 0, -1],          [ 0, 1],
  [ 1, -1], [ 1, 0], [ 1, 1],
];

export function idx(r: number, c: number): number { return r * SIZE + c; }

// -----------------------------------------------------------------------------
// Core flip / legality logic
// -----------------------------------------------------------------------------

export function flipsAt(
  board: readonly Cell[],
  seat: Seat,
  r: number,
  c: number,
): number[] {
  if (board[idx(r, c)] !== null) return [];
  const opp: Seat = seat === 0 ? 1 : 0;
  const all: number[] = [];
  for (const [dr, dc] of DIRS) {
    const line: number[] = [];
    let nr = r + dr;
    let nc = c + dc;
    while (
      nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE &&
      board[idx(nr, nc)] === opp
    ) {
      line.push(idx(nr, nc));
      nr += dr;
      nc += dc;
    }
    if (
      line.length > 0 &&
      nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE &&
      board[idx(nr, nc)] === seat
    ) {
      all.push(...line);
    }
  }
  return all;
}

export function legalMoves(
  board: readonly Cell[],
  seat: Seat,
): Array<{ row: number; col: number }> {
  const out: Array<{ row: number; col: number }> = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[idx(r, c)] !== null) continue;
      if (flipsAt(board, seat, r, c).length > 0) out.push({ row: r, col: c });
    }
  }
  return out;
}

function applyPlace(
  board: readonly Cell[],
  seat: Seat,
  r: number,
  c: number,
): Cell[] {
  const flips = flipsAt(board, seat, r, c);
  const next = [...board] as Cell[];
  next[idx(r, c)] = seat;
  for (const i of flips) next[i] = seat;
  return next;
}

function counts(board: readonly Cell[]): { black: number; white: number } {
  let black = 0, white = 0;
  for (const c of board) {
    if (c === 0) black++;
    else if (c === 1) white++;
  }
  return { black, white };
}

function endIfDone(board: readonly Cell[]): "draw" | 0 | 1 | null {
  const blackMoves = legalMoves(board, 0).length;
  const whiteMoves = legalMoves(board, 1).length;
  if (blackMoves === 0 && whiteMoves === 0) {
    const { black, white } = counts(board);
    if (black > white) return 0;
    if (white > black) return 1;
    return "draw";
  }
  return null;
}

// -----------------------------------------------------------------------------
// Position-aware evaluation (Edax-flavoured weights)
// -----------------------------------------------------------------------------

// 8x8 positional weights. Corners +50, X-squares -20, C-squares -5,
// edges +5, sweet-16 quiet squares small bonus.
const POSITION_WEIGHTS: number[] = [
   50, -5,  5,  3,  3,  5, -5,  50,
   -5,-20, -2, -2, -2, -2,-20,  -5,
    5, -2,  3,  1,  1,  3, -2,   5,
    3, -2,  1,  1,  1,  1, -2,   3,
    3, -2,  1,  1,  1,  1, -2,   3,
    5, -2,  3,  1,  1,  3, -2,   5,
   -5,-20, -2, -2, -2, -2,-20,  -5,
   50, -5,  5,  3,  3,  5, -5,  50,
];

function positionScore(board: readonly Cell[], seat: Seat): number {
  const opp: Seat = seat === 0 ? 1 : 0;
  let s = 0;
  for (let i = 0; i < 64; i++) {
    if (board[i] === seat) s += POSITION_WEIGHTS[i]!;
    else if (board[i] === opp) s -= POSITION_WEIGHTS[i]!;
  }
  return s;
}

function mobilityScore(board: readonly Cell[], seat: Seat): number {
  const opp: Seat = seat === 0 ? 1 : 0;
  return legalMoves(board, seat).length - legalMoves(board, opp).length;
}

function discDiff(board: readonly Cell[], seat: Seat): number {
  const { black, white } = counts(board);
  return seat === 0 ? black - white : white - black;
}

/** Evaluate board from the perspective of `seat`. Larger = better for seat. */
function evaluate(board: readonly Cell[], seat: Seat): number {
  let empties = 0;
  for (const c of board) if (c === null) empties++;
  // Endgame: disc count dominates. Otherwise: position + mobility.
  if (empties <= 10) {
    return discDiff(board, seat) * 100 + positionScore(board, seat);
  }
  return positionScore(board, seat) + mobilityScore(board, seat) * 8;
}

// -----------------------------------------------------------------------------
// Alpha-beta search with iterative deepening
// -----------------------------------------------------------------------------

interface SearchResult {
  score: number;
  move: { row: number; col: number } | null;
}

function alphaBeta(
  board: readonly Cell[],
  toMove: Seat,
  rootSeat: Seat,
  depth: number,
  alpha: number,
  beta: number,
  prevPass: boolean,
): SearchResult {
  if (depth === 0) {
    return { score: evaluate(board, rootSeat), move: null };
  }
  const moves = legalMoves(board, toMove);
  if (moves.length === 0) {
    if (prevPass) {
      // Both passed — terminal. Score is pure disc diff (large weight).
      return { score: discDiff(board, rootSeat) * 1000, move: null };
    }
    // Force a pass: opponent moves at same depth (no decrement) to allow
    // shallow searches to still see relevant follow-ups.
    const opp: Seat = toMove === 0 ? 1 : 0;
    const r = alphaBeta(board, opp, rootSeat, depth - 1, alpha, beta, true);
    return { score: r.score, move: null };
  }

  // Move ordering: corners first, then by static positional weight.
  const ordered = [...moves].sort((a, b) => {
    return POSITION_WEIGHTS[idx(b.row, b.col)]! - POSITION_WEIGHTS[idx(a.row, a.col)]!;
  });

  let bestMove: { row: number; col: number } | null = ordered[0]!;
  const opp: Seat = toMove === 0 ? 1 : 0;

  if (toMove === rootSeat) {
    let best = -Infinity;
    for (const m of ordered) {
      const nb = applyPlace(board, toMove, m.row, m.col);
      const r = alphaBeta(nb, opp, rootSeat, depth - 1, alpha, beta, false);
      if (r.score > best) {
        best = r.score;
        bestMove = m;
      }
      if (best > alpha) alpha = best;
      if (alpha >= beta) break;
    }
    return { score: best, move: bestMove };
  } else {
    let worst = Infinity;
    for (const m of ordered) {
      const nb = applyPlace(board, toMove, m.row, m.col);
      const r = alphaBeta(nb, opp, rootSeat, depth - 1, alpha, beta, false);
      if (r.score < worst) {
        worst = r.score;
        bestMove = m;
      }
      if (worst < beta) beta = worst;
      if (alpha >= beta) break;
    }
    return { score: worst, move: bestMove };
  }
}

function depthForDifficulty(diff: Difficulty): number {
  switch (diff) {
    case "easy":   return 1;
    case "normal": return 3;
    case "hard":   return 4;
    case "expert": return 5;
  }
}

function searchBestMove(
  board: readonly Cell[],
  seat: Seat,
  difficulty: Difficulty,
): { row: number; col: number } | null {
  const target = depthForDifficulty(difficulty);
  let last: SearchResult = { score: 0, move: null };
  // Iterative deepening: each iteration gives us a usable move; the final
  // one is what we play. This also gives natural early-cutoff behaviour for
  // the hard/expert levels on near-empty boards.
  for (let d = 1; d <= target; d++) {
    last = alphaBeta(board, seat, seat, d, -Infinity, Infinity, false);
    if (!last.move) break; // forced pass
  }
  return last.move;
}

// -----------------------------------------------------------------------------
// Opening book — fingerprint the first few plies into a named line.
// Sequences are in (row, col) form, Black to move first.
// (Othello opening conventions: F5 = (4,5); F6 = (5,5); etc.)
// -----------------------------------------------------------------------------

interface OpeningEntry {
  name: string;
  /** Move sequence as (row, col) tuples starting from move 1 (Black). */
  moves: ReadonlyArray<readonly [number, number]>;
}

const OPENING_BOOK: readonly OpeningEntry[] = [
  // F5 d6 = "Diagonal Opening" core
  { name: "Diagonal Opening", moves: [[4, 5], [5, 3]] },
  // F5 f6 = "Perpendicular Opening" core
  { name: "Perpendicular Opening", moves: [[4, 5], [5, 5]] },
  // F5 d6 c3 = "Tiger"
  { name: "Tiger", moves: [[4, 5], [5, 3], [2, 2]] },
  // F5 d6 c5 = "Cat"
  { name: "Cat", moves: [[4, 5], [5, 3], [4, 2]] },
  // F5 d6 c6 = "Heath / Tobidashi"
  { name: "Heath", moves: [[4, 5], [5, 3], [5, 2]] },
  // F5 f6 e6 = "Cow"
  { name: "Cow", moves: [[4, 5], [5, 5], [5, 4]] },
  // F5 f6 f7 = "Bear"
  { name: "Bear", moves: [[4, 5], [5, 5], [6, 5]] },
  // F5 d6 c4 = "Buffalo"
  { name: "Buffalo", moves: [[4, 5], [5, 3], [3, 2]] },
  // F5 d6 c3 d3 = "Rose"  (Tiger family)
  { name: "Rose", moves: [[4, 5], [5, 3], [2, 2], [2, 3]] },
  // F5 d6 c3 d3 c4 = "Aubergine"
  { name: "Aubergine", moves: [[4, 5], [5, 3], [2, 2], [2, 3], [3, 2]] },
];

export function detectOpening(
  history: ReadonlyArray<{ seat: Seat; row: number; col: number; pass: boolean }>,
): string | null {
  // Only look at the first N non-pass plies (max length in our book).
  const plies = history.filter((h) => !h.pass);
  if (plies.length === 0) return null;
  let best: string | null = null;
  let bestLen = 0;
  for (const op of OPENING_BOOK) {
    if (plies.length < op.moves.length) continue;
    let matches = true;
    for (let i = 0; i < op.moves.length; i++) {
      const want = op.moves[i]!;
      const got = plies[i]!;
      if (got.row !== want[0] || got.col !== want[1]) { matches = false; break; }
    }
    if (matches && op.moves.length > bestLen) {
      best = op.name;
      bestLen = op.moves.length;
    }
  }
  return best;
}

// -----------------------------------------------------------------------------
// Bot runner
// -----------------------------------------------------------------------------

function runBot(state: OthelloFTState): OthelloFTState {
  let s = state;
  // Loop: bot may need to play, or pass, possibly multiple times if the human
  // also has no legal moves and would consume an automatic pass.
  while (s.winner === null && s.turn === 1) {
    const rng = mulberry32(s.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);

    const botMoves = legalMoves(s.board, 1);
    if (botMoves.length === 0) {
      // Bot must pass.
      const newHistory = [...s.history, { seat: 1 as Seat, row: -1, col: -1, pass: true }];
      if (s.lastPass) {
        const w = endIfDone(s.board);
        s = {
          ...s,
          rngSeed: nextSeed,
          winner: w ?? "draw",
          history: newHistory,
        };
        break;
      }
      s = {
        ...s,
        rngSeed: nextSeed,
        turn: 0,
        lastPass: true,
        history: newHistory,
      };
      // If human also has no moves, the human reducer will pick that up and
      // the next dispatched pass will end the game. We stop here.
      break;
    }

    let move: { row: number; col: number } | null;
    if (s.settings.difficulty === "easy") {
      // Easy: weighted random toward higher-value squares.
      const sorted = [...botMoves].sort(
        (a, b) => POSITION_WEIGHTS[idx(b.row, b.col)]! - POSITION_WEIGHTS[idx(a.row, a.col)]!,
      );
      // 50% pick best, 50% random of top-3 to add variety.
      if (rng() < 0.5) {
        move = sorted[0]!;
      } else {
        const pool = sorted.slice(0, Math.min(3, sorted.length));
        move = pool[Math.floor(rng() * pool.length)]!;
      }
    } else {
      move = searchBestMove(s.board, 1, s.settings.difficulty);
      if (!move) move = botMoves[0]!;
    }

    const newBoard = applyPlace(s.board, 1, move.row, move.col);
    const { black, white } = counts(newBoard);
    const newHistory = [...s.history, { seat: 1 as Seat, row: move.row, col: move.col, pass: false }];

    s = {
      ...s,
      rngSeed: nextSeed,
      board: newBoard,
      turn: 0,
      lastPass: false,
      blackCount: black,
      whiteCount: white,
      movesMade: s.movesMade + 1,
      history: newHistory,
      openingName: detectOpening(newHistory) ?? s.openingName,
    };

    const w = endIfDone(newBoard);
    if (w !== null) {
      s = { ...s, winner: w };
      break;
    }

    // If human has no legal moves, auto-pass on their behalf and let the bot
    // play again so the game doesn't soft-lock waiting for an impossible move.
    if (legalMoves(s.board, 0).length === 0) {
      const passHist = [...s.history, { seat: 0 as Seat, row: -1, col: -1, pass: true }];
      if (s.lastPass) {
        const w2 = endIfDone(s.board);
        s = { ...s, winner: w2 ?? "draw", history: passHist };
        break;
      }
      s = { ...s, turn: 1, lastPass: true, history: passHist };
      continue;
    }
    break;
  }
  return s;
}

// -----------------------------------------------------------------------------
// Public reducer / initialState / isTerminal
// -----------------------------------------------------------------------------

function freshBoard(): Cell[] {
  const board = new Array<Cell>(64).fill(null);
  // Standard Othello opening position:
  //   d4 = white, e4 = black, d5 = black, e5 = white
  // Using (row, col) zero-indexed:
  board[idx(3, 3)] = 1;
  board[idx(3, 4)] = 0;
  board[idx(4, 3)] = 0;
  board[idx(4, 4)] = 1;
  return board;
}

export function initialState(seed: number, settings: OthelloFTSettings): OthelloFTState {
  return {
    settings,
    board: freshBoard(),
    turn: 0,
    blackCount: 2,
    whiteCount: 2,
    lastPass: false,
    winner: null,
    movesMade: 0,
    openingName: null,
    history: [],
    completedThisSession: 0,
    rngSeed: seed >>> 0,
  };
}

export function reducer(state: OthelloFTState, action: OthelloFTAction): OthelloFTState {
  // "newGame" works after a finished game — increments the session counter
  // and resets the board, preserving difficulty & session count.
  if (action.type === "newGame") {
    if (state.winner === null) return state;
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return {
      ...initialState(nextSeed, state.settings),
      completedThisSession: state.completedThisSession + 1,
    };
  }

  if (state.winner !== null) return state;

  if (action.type === "pass") {
    if (state.turn !== 0) return state;
    if (legalMoves(state.board, 0).length > 0) return state;
    const newHistory = [...state.history, { seat: 0 as Seat, row: -1, col: -1, pass: true }];
    if (state.lastPass) {
      const w = endIfDone(state.board);
      return { ...state, winner: w ?? "draw", history: newHistory };
    }
    let next: OthelloFTState = {
      ...state,
      turn: 1,
      lastPass: true,
      history: newHistory,
    };
    next = runBot(next);
    return next;
  }

  if (action.type === "place") {
    if (state.turn !== 0) return state;
    const { row, col } = action;
    if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) return state;
    if (state.board[idx(row, col)] !== null) return state;
    if (flipsAt(state.board, 0, row, col).length === 0) return state;

    const newBoard = applyPlace(state.board, 0, row, col);
    const { black, white } = counts(newBoard);
    const newHistory = [...state.history, { seat: 0 as Seat, row, col, pass: false }];
    let next: OthelloFTState = {
      ...state,
      board: newBoard,
      turn: 1,
      lastPass: false,
      blackCount: black,
      whiteCount: white,
      movesMade: state.movesMade + 1,
      history: newHistory,
      openingName: detectOpening(newHistory) ?? state.openingName,
    };

    const w = endIfDone(newBoard);
    if (w !== null) return { ...next, winner: w };
    next = runBot(next);
    return next;
  }

  return state;
}

export function isTerminal(state: OthelloFTState): { score: number } | null {
  if (state.winner === null) return null;
  // Score: win = 100 + disc lead; draw = 50; loss = 0 (so losses don't crowd
  // the leaderboard).
  if (state.winner === 0) {
    return { score: 100 + Math.max(0, state.blackCount - state.whiteCount) * 2 };
  }
  if (state.winner === "draw") return { score: 50 };
  return { score: 0 };
}

// Re-export helpers used by tests / UI
export { applyPlace, counts };
