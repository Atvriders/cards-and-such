import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// =====================================================================
// Stratego (Full Classic) — 10×10 hidden-rank war game.
// L-tier complexity. Advanced rules omitted (noted in howToPlay):
//   - Two-square rule / chasing rule (no infinite chase prevention).
//   - Move-history rank deductions beyond CPU's simple heuristic.
//   - Tournament setups / time controls.
// =====================================================================

export type Rank = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | -1;
// 0 = Flag, 1 = Spy, 2..9 = numbered, 10 = Marshal, -1 = Bomb (immovable)

export type Side = 0 | 1; // 0 = human, 1 = CPU

export interface Piece {
  id: number;
  side: Side;
  rank: Rank;
  revealed: boolean; // true once involved in a combat (rank visible to opponent)
  moved: boolean;    // true once it has moved at least once
}

export type CellContent = Piece | null;

// Board is row-major: row 0 is CPU's back row, row 9 is human's back row.
export type Board = CellContent[][]; // 10x10

export interface CombatLog {
  attackerId: number;
  defenderId: number;
  attackerRank: Rank;
  defenderRank: Rank;
  attackerSide: Side;
  outcome: "attackerWins" | "defenderWins" | "mutual";
  fromR: number; fromC: number; toR: number; toC: number;
}

export interface StrategoFullSettings { _dummy: "x"; }

export type Phase = "setup" | "playing" | "done";

export interface StrategoFullState {
  board: Board;
  turn: Side;        // whose turn during "playing"
  phase: Phase;
  selected: { r: number; c: number } | null;
  lastCombat: CombatLog | null;
  winner: Side | null;
  // Setup state: pile of pieces still to place (human side only)
  setupPile: Rank[]; // remaining ranks for human to place (consume in order from front)
  // Move count and seed bookkeeping
  movesMade: number;
  rngSeed: number;
  // History (for CPU heuristic)
  history: CombatLog[];
}

export type StrategoFullAction =
  | { type: "select"; r: number; c: number }
  | { type: "place"; r: number; c: number; rank: Rank } // setup phase: place a piece
  | { type: "autoFillSetup" }                            // randomly fill remaining human pieces
  | { type: "startGame" }                                // commit setup, begin play
  | { type: "newGame" };

// =====================================================================
// Constants
// =====================================================================

export const ROWS = 10;
export const COLS = 10;

// Lakes: rows 4,5 cols 2,3 and rows 4,5 cols 6,7
export function isLake(r: number, c: number): boolean {
  if (r !== 4 && r !== 5) return false;
  return (c === 2 || c === 3 || c === 6 || c === 7);
}

// Piece composition for each side
export const STANDARD_COMPOSITION: ReadonlyArray<{ rank: Rank; count: number }> = [
  { rank: 10, count: 1 }, // Marshal
  { rank: 9, count: 1 },  // General
  { rank: 8, count: 2 },  // Colonels
  { rank: 7, count: 3 },  // Majors
  { rank: 6, count: 4 },  // Captains
  { rank: 5, count: 4 },  // Lieutenants
  { rank: 4, count: 4 },  // Sergeants
  { rank: 3, count: 5 },  // Miners
  { rank: 2, count: 8 },  // Scouts
  { rank: 1, count: 1 },  // Spy
  { rank: 0, count: 1 },  // Flag
  { rank: -1, count: 6 }, // Bombs
];

export function rankLetter(rank: Rank): string {
  if (rank === 0) return "F";
  if (rank === -1) return "B";
  if (rank === 1) return "S";
  if (rank === 10) return "10";
  return String(rank);
}

export function rankName(rank: Rank): string {
  switch (rank) {
    case 0: return "Flag";
    case -1: return "Bomb";
    case 1: return "Spy";
    case 2: return "Scout";
    case 3: return "Miner";
    case 4: return "Sergeant";
    case 5: return "Lieutenant";
    case 6: return "Captain";
    case 7: return "Major";
    case 8: return "Colonel";
    case 9: return "General";
    case 10: return "Marshal";
  }
}

