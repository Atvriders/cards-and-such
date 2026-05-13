/**
 * Checkers — Full Tournament (American Checkers Federation rules)
 *
 * Implemented rules:
 *  - 8×8 board, dark squares only (32 playable squares).
 *  - 12 pieces per side. Red ("you", moves up the board) and Black (CPU, moves down).
 *  - Men (uncrowned pieces) step diagonally FORWARD one square at a time.
 *  - Kings (crowned pieces) step diagonally one square in any direction.
 *  - JUMP-CAPTURES ARE MANDATORY: if any capture exists on your turn you MUST take one.
 *  - MULTI-JUMP CHAINS: after a jump, if the moving piece can jump again it MUST.
 *    (American rule: a man that reaches the back row and crowns *stops*; the chain ends.)
 *  - PROMOTION: reaching the opponent's back row promotes a man to King.
 *  - WIN: opponent has no pieces, OR opponent has no legal moves on their turn.
 *  - 3-MOVE BALLOT OPENING: at game start a random ballot is selected from a curated
 *    list of standard openings; the first three plies are forced to that ballot
 *    (Red ply 1, Black ply 1, Red ply 2). Move 4 onward is free play.
 *  - 40-MOVE-NO-CAPTURE-NO-PROMOTION DRAW RULE: if 40 full plies pass without any
 *    capture AND without any promotion the game is declared a draw.
 *
 * AI (CPU plays Black):
 *  - Alpha-beta minimax search, depth 4 by default (configurable 2/3/4).
 *  - Heuristic = material + king-count + mobility:
 *       100 * (blackMen - redMen)
 *     + 250 * (blackKings - redKings)
 *     +   5 * (blackMobility - redMobility)
 *     +   3 * (blackBackRank - redBackRank)   -- discourages early back-rank abandonment
 *  - "Mobility" is the count of legal moves available to that color from the position
 *    (ignoring forced-capture restriction for mobility scoring — we want raw move
 *    options as a positional signal).
 *  - During multi-jump chains the CPU continues choosing the highest-evaluated chain
 *    completion before yielding the turn.
 *  - The 3-move ballot forces the AI's opening reply, so depth-4 search does not
 *    run during the ballot phase.
 */

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type Color = "red" | "black";

export interface Piece {
  color: Color;
  king: boolean;
}

/** A coord on the 8×8 board; only dark squares ((row+col)%2===1) ever hold a piece. */
export interface Coord { row: number; col: number }

/** A legal move — possibly with a chain of captures already resolved. */
export interface CftMove {
  from: Coord;
  to: Coord;
  /** Squares of opposing pieces removed by this move (empty for non-captures). */
  captures: Coord[];
}

export interface CftSettings {
  /** Bot search depth. M tier ships depth 4; users may dial down for speed. */
  botDepth: "2" | "3" | "4";
  /** Use the 3-move ballot opening or start from the empty book (free play). */
  ballotOpening: boolean;
  /** Hide the bot move for fairness (purely cosmetic, has no rule effect). */
  showLastMove: boolean;
}

/**
 * One opening ballot = THREE forced plies: Red move 1, Black move 1, Red move 2.
 * Each move is "fromIdx-toIdx" using the standard 1..32 ACF square numbering
 * (top-left dark square is 1, increasing left-to-right, top-to-bottom — i.e.
 * row 0 has squares 1..4 on cols 1,3,5,7; row 1 has 5..8 on cols 0,2,4,6; ...).
 *
 * The ballots below are real (or paraphrased) ACF 3-move opening references —
 * Old Faithful, Single Corner, Bristol, Cross, Dyke, etc. — chosen so each
 * plays as a normal-looking opening.
 */
export interface BallotPly { from: number; to: number }
export interface Ballot {
  id: string;
  name: string;
  plies: [BallotPly, BallotPly, BallotPly];
}

