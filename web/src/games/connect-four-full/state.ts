// Connect Four (Tournament) — full-rulebook variant with depth-scaled CPU.
// Self-contained: no @cards/shared dependency. Board is 7×6, gravity-stacks,
// win on 4-in-a-row in any of 4 directions. Move-count-aware scoring rewards
// faster wins.

export const COLS = 7;
export const ROWS = 6;

export type Cell = 0 | 1 | null;
export type Player = 0 | 1; // 0 = human (red), 1 = CPU (yellow)
export type Winner = 0 | 1 | "draw" | null;
export type Difficulty = "easy" | "medium" | "hard";

export type Phase = "playing" | "thinking" | "over";

export interface CFFState {
  board: Cell[]; // length COLS*ROWS, index = row*COLS + col, row 0 is top
  turn: Player;
  winner: Winner;
  winningLine: ReadonlyArray<readonly [number, number]> | null;
  movesPlayed: number;
  phase: Phase;
  difficulty: Difficulty;
  lastMove: { row: number; col: number; player: Player } | null;
  /** seconds-equivalent step counter; we only track move count for scoring */
  startedAt: number;
}

export type CFFAction =
  | { type: "drop"; col: number }
  | { type: "cpuMove"; col: number }
  | { type: "reset" };

export interface CFFSettings {
  difficulty: Difficulty;
}

export function idx(row: number, col: number): number {
  return row * COLS + col;
}

/** Returns the row a disc dropped in `col` would land in, or -1 if full. */
export function dropRow(board: Cell[], col: number): number {
  if (col < 0 || col >= COLS) return -1;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[idx(r, col)] === null) return r;
  }
  return -1;
}

/** Returns the 4-cell winning line that includes `(r, c)`, or null. */
export function findWinningLine(
  board: Cell[],
  r: number,
  c: number,
): ReadonlyArray<readonly [number, number]> | null {
  const v = board[idx(r, c)];
  if (v === null) return null;
  const dirs: Array<[number, number]> = [
    [0, 1], // horizontal
    [1, 0], // vertical
    [1, 1], // diag down-right
    [1, -1], // diag down-left
  ];
  for (const [dr, dc] of dirs) {
    const line: Array<[number, number]> = [[r, c]];
    // extend forward
    let rr = r + dr;
    let cc = c + dc;
    while (
      rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS &&
      board[idx(rr, cc)] === v
    ) {
      line.push([rr, cc]);
      rr += dr;
      cc += dc;
    }
    // extend backward
    rr = r - dr;
    cc = c - dc;
    while (
      rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS &&
      board[idx(rr, cc)] === v
    ) {
      line.unshift([rr, cc]);
      rr -= dr;
      cc -= dc;
    }
    if (line.length >= 4) return line.slice(0, 4);
  }
  return null;
}

export function initialState(_seed: number, settings: CFFSettings): CFFState {
  return {
    board: new Array(COLS * ROWS).fill(null) as Cell[],
    turn: 0,
    winner: null,
    winningLine: null,
    movesPlayed: 0,
    phase: "playing",
    difficulty: settings.difficulty,
    lastMove: null,
    startedAt: 0,
  };
}

function placeMove(state: CFFState, col: number, player: Player): CFFState {
  if (state.winner !== null || state.phase === "over") return state;
  if (state.turn !== player) return state;
  const r = dropRow(state.board, col);
  if (r < 0) return state;
  const board = state.board.slice();
  board[idx(r, col)] = player;
  const line = findWinningLine(board, r, col);
  const movesPlayed = state.movesPlayed + 1;
  let winner: Winner = null;
  let phase: Phase = state.phase;
  if (line) {
    winner = player;
    phase = "over";
  } else if (movesPlayed >= COLS * ROWS) {
    winner = "draw";
    phase = "over";
  } else {
    // After human plays, CPU "thinks" so Game.tsx can schedule the move.
    phase = player === 0 ? "thinking" : "playing";
  }
  return {
    ...state,
    board,
    turn: (player === 0 ? 1 : 0) as Player,
    winner,
    winningLine: line,
    movesPlayed,
    phase,
    lastMove: { row: r, col, player },
  };
}