// Expand composition into a flat array of 40 ranks.
export function buildPile(): Rank[] {
  const out: Rank[] = [];
  for (const { rank, count } of STANDARD_COMPOSITION) {
    for (let i = 0; i < count; i++) out.push(rank);
  }
  return out;
}

// =====================================================================
// Movability
// =====================================================================

export function isMovable(rank: Rank): boolean {
  // Flag (0) and Bomb (-1) cannot move.
  return rank !== 0 && rank !== -1;
}

// =====================================================================
// Combat resolution
// Returns:
//   "attackerWins"  → defender removed, attacker moves into cell
//   "defenderWins"  → attacker removed, defender stays
//   "mutual"        → both removed (square ends empty)
// =====================================================================

export function resolveCombat(attackerRank: Rank, defenderRank: Rank): CombatLog["outcome"] {
  // Bomb: attacker dies unless attacker is a Miner (rank 3).
  if (defenderRank === -1) {
    return attackerRank === 3 ? "attackerWins" : "defenderWins";
  }
  // Flag: attacker always wins (game ends elsewhere).
  if (defenderRank === 0) return "attackerWins";
  // Spy attacks Marshal: Spy wins.
  if (attackerRank === 1 && defenderRank === 10) return "attackerWins";
  // Marshal attacks Spy (or anyone attacking Spy): higher rank wins (Spy is 1).
  if (attackerRank > defenderRank) return "attackerWins";
  if (attackerRank < defenderRank) return "defenderWins";
  return "mutual";
}

// =====================================================================
// Movement legality
// =====================================================================

export interface Move {
  fromR: number; fromC: number; toR: number; toC: number;
}

export function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < ROWS && c >= 0 && c < COLS;
}

export function isLegalMove(board: Board, side: Side, m: Move): boolean {
  if (!inBounds(m.fromR, m.fromC) || !inBounds(m.toR, m.toC)) return false;
  if (m.fromR === m.toR && m.fromC === m.toC) return false;
  const p = board[m.fromR]?.[m.fromC] ?? null;
  if (!p || p.side !== side) return false;
  if (!isMovable(p.rank)) return false;
  if (isLake(m.toR, m.toC)) return false;
  const dest = board[m.toR]?.[m.toC] ?? null;
  if (dest && dest.side === side) return false;
  const dr = m.toR - m.fromR;
  const dc = m.toC - m.fromC;
  // Orthogonal only
  if (dr !== 0 && dc !== 0) return false;
  const dist = Math.abs(dr) + Math.abs(dc);
  if (p.rank !== 2) {
    // Non-scout: must be exactly 1 square
    if (dist !== 1) return false;
    return true;
  }
  // Scout: straight line, no jumping over pieces or lakes, can attack at end
  const stepR = Math.sign(dr);
  const stepC = Math.sign(dc);
  let r = m.fromR + stepR;
  let c = m.fromC + stepC;
  while (r !== m.toR || c !== m.toC) {
    if (isLake(r, c)) return false;
    if (board[r]?.[c]) return false;
    r += stepR;
    c += stepC;
  }
  return true;
}

export function allLegalMoves(board: Board, side: Side): Move[] {
  const moves: Move[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r]?.[c] ?? null;
      if (!p || p.side !== side || !isMovable(p.rank)) continue;
      if (p.rank !== 2) {
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const nr = r + dr!;
          const nc = c + dc!;
          if (isLegalMove(board, side, { fromR: r, fromC: c, toR: nr, toC: nc })) {
            moves.push({ fromR: r, fromC: c, toR: nr, toC: nc });
          }
        }
      } else {
        // Scout: try every distance in 4 directions
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          let nr = r + dr!;
          let nc = c + dc!;
          while (inBounds(nr, nc) && !isLake(nr, nc)) {
            const dest = board[nr]?.[nc] ?? null;
            if (dest && dest.side === side) break;
            moves.push({ fromR: r, fromC: c, toR: nr, toC: nc });
            if (dest) break; // can attack but not pass through
            nr += dr!;
            nc += dc!;
          }
        }
      }
    }
  }
  return moves;
}