export const BALLOTS: readonly Ballot[] = [
  // "Old Faithful" (capture variant): 11-15, 22-18, 15x22. The traditional
  // Old Faithful 8-11 is illegal because Red has a mandatory jump after 22-18.
  // Including the forced capture as the ballot's third ply matches what
  // actually happens in tournament play.
  { id: "old-faithful", name: "Old Faithful",
    plies: [{ from: 11, to: 15 }, { from: 22, to: 18 }, { from: 15, to: 22 }] },
  // "Single Corner": 9-13, 22-18, 5-9
  { id: "single-corner", name: "Single Corner",
    plies: [{ from: 9, to: 13 }, { from: 22, to: 18 }, { from: 5, to: 9 }] },
  // "Bristol": 11-16, 24-19, 8-11
  { id: "bristol", name: "Bristol",
    plies: [{ from: 11, to: 16 }, { from: 24, to: 19 }, { from: 8, to: 11 }] },
  // "Cross": 11-15, 23-18, 8-11
  { id: "cross", name: "Cross",
    plies: [{ from: 11, to: 15 }, { from: 23, to: 18 }, { from: 8, to: 11 }] },
  // "Dyke": 11-15, 22-18, 15-22 -- wait that's a capture; use 11-15, 22-17, 15-19
  { id: "dyke", name: "Dyke",
    plies: [{ from: 11, to: 15 }, { from: 22, to: 17 }, { from: 15, to: 19 }] },
  // "Switcher": 11-15, 21-17, 9-13
  { id: "switcher", name: "Switcher",
    plies: [{ from: 11, to: 15 }, { from: 21, to: 17 }, { from: 9, to: 13 }] },
  // "Defiance": 11-15, 23-19, 8-11
  { id: "defiance", name: "Defiance",
    plies: [{ from: 11, to: 15 }, { from: 23, to: 19 }, { from: 8, to: 11 }] },
  // "Souter": 11-15, 24-20, 8-11
  { id: "souter", name: "Souter",
    plies: [{ from: 11, to: 15 }, { from: 24, to: 20 }, { from: 8, to: 11 }] },
  // "Edinburgh": 9-13, 24-20, 11-15
  { id: "edinburgh", name: "Edinburgh",
    plies: [{ from: 9, to: 13 }, { from: 24, to: 20 }, { from: 11, to: 15 }] },
  // "Glasgow": 11-15, 23-19, 9-14
  { id: "glasgow", name: "Glasgow",
    plies: [{ from: 11, to: 15 }, { from: 23, to: 19 }, { from: 9, to: 14 }] },
];

export interface CftState {
  settings: CftSettings;
  rngSeed: number;
  /** Flat 64-cell board, row-major. Light squares are always null. */
  board: ReadonlyArray<Piece | null>;
  turn: Color;
  /** If non-null, the player MUST continue jumping from this square (chain in progress). */
  mustContinueFrom: Coord | null;
  /** Plies since last capture or promotion (40 → draw). */
  pliesSinceCaptureOrPromo: number;
  /** Set once the game ends; null while playing. */
  winner: Color | "draw" | null;
  /** Which 3-move ballot (or null if disabled). */
  ballot: Ballot | null;
  /** How many ballot plies have already been auto-played (0..3). */
  ballotPliesPlayed: number;
  /** The most recent move (for UI highlighting). */
  lastMove: { from: Coord; to: Coord } | null;
}

export type CftAction = { type: "move"; from: Coord; to: Coord };

// ----- Board helpers -----

const BOARD_SIZE = 8;
const DRAW_PLY_LIMIT = 40;

function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
}

function idx(r: number, c: number): number { return r * BOARD_SIZE + c; }

function get(board: ReadonlyArray<Piece | null>, c: Coord): Piece | null {
  return board[idx(c.row, c.col)] ?? null;
}

function set(
  board: ReadonlyArray<Piece | null>,
  c: Coord,
  v: Piece | null,
): Piece[] | (Piece | null)[] {
  const next = board.slice() as (Piece | null)[];
  next[idx(c.row, c.col)] = v;
  return next;
}