export function reducer(state: CFFState, action: CFFAction): CFFState {
  switch (action.type) {
    case "drop": {
      // Human-driven drop; only legal when phase==="playing" and turn===0.
      if (state.phase !== "playing" || state.turn !== 0) return state;
      return placeMove(state, action.col, 0);
    }
    case "cpuMove": {
      if (state.phase !== "thinking" || state.turn !== 1) return state;
      return placeMove(state, action.col, 1);
    }
    case "reset": {
      return initialState(0, { difficulty: state.difficulty });
    }
    default:
      return state;
  }
}

export function isTerminal(state: CFFState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === 0) {
    // Move-count-aware: faster wins score higher. Min moves to win is 7
    // (4 by human + 3 by CPU). Max possible moves before a human win is
    // 41 (board nearly full). Score formula:
    //   base = 100, plus a speed bonus that decays linearly with moves.
    // We also apply a difficulty multiplier so wins on hard count more.
    const speedBonus = Math.max(0, 50 - (state.movesPlayed - 7) * 2);
    const diffMult =
      state.difficulty === "hard" ? 1.5
      : state.difficulty === "medium" ? 1.2
      : 1.0;
    const score = Math.round((100 + speedBonus) * diffMult);
    return { score };
  }
  if (state.winner === "draw") {
    const diffMult =
      state.difficulty === "hard" ? 1.5
      : state.difficulty === "medium" ? 1.2
      : 1.0;
    return { score: Math.round(40 * diffMult) };
  }
  // CPU win → 0
  return { score: 0 };
}

/* =========================================================================
 * CPU search: minimax with alpha-beta pruning + center-column ordering +
 * transposition table. Depth scales with difficulty.
 * ========================================================================= */

const COL_ORDER = (() => {
  const center = Math.floor(COLS / 2);
  const order: number[] = [center];
  for (let off = 1; off <= center; off++) {
    if (center - off >= 0) order.push(center - off);
    if (center + off < COLS) order.push(center + off);
  }
  return order;
})();

function legalCols(board: Cell[]): number[] {
  const out: number[] = [];
  for (const c of COL_ORDER) if (board[idx(0, c)] === null) out.push(c);
  return out;
}

function applyMove(
  board: Cell[],
  col: number,
  player: Player,
): { board: Cell[]; row: number } | null {
  const r = dropRow(board, col);
  if (r < 0) return null;
  const nb = board.slice();
  nb[idx(r, col)] = player;
  return { board: nb, row: r };
}

function evalBoard(board: Cell[], player: Player): number {
  // Score is from `player`'s perspective. We score "windows" of 4 consecutive
  // cells; classic Connect-4 heuristic.
  const opp: Player = (player === 0 ? 1 : 0) as Player;
  let score = 0;
  // Center column ownership bonus.
  const center = Math.floor(COLS / 2);
  for (let r = 0; r < ROWS; r++) {
    const v = board[idx(r, center)];
    if (v === player) score += 3;
    else if (v === opp) score -= 3;
  }
  const scoreWindow = (w: Cell[]): number => {
    let p = 0;
    let o = 0;
    let e = 0;
    for (const c of w) {
      if (c === player) p++;
      else if (c === opp) o++;
      else e++;
    }
    if (p === 4) return 100000;
    if (o === 4) return -100000;
    if (p === 3 && e === 1) return 10;
    if (p === 2 && e === 2) return 4;
    if (o === 3 && e === 1) return -12; // weight opponent threats slightly higher
    if (o === 2 && e === 2) return -4;
    return 0;
  };
  // horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const w: Cell[] = [
        board[idx(r, c)]!, board[idx(r, c + 1)]!,
        board[idx(r, c + 2)]!, board[idx(r, c + 3)]!,
      ];
      score += scoreWindow(w);
    }
  }
  // vertical
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r <= ROWS - 4; r++) {
      const w: Cell[] = [
        board[idx(r, c)]!, board[idx(r + 1, c)]!,
        board[idx(r + 2, c)]!, board[idx(r + 3, c)]!,
      ];
      score += scoreWindow(w);
    }
  }
  // diag down-right
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const w: Cell[] = [
        board[idx(r, c)]!, board[idx(r + 1, c + 1)]!,
        board[idx(r + 2, c + 2)]!, board[idx(r + 3, c + 3)]!,
      ];
      score += scoreWindow(w);
    }
  }
  // diag down-left
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 3; c < COLS; c++) {
      const w: Cell[] = [
        board[idx(r, c)]!, board[idx(r + 1, c - 1)]!,
        board[idx(r + 2, c - 2)]!, board[idx(r + 3, c - 3)]!,
      ];
      score += scoreWindow(w);
    }
  }
  return score;
}