// Side has any movable piece left?
export function hasAnyMove(board: Board, side: Side): boolean {
  return allLegalMoves(board, side).length > 0;
}

// =====================================================================
// Setup helpers
// =====================================================================

function emptyBoard(): Board {
  const b: Board = [];
  for (let r = 0; r < ROWS; r++) {
    const row: CellContent[] = [];
    for (let c = 0; c < COLS; c++) row.push(null);
    b.push(row);
  }
  return b;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

// Auto-place CPU pieces on rows 0..3 (CPU side).
// Strategy: Flag goes in back row (r=0), bombs around it (corners r=0 + adj on r=1), rest random.
function placeCpuPieces(board: Board, rng: () => number, nextId: { v: number }): void {
  const pile = buildPile();
  // Place flag in row 0, column from {0, 1, 2, 8, 9} — back-row corners or middle, biased to corners.
  const flagColCandidates = [0, 9, 1, 8, 2, 7, 4, 5];
  const flagCol = flagColCandidates[Math.floor(rng() * flagColCandidates.length)]!;
  board[0]![flagCol] = { id: nextId.v++, side: 1, rank: 0, revealed: false, moved: false };
  // Remove one Flag from pile
  const fi = pile.indexOf(0); if (fi >= 0) pile.splice(fi, 1);
  // Bombs near flag
  const bombSpots: Array<[number, number]> = [];
  for (const [dr, dc] of [[0, -1], [0, 1], [1, 0], [1, -1], [1, 1]]) {
    const r = 0 + dr!;
    const c = flagCol + dc!;
    if (r >= 0 && r < 4 && c >= 0 && c < COLS && !(board[r]?.[c])) {
      bombSpots.push([r, c]);
    }
  }
  // Use up to 3 bombs guarding the flag
  const bombsToUse = Math.min(3, bombSpots.length);
  for (let i = 0; i < bombsToUse; i++) {
    const [br, bc] = bombSpots[i]!;
    board[br]![bc] = { id: nextId.v++, side: 1, rank: -1, revealed: false, moved: false };
    const idx = pile.indexOf(-1);
    if (idx >= 0) pile.splice(idx, 1);
  }
  // Collect remaining empty squares in rows 0..3
  const empties: Array<[number, number]> = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!board[r]?.[c]) empties.push([r, c]);
    }
  }
  const shuffledSpots = shuffle(empties, rng);
  const shuffledPile = shuffle(pile, rng);
  for (let i = 0; i < shuffledPile.length && i < shuffledSpots.length; i++) {
    const [r, c] = shuffledSpots[i]!;
    const rank = shuffledPile[i]!;
    board[r]![c] = { id: nextId.v++, side: 1, rank, revealed: false, moved: false };
  }
}

// Auto-place human pieces (used by autoFillSetup action) similar to CPU but on rows 6..9.
function placeHumanRandom(board: Board, remaining: Rank[], rng: () => number, nextId: { v: number }): Rank[] {
  // Determine which human-side cells are empty in rows 6..9
  const empties: Array<[number, number]> = [];
  for (let r = 6; r < 10; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!board[r]?.[c]) empties.push([r, c]);
    }
  }
  const remainingCopy = [...remaining];
  const shuffledSpots = shuffle(empties, rng);
  const shuffledPieces = shuffle(remainingCopy, rng);
  const used: number[] = [];
  for (let i = 0; i < shuffledPieces.length && i < shuffledSpots.length; i++) {
    const [r, c] = shuffledSpots[i]!;
    const rank = shuffledPieces[i]!;
    board[r]![c] = { id: nextId.v++, side: 0, rank, revealed: false, moved: false };
    used.push(i);
  }
  // Remove placed pieces from remaining (all of them, since we placed every available slot)
  // We placed `min(shuffledPieces.length, shuffledSpots.length)` pieces.
  const placedCount = Math.min(shuffledPieces.length, shuffledSpots.length);
  // shuffledPieces was a shuffle of remainingCopy, so remove the first placedCount of those values
  const consumed: Rank[] = shuffledPieces.slice(0, placedCount);
  const leftover = [...remainingCopy];
  for (const rk of consumed) {
    const idx = leftover.indexOf(rk);
    if (idx >= 0) leftover.splice(idx, 1);
  }
  return leftover;
}