/**
 * Map ACF square number (1..32) to (row, col).
 *
 * ACF notation labels squares from the first-mover's back rank (their nearest
 * row) outward. In our state Red is the first mover and sits at the bottom of
 * the board (rows 5..7), so square 1 lives at our row 7. Walking row by row:
 *
 *   squares  1.. 4  -> row 7 (Red's back rank), cols 0,2,4,6  (dark squares)
 *   squares  5.. 8  -> row 6,                  cols 1,3,5,7
 *   squares  9..12  -> row 5,                  cols 0,2,4,6
 *   squares 13..16  -> row 4,                  cols 1,3,5,7  (the empty middle)
 *   squares 17..20  -> row 3,                  cols 0,2,4,6
 *   squares 21..24  -> row 2 (Black front),    cols 1,3,5,7
 *   squares 25..28  -> row 1,                  cols 0,2,4,6
 *   squares 29..32  -> row 0 (Black back),     cols 1,3,5,7
 *
 * Red starts on squares 1..12; Black starts on squares 21..32.
 * Reading numbers right-to-left within a row keeps "1" at the bottom-right of
 * Red's back rank, matching the standard tournament diagram orientation
 * (square 1 is the rightmost dark square from the first-mover's POV).
 */
function acfToCoord(n: number): Coord {
  // n is 1..32
  const zero = n - 1;
  const bandFromBottom = Math.floor(zero / 4); // 0 = bottom-most row of the 8
  const row = 7 - bandFromBottom;
  const colInRow = zero % 4;
  // Rows 7,5,3,1 (i.e. row % 2 === 1) have dark squares at cols 0,2,4,6.
  // Rows 6,4,2,0 (i.e. row % 2 === 0) have dark squares at cols 1,3,5,7.
  // ACF reads squares right-to-left from the first-mover's POV, so for the
  // even-band rows we go right-to-left across cols 6,4,2,0; for the odd-band
  // rows we go right-to-left across cols 7,5,3,1.
  const col = row % 2 === 1
    ? 6 - colInRow * 2 // cols 6,4,2,0
    : 7 - colInRow * 2; // cols 7,5,3,1
  return { row, col };
}

// ----- Initial board layout -----

function makeStartingBoard(): (Piece | null)[] {
  const cells: (Piece | null)[] = new Array(64).fill(null);
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if ((r + c) % 2 !== 1) continue;
      if (r < 3) cells[idx(r, c)] = { color: "black", king: false };
      else if (r > 4) cells[idx(r, c)] = { color: "red", king: false };
    }
  }
  return cells;
}

// ----- Move generation -----

/** Diagonal directions a piece may step. Red moves up (-1 row); Black moves down. Kings: both. */
function dirsFor(p: Piece): ReadonlyArray<readonly [number, number]> {
  if (p.king) return [[-1, -1], [-1, 1], [1, -1], [1, 1]] as const;
  return p.color === "red"
    ? ([[-1, -1], [-1, 1]] as const)
    : ([[1, -1], [1, 1]] as const);
}

/** Recursively enumerate all jump CHAINS starting from (from). */
function findJumps(
  board: ReadonlyArray<Piece | null>,
  from: Coord,
  piece: Piece,
  alreadyCaptured: ReadonlySet<string>,
): CftMove[] {
  const out: CftMove[] = [];
  for (const [dr, dc] of dirsFor(piece)) {
    const midR = from.row + dr;
    const midC = from.col + dc;
    const landR = from.row + dr * 2;
    const landC = from.col + dc * 2;
    if (!inBounds(midR, midC) || !inBounds(landR, landC)) continue;

    const mid = { row: midR, col: midC };
    const land = { row: landR, col: landC };
    const midKey = `${midR},${midC}`;
    const midP = get(board, mid);
    const landP = get(board, land);
    if (!midP || midP.color === piece.color) continue;
    if (landP !== null) continue;
    if (alreadyCaptured.has(midKey)) continue;

    // Simulate landing for chain continuation.
    const becomesKingOnLand =
      !piece.king &&
      ((piece.color === "red" && landR === 0) ||
        (piece.color === "black" && landR === BOARD_SIZE - 1));
    const movedPiece: Piece = becomesKingOnLand ? { ...piece, king: true } : piece;
    const simBoard = set(set(set(board, mid, null), from, null), land, movedPiece);
    const nextCaptured = new Set(alreadyCaptured);
    nextCaptured.add(midKey);

    // American rule: if the man crowns mid-chain, the chain ENDS — the new king
    // does not get a bonus jump on the same turn.
    let chains: CftMove[] = [];
    if (!becomesKingOnLand) {
      chains = findJumps(simBoard, land, movedPiece, nextCaptured);
    }
    if (chains.length === 0) {
      out.push({ from, to: land, captures: [mid] });
    } else {
      for (const ch of chains) {
        out.push({ from, to: ch.to, captures: [mid, ...ch.captures] });
      }
    }
  }
  return out;
}