function boardKey(board: Cell[], turn: Player): string {
  // Compact key for transposition table.
  let s = String(turn);
  for (let i = 0; i < board.length; i++) {
    const v = board[i];
    s += v === null ? "." : String(v);
  }
  return s;
}

function depthFor(difficulty: Difficulty): number {
  if (difficulty === "easy") return 2;
  if (difficulty === "medium") return 5;
  return 7;
}

export function chooseCpuMove(
  state: CFFState,
  difficulty: Difficulty = state.difficulty,
  rngForEasy?: () => number,
): number | null {
  const cols = legalCols(state.board);
  if (cols.length === 0) return null;

  // Easy: 50% random plausible move, 50% block-or-win heuristic.
  if (difficulty === "easy") {
    const rng = rngForEasy ?? Math.random;
    // Always grab an immediate win if available.
    for (const c of cols) {
      const m = applyMove(state.board, c, 1);
      if (m && findWinningLine(m.board, m.row, c)) return c;
    }
    // 50% chance to block; otherwise just go.
    if (rng() < 0.5) {
      for (const c of cols) {
        const m = applyMove(state.board, c, 0);
        if (m && findWinningLine(m.board, m.row, c)) return c;
      }
    }
    // Random plausible (slightly prefer center).
    const pick = Math.floor(rng() * cols.length);
    return cols[pick]!;
  }

  // Medium/Hard: real minimax with alpha-beta + center ordering + TT.
  const maxDepth = depthFor(difficulty);
  const tt = new Map<string, { depth: number; score: number; flag: 0 | 1 | -1 }>();

  function negamax(
    board: Cell[],
    turn: Player,
    depth: number,
    alpha: number,
    beta: number,
    lastMove: { row: number; col: number; player: Player } | null,
  ): number {
    // Terminal check via lastMove (cheaper than scanning whole board).
    // If `lastMove.player` won, then current `turn` (the player to move) has
    // already lost. From negamax's "score from perspective of `turn`" view,
    // that means we return a large negative. Faster losses are "less bad"
    // (we add `depth` so deeper-search losses are penalized more).
    if (lastMove) {
      const line = findWinningLine(board, lastMove.row, lastMove.col);
      if (line) {
        return -(100000 + depth);
      }
    }
    if (depth === 0) {
      // Static evaluation from CPU (player 1) perspective, then convert
      // to "perspective of `turn`" by negation if turn is the human.
      const ev = evalBoard(board, 1);
      return turn === 1 ? ev : -ev;
    }
    const moves = legalCols(board);
    if (moves.length === 0) return 0;

    const key = boardKey(board, turn) + "|d" + String(depth);
    const cached = tt.get(key);
    if (cached && cached.depth >= depth) {
      if (cached.flag === 0) return cached.score;
      if (cached.flag === -1 && cached.score <= alpha) return cached.score;
      if (cached.flag === 1 && cached.score >= beta) return cached.score;
    }

    const alphaOrig = alpha;
    let best = -Infinity;
    for (const c of moves) {
      const m = applyMove(board, c, turn);
      if (!m) continue;
      const next: Player = (turn === 0 ? 1 : 0) as Player;
      const v = -negamax(
        m.board,
        next,
        depth - 1,
        -beta,
        -alpha,
        { row: m.row, col: c, player: turn },
      );
      if (v > best) best = v;
      if (best > alpha) alpha = best;
      if (alpha >= beta) break;
    }
    const flag: -1 | 0 | 1 =
      best <= alphaOrig ? -1 : best >= beta ? 1 : 0;
    tt.set(key, { depth, score: best, flag });
    return best;
  }

  // Root: pick the move with the best score (CPU is player 1).
  let bestCol = cols[0]!;
  let bestScore = -Infinity;
  for (const c of cols) {
    const m = applyMove(state.board, c, 1);
    if (!m) continue;
    // Immediate-win shortcut.
    if (findWinningLine(m.board, m.row, c)) return c;
    const v = -negamax(
      m.board,
      0,
      maxDepth - 1,
      -Infinity,
      Infinity,
      { row: m.row, col: c, player: 1 },
    );
    if (v > bestScore) {
      bestScore = v;
      bestCol = c;
    }
  }
  return bestCol;
}