// =====================================================================
// initialState
// =====================================================================

export function initialState(seed: number, _settings: StrategoFullSettings): StrategoFullState {
  const rng = mulberry32(seed >>> 0);
  const board = emptyBoard();
  const nextId = { v: 1 };
  placeCpuPieces(board, rng, nextId);
  const pile = buildPile();
  return {
    board,
    turn: 0,
    phase: "setup",
    selected: null,
    lastCombat: null,
    winner: null,
    setupPile: pile,
    movesMade: 0,
    rngSeed: seed >>> 0,
    history: [],
  };
}

// =====================================================================
// CPU heuristic move
// Simple strategy:
//   * Prefer attacks where attacker's rank > defender's revealed rank.
//   * Prefer attacks on unrevealed pieces only if attacker is strong (>=7).
//   * Prefer attacks on revealed Flag (always best).
//   * Otherwise, send Scouts forward to scout / approach enemy.
//   * Otherwise, move toward enemy side.
// =====================================================================

function scoreCpuMove(board: Board, m: Move, history: CombatLog[]): number {
  const attacker = board[m.fromR]?.[m.fromC];
  if (!attacker) return -Infinity;
  const target = board[m.toR]?.[m.toC];
  let score = 0;
  if (target && target.side !== attacker.side) {
    // It's an attack.
    if (target.rank === 0 && target.revealed) {
      return 100000; // Capture flag, instant best.
    }
    if (target.revealed) {
      // Known rank: only attack if we win
      const outcome = resolveCombat(attacker.rank, target.rank);
      if (outcome === "attackerWins") {
        // Higher value targets are better
        const value = (target.rank as number) + 10;
        score += 500 + value * 50;
      } else if (outcome === "mutual") {
        score += -100 + (attacker.rank as number) * -5;
      } else {
        score += -10000; // We die.
      }
    } else {
      // Unrevealed: probe with scouts cheaply; only strong pieces consider attack
      if (attacker.rank === 2) score += 80; // Scout probes enemy
      else if ((attacker.rank as number) >= 7) score += 60; // Strong piece risks attack
      else score += -50;
    }
  } else {
    // Plain move: prefer forward (toward row 9 = human side)
    const forward = m.toR - m.fromR; // positive = toward human
    score += forward * 8;
    // Scouts get a forward bonus
    if (attacker.rank === 2) score += 10;
    // Don't move bombs (they shouldn't be movable anyway, but defensive)
    if (attacker.rank === -1 || attacker.rank === 0) score = -Infinity;
    // Slight central preference
    const centerDist = Math.abs(m.toC - 4.5);
    score -= centerDist * 0.5;
  }
  // Use history: if attacker met a stronger revealed piece before that survives, avoid.
  // (Simple safety: avoid moves that put attacker adjacent to a known-stronger enemy.)
  for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    const nr = m.toR + dr!;
    const nc = m.toC + dc!;
    if (!inBounds(nr, nc)) continue;
    const adj = board[nr]?.[nc];
    if (!adj || adj.side === attacker.side) continue;
    if (adj.revealed && (adj.rank as number) > (attacker.rank as number) && adj.rank !== -1 && adj.rank !== 0) {
      score -= 30;
    }
  }
  // Defend flag: if attacker is adjacent to own flag region (rows 0..1), small bonus to staying.
  if (attacker.rank === -1) score = -Infinity; // never move bombs
  if (attacker.rank === 0) score = -Infinity;  // never move flag

  // Slight nudge against moving the very first piece you select (deterministic-ish via id)
  // (keeps CPU exploring different pieces between turns)
  // Not strictly necessary but useful.
  void history;
  return score;
}