/** Mandatory-capture move list. If any jump exists, only jumps are returned. */
export function getLegalMoves(
  board: ReadonlyArray<Piece | null>,
  color: Color,
  mustContinueFrom: Coord | null,
): CftMove[] {
  if (mustContinueFrom) {
    const p = get(board, mustContinueFrom);
    if (!p || p.color !== color) return [];
    return findJumps(board, mustContinueFrom, p, new Set());
  }
  const jumps: CftMove[] = [];
  const simples: CftMove[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[idx(r, c)];
      if (!piece || piece.color !== color) continue;
      const here = { row: r, col: c };
      const js = findJumps(board, here, piece, new Set());
      jumps.push(...js);
      if (js.length > 0) continue; // only collect simples per-piece if no jumps available globally
      for (const [dr, dc] of dirsFor(piece)) {
        const nr = r + dr;
        const nc = c + dc;
        if (!inBounds(nr, nc)) continue;
        if (board[idx(nr, nc)] !== null) continue;
        simples.push({ from: here, to: { row: nr, col: nc }, captures: [] });
      }
    }
  }
  if (jumps.length > 0) return jumps;
  return simples;
}

// ----- Apply a single resolved move to the state -----

function applyMoveToBoard(
  board: ReadonlyArray<Piece | null>,
  move: CftMove,
): { board: (Piece | null)[]; promoted: boolean; captured: boolean } {
  const piece = get(board, move.from)!;
  let next = board.slice() as (Piece | null)[];
  for (const cap of move.captures) next[idx(cap.row, cap.col)] = null;
  next[idx(move.from.row, move.from.col)] = null;
  const wasKing = piece.king;
  const becomesKing =
    !wasKing &&
    ((piece.color === "red" && move.to.row === 0) ||
      (piece.color === "black" && move.to.row === BOARD_SIZE - 1));
  next[idx(move.to.row, move.to.col)] = becomesKing ? { ...piece, king: true } : piece;
  return { board: next, promoted: becomesKing, captured: move.captures.length > 0 };
}

function applyResolvedMove(state: CftState, move: CftMove): CftState {
  const { board, promoted, captured } = applyMoveToBoard(state.board, move);

  const newCounter = captured || promoted ? 0 : state.pliesSinceCaptureOrPromo + 1;

  // Multi-jump chain continuation: if the piece just captured AND can still jump
  // AND it didn't just crown, the same player MUST continue.
  if (captured && !promoted) {
    const piece = board[idx(move.to.row, move.to.col)]!;
    const more = findJumps(board, move.to, piece, new Set());
    if (more.length > 0) {
      return {
        ...state,
        board,
        mustContinueFrom: { row: move.to.row, col: move.to.col },
        pliesSinceCaptureOrPromo: newCounter,
        lastMove: { from: move.from, to: move.to },
      };
    }
  }

  const nextTurn: Color = state.turn === "red" ? "black" : "red";

  // Win/draw resolution.
  const oppMoves = getLegalMoves(board, nextTurn, null);
  let winner: Color | "draw" | null = null;
  if (oppMoves.length === 0) winner = state.turn;
  else if (newCounter >= DRAW_PLY_LIMIT) winner = "draw";

  return {
    ...state,
    board,
    turn: nextTurn,
    mustContinueFrom: null,
    pliesSinceCaptureOrPromo: newCounter,
    lastMove: { from: move.from, to: move.to },
    winner,
  };
}

// ----- AI (alpha-beta, mobility + king-count) -----

function countMaterial(board: ReadonlyArray<Piece | null>): {
  redMen: number; redKings: number; blackMen: number; blackKings: number;
  redBack: number; blackBack: number;
} {
  let redMen = 0, redKings = 0, blackMen = 0, blackKings = 0, redBack = 0, blackBack = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[idx(r, c)];
      if (!p) continue;
      if (p.color === "red") {
        if (p.king) redKings++; else redMen++;
        if (r === BOARD_SIZE - 1) redBack++;
      } else {
        if (p.king) blackKings++; else blackMen++;
        if (r === 0) blackBack++;
      }
    }
  }
  return { redMen, redKings, blackMen, blackKings, redBack, blackBack };
}

function mobilityCount(board: ReadonlyArray<Piece | null>, color: Color): number {
  return getLegalMoves(board, color, null).length;
}

/** Black is the AI / maximizing player. */
function evaluate(board: ReadonlyArray<Piece | null>): number {
  const m = countMaterial(board);
  const blackMob = mobilityCount(board, "black");
  const redMob = mobilityCount(board, "red");
  return (
    100 * ((m.blackMen + m.blackKings) - (m.redMen + m.redKings)) +
    150 * (m.blackKings - m.redKings) +
    5 * (blackMob - redMob) +
    3 * (m.blackBack - m.redBack)
  );
}

interface AIState {
  board: ReadonlyArray<Piece | null>;
  turn: Color;
  mustContinueFrom: Coord | null;
}

function aiApply(s: AIState, move: CftMove): AIState {
  const { board, promoted, captured } = applyMoveToBoard(s.board, move);
  if (captured && !promoted) {
    const piece = board[idx(move.to.row, move.to.col)]!;
    const more = findJumps(board, move.to, piece, new Set());
    if (more.length > 0) {
      return { board, turn: s.turn, mustContinueFrom: { row: move.to.row, col: move.to.col } };
    }
  }
  return { board, turn: s.turn === "red" ? "black" : "red", mustContinueFrom: null };
}

function aiSearch(state: AIState, depth: number, alpha: number, beta: number):
  { score: number; move: CftMove | null } {
  const moves = getLegalMoves(state.board, state.turn, state.mustContinueFrom);
  if (depth === 0 || moves.length === 0) {
    if (moves.length === 0) {
      // Side-to-move has lost.
      return { score: state.turn === "black" ? -100000 : 100000, move: null };
    }
    return { score: evaluate(state.board), move: null };
  }
  const maxing = state.turn === "black";
  let best: CftMove | null = null;
  let bestScore = maxing ? -Infinity : Infinity;
  for (const m of moves) {
    const next = aiApply(state, m);
    const { score } = aiSearch(next, depth - 1, alpha, beta);
    if (maxing) {
      if (score > bestScore) { bestScore = score; best = m; }
      if (bestScore > alpha) alpha = bestScore;
    } else {
      if (score < bestScore) { bestScore = score; best = m; }
      if (bestScore < beta) beta = bestScore;
    }
    if (beta <= alpha) break;
  }
  return { score: bestScore, move: best };
}

/** Play one Black ply (may resolve multi-jump chain internally). */
function playBotPly(state: CftState): CftState {
  if (state.winner !== null || state.turn !== "black") return state;
  const depth = Math.max(1, parseInt(state.settings.botDepth, 10) || 4);
  let cur = state;
  // Loop while it's Black's turn and game isn't over — handles chain continuation.
  let guard = 0;
  while (cur.turn === "black" && cur.winner === null && guard < 32) {
    const aiState: AIState = {
      board: cur.board,
      turn: "black",
      mustContinueFrom: cur.mustContinueFrom,
    };
    const { move } = aiSearch(aiState, depth, -Infinity, Infinity);
    if (!move) break;
    cur = applyResolvedMove(cur, move);
    guard++;
  }
  return cur;
}

// ----- Ballot opening helpers -----

/** Find the legal move that starts at acfFrom and ends at acfTo for the given color. */
function ballotMoveToCft(
  board: ReadonlyArray<Piece | null>,
  color: Color,
  ply: BallotPly,
): CftMove | null {
  const from = acfToCoord(ply.from);
  const to = acfToCoord(ply.to);
  const legal = getLegalMoves(board, color, null);
  return legal.find(
    (m) =>
      m.from.row === from.row && m.from.col === from.col &&
      m.to.row === to.row && m.to.col === to.col,
  ) ?? null;
}