function pickCpuMove(state: StrategoFullState, rng: () => number): Move | null {
  const moves = allLegalMoves(state.board, 1);
  if (moves.length === 0) return null;
  // Score, then pick best (with a tiny random jitter to break ties).
  let best: Move | null = null;
  let bestScore = -Infinity;
  for (const m of moves) {
    const s = scoreCpuMove(state.board, m, state.history) + (rng() - 0.5) * 2;
    if (s > bestScore) {
      bestScore = s;
      best = m;
    }
  }
  return best;
}

// =====================================================================
// Apply a move (with combat) and return new state
// =====================================================================

function applyMove(state: StrategoFullState, side: Side, m: Move, rng: () => number): StrategoFullState {
  void rng;
  if (!isLegalMove(state.board, side, m)) return state;
  // Deep-ish copy board
  const newBoard: Board = state.board.map((row) => row.slice());
  const attacker = newBoard[m.fromR]?.[m.fromC];
  if (!attacker) return state;
  const moved: Piece = { ...attacker, moved: true };
  newBoard[m.fromR]![m.fromC] = null;
  const defender = newBoard[m.toR]?.[m.toC] ?? null;
  let combat: CombatLog | null = null;
  let winner: Side | null = null;
  if (defender && defender.side !== side) {
    // Combat
    const outcome = resolveCombat(moved.rank, defender.rank);
    combat = {
      attackerId: moved.id,
      defenderId: defender.id,
      attackerRank: moved.rank,
      defenderRank: defender.rank,
      attackerSide: side,
      outcome,
      fromR: m.fromR, fromC: m.fromC, toR: m.toR, toC: m.toC,
    };
    if (defender.rank === 0) {
      // Flag captured — attacker side wins immediately
      newBoard[m.toR]![m.toC] = { ...moved, revealed: true };
      winner = side;
    } else if (outcome === "attackerWins") {
      newBoard[m.toR]![m.toC] = { ...moved, revealed: true };
    } else if (outcome === "defenderWins") {
      // Defender stays revealed (it survived combat); attacker is gone
      newBoard[m.toR]![m.toC] = { ...defender, revealed: true };
    } else {
      // mutual: both gone
      newBoard[m.toR]![m.toC] = null;
    }
  } else {
    // Plain move
    newBoard[m.toR]![m.toC] = moved;
  }

  const history = combat ? [...state.history, combat] : state.history;
  let phase: Phase = state.phase;
  let nextTurn: Side = side === 0 ? 1 : 0;

  // Win check: opponent has no movable piece OR their flag is gone
  if (winner === null) {
    const opp: Side = nextTurn;
    // Has opponent's flag been removed?
    let oppHasFlag = false;
    for (const row of newBoard) {
      for (const cell of row) {
        if (cell && cell.side === opp && cell.rank === 0) { oppHasFlag = true; break; }
      }
      if (oppHasFlag) break;
    }
    if (!oppHasFlag) {
      winner = side;
    } else if (!hasAnyMove(newBoard, opp)) {
      winner = side;
    }
  }
  if (winner !== null) phase = "done";

  return {
    ...state,
    board: newBoard,
    turn: nextTurn,
    phase,
    selected: null,
    lastCombat: combat,
    winner,
    history,
    movesMade: state.movesMade + 1,
  };
}

// Run CPU turn(s) until it's back to human or game ends.
function runCpu(state: StrategoFullState): StrategoFullState {
  let s = state;
  // Safety cap to avoid infinite loops in pathological cases.
  let safety = 5;
  while (s.phase === "playing" && s.turn === 1 && s.winner === null && safety-- > 0) {
    const rng = mulberry32((s.rngSeed + s.movesMade * 17 + 31) >>> 0);
    const m = pickCpuMove(s, rng);
    if (!m) {
      // CPU has no moves → human wins
      return { ...s, winner: 0, phase: "done", turn: 0 };
    }
    s = applyMove(s, 1, m, rng);
    break;
  }
  return s;
}

// =====================================================================
// Reducer
// =====================================================================

export function reducer(state: StrategoFullState, action: StrategoFullAction): StrategoFullState {
  if (action.type === "newGame") {
    return initialState(state.rngSeed + state.movesMade + 1, { _dummy: "x" });
  }
  if (state.phase === "done") return state;

  if (state.phase === "setup") {
    if (action.type === "place") {
      // Place a piece of given rank at (r,c) on human side (rows 6..9).
      if (action.r < 6 || action.r > 9 || action.c < 0 || action.c >= COLS) return state;
      if (state.board[action.r]?.[action.c]) return state;
      const idx = state.setupPile.indexOf(action.rank);
      if (idx < 0) return state;
      const newBoard: Board = state.board.map((row) => row.slice());
      // Find a fresh id — use a counter based on board contents
      let nextId = 1;
      for (const row of newBoard) for (const cell of row) if (cell && cell.id >= nextId) nextId = cell.id + 1;
      newBoard[action.r]![action.c] = { id: nextId, side: 0, rank: action.rank, revealed: false, moved: false };
      const newPile = [...state.setupPile];
      newPile.splice(idx, 1);
      return { ...state, board: newBoard, setupPile: newPile };
    }
    if (action.type === "autoFillSetup") {
      const rng = mulberry32((state.rngSeed + 7) >>> 0);
      const newBoard: Board = state.board.map((row) => row.slice());
      let nextId = 1;
      for (const row of newBoard) for (const cell of row) if (cell && cell.id >= nextId) nextId = cell.id + 1;
      const idRef = { v: nextId };
      const leftover = placeHumanRandom(newBoard, state.setupPile, rng, idRef);
      return { ...state, board: newBoard, setupPile: leftover };
    }
    if (action.type === "startGame") {
      if (state.setupPile.length > 0) return state;
      return { ...state, phase: "playing", turn: 0 };
    }
    // ignore other actions in setup
    return state;
  }

  // playing
  if (action.type === "select") {
    if (state.turn !== 0) return state;
    const { r, c } = action;
    if (!inBounds(r, c)) return state;
    const cell = state.board[r]?.[c] ?? null;
    if (state.selected === null) {
      // Select own movable piece
      if (cell && cell.side === 0 && isMovable(cell.rank)) {
        return { ...state, selected: { r, c } };
      }
      return state;
    }
    // Already have selection — clicking same cell deselects
    if (state.selected.r === r && state.selected.c === c) {
      return { ...state, selected: null };
    }
    // Clicking another own piece → switch selection
    if (cell && cell.side === 0 && isMovable(cell.rank)) {
      return { ...state, selected: { r, c } };
    }
    // Otherwise attempt move
    const m: Move = { fromR: state.selected.r, fromC: state.selected.c, toR: r, toC: c };
    if (!isLegalMove(state.board, 0, m)) {
      return state; // illegal; same reference
    }
    const rng = mulberry32((state.rngSeed + state.movesMade * 7 + 1) >>> 0);
    let next = applyMove(state, 0, m, rng);
    if (next.phase === "done") return next;
    // CPU's turn
    next = runCpu(next);
    return next;
  }
  return state;
}

// =====================================================================
// isTerminal
// =====================================================================

export function isTerminal(state: StrategoFullState): { score: number } | null {
  if (state.phase !== "done" || state.winner === null) return null;
  return state.winner === 0 ? { score: 100 } : { score: 0 };
}