/** Auto-play any forced ballot plies that have not yet been played. */
function advanceBallot(state: CftState): CftState {
  if (!state.ballot) return state;
  let cur = state;
  let safety = 0;
  while (
    cur.ballot &&
    cur.ballotPliesPlayed < cur.ballot.plies.length &&
    cur.winner === null &&
    safety < 6
  ) {
    const ply = cur.ballot.plies[cur.ballotPliesPlayed]!;
    // Plies alternate: 0=Red, 1=Black, 2=Red. Only auto-play when it's that color's turn.
    const expectedColor: Color = cur.ballotPliesPlayed % 2 === 0 ? "red" : "black";
    if (cur.turn !== expectedColor) break;
    const move = ballotMoveToCft(cur.board, expectedColor, ply);
    if (!move) {
      // Ballot move not legal (shouldn't happen with curated list); abort ballot.
      cur = { ...cur, ballot: null };
      break;
    }
    cur = applyResolvedMove(cur, move);
    cur = { ...cur, ballotPliesPlayed: cur.ballotPliesPlayed + 1 };
    safety++;
  }
  return cur;
}

// ----- Public API -----

export function initialState(seed: number, settings: CftSettings): CftState {
  const board = makeStartingBoard();
  let ballot: Ballot | null = null;
  if (settings.ballotOpening) {
    const rng = mulberry32(seed);
    const i = Math.floor(rng() * BALLOTS.length) % BALLOTS.length;
    ballot = BALLOTS[i] ?? null;
  }
  const base: CftState = {
    settings,
    rngSeed: seed,
    board,
    turn: "red",
    mustContinueFrom: null,
    pliesSinceCaptureOrPromo: 0,
    winner: null,
    ballot,
    ballotPliesPlayed: 0,
    lastMove: null,
  };
  // Auto-play all 3 forced ballot plies up front so the human starts at move 4.
  return advanceBallot(base);
}

export function reducer(state: CftState, action: CftAction): CftState {
  if (action.type !== "move") return state;
  if (state.winner !== null) return state;
  // Human only plays Red. (CPU plays Black automatically inside this reducer.)
  if (state.turn !== "red") return state;

  // Enforce mid-chain continuation source.
  if (state.mustContinueFrom) {
    if (action.from.row !== state.mustContinueFrom.row ||
        action.from.col !== state.mustContinueFrom.col) return state;
  }

  const piece = get(state.board, action.from);
  if (!piece || piece.color !== "red") return state;

  const legal = getLegalMoves(state.board, "red", state.mustContinueFrom);
  const match = legal.find((m) =>
    m.from.row === action.from.row && m.from.col === action.from.col &&
    m.to.row === action.to.row && m.to.col === action.to.col,
  );
  if (!match) return state;

  let next = applyResolvedMove(state, match);

  // If a forced ballot ply for Red was just used, advance the counter & let
  // the next ballot ply auto-play.
  if (next.ballot && next.ballotPliesPlayed < next.ballot.plies.length) {
    next = { ...next, ballotPliesPlayed: next.ballotPliesPlayed + 1 };
    next = advanceBallot(next);
  }

  if (next.winner !== null) return next;
  if (next.mustContinueFrom !== null) return next; // Red still mid-chain
  if (next.turn !== "black") return next;

  // Bot's turn — play a full ply (may include chained jumps).
  next = playBotPly(next);

  // After bot, check if the next move is a forced Red ballot ply (it normally
  // wouldn't be once ballot is done, but harmless to call).
  if (next.ballot && next.ballotPliesPlayed < next.ballot.plies.length) {
    next = advanceBallot(next);
  }

  return next;
}

export function isTerminal(state: CftState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === "red") {
    // Score: 100 base for win + 10 per surviving red piece + 50 bonus per remaining king.
    let pieces = 0, kings = 0;
    for (const p of state.board) {
      if (p && p.color === "red") { pieces++; if (p.king) kings++; }
    }
    return { score: 100 + pieces * 10 + kings * 50 };
  }
  return { score: 0 }; // loss or draw — off the leaderboard
}

// Re-export low-level helpers used by Game.tsx and tests.
export { advanceBallot, playBotPly, applyResolvedMove, evaluate, acfToCoord };
