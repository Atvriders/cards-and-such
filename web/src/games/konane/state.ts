import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { minimax } from "../../engines/grid/minimax.js";
import { Grid } from "../../engines/grid/index.js";

// Konane — Hawaiian Checkers
// 8×8 board filled with alternating Black/White stones.
// Phase 1 (opening): Black removes one central stone, then White removes an adjacent one.
// Phase 2 (play): Players jump over adjacent opponent stones (orthogonally), removing them.
//   Multiple consecutive jumps in same direction allowed in one turn.
//   First player unable to move loses.
// Seat 0 = Black (player), Seat 1 = White (bot)

export const SIZE = 8;
export type Cell = 0 | 1 | null; // 0=Black, 1=White

export type Phase = "remove-black" | "remove-white" | "play";

export interface KonaneSettings { dummy?: string }

export interface KonaneState {
  grid: Grid<Cell>;
  turn: 0 | 1;
  phase: Phase;
  selected: { row: number; col: number } | null;
  jumpDir: { dr: number; dc: number } | null; // locked direction for chain jumps
  winner: 0 | 1 | null;
  rngSeed: number;
  settings: KonaneSettings;
}

export type KonaneAction =
  | { type: "remove"; at: { row: number; col: number } }
  | { type: "select"; at: { row: number; col: number } }
  | { type: "jump"; to: { row: number; col: number } }
  | { type: "end-chain" };

// Central squares eligible for Black's first removal
const CENTRAL = [
  { row: 3, col: 3 }, { row: 3, col: 4 }, { row: 4, col: 3 }, { row: 4, col: 4 },
];

export function initialState(seed: number, settings: KonaneSettings): KonaneState {
  const cells: Cell[] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      cells.push(((r + c) % 2 === 0) ? 0 : 1); // 0=Black on even sum, 1=White on odd sum
    }
  }
  return {
    grid: new Grid<Cell>(SIZE, SIZE, cells),
    turn: 0,
    phase: "remove-black",
    selected: null,
    jumpDir: null,
    winner: null,
    rngSeed: seed,
    settings,
  };
}

function inBounds(r: number, c: number): boolean { return r >= 0 && r < SIZE && c >= 0 && c < SIZE; }

// Get all jump destinations from pos (with optional locked direction)
export function jumpTargets(
  grid: Grid<Cell>,
  from: { row: number; col: number },
  seat: 0 | 1,
  lockedDir: { dr: number; dc: number } | null = null,
): { to: { row: number; col: number }; dir: { dr: number; dc: number } }[] {
  const opp = seat === 0 ? 1 : 0;
  const dirs = lockedDir ? [lockedDir] : [{ dr: 0, dc: 1 }, { dr: 0, dc: -1 }, { dr: 1, dc: 0 }, { dr: -1, dc: 0 }];
  const results: { to: { row: number; col: number }; dir: { dr: number; dc: number } }[] = [];

  for (const dir of dirs) {
    const mr = from.row + dir.dr;
    const mc = from.col + dir.dc;
    const tr = from.row + 2 * dir.dr;
    const tc = from.col + 2 * dir.dc;
    if (!inBounds(mr, mc) || !inBounds(tr, tc)) continue;
    if (grid.get({ row: mr, col: mc }) !== opp) continue;
    if (grid.get({ row: tr, col: tc }) !== null) continue;
    results.push({ to: { row: tr, col: tc }, dir });
  }
  return results;
}

export function hasAnyJump(grid: Grid<Cell>, seat: 0 | 1): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid.get({ row: r, col: c }) === seat) {
        if (jumpTargets(grid, { row: r, col: c }, seat).length > 0) return true;
      }
    }
  }
  return false;
}

// Bot minimax
interface BotState { grid: Grid<Cell>; turn: 0 | 1 }
type BotMove = { from: { row: number; col: number }; to: { row: number; col: number }; over: { row: number; col: number } };

function botMovesList(s: BotState): BotMove[] {
  const seat = s.turn;
  const moves: BotMove[] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (s.grid.get({ row: r, col: c }) !== seat) continue;
      for (const { to, dir } of jumpTargets(s.grid, { row: r, col: c }, seat)) {
        const over = { row: r + dir.dr, col: c + dir.dc };
        moves.push({ from: { row: r, col: c }, to, over });
      }
    }
  }
  return moves;
}

function applyBotMove(s: BotState, move: BotMove): BotState {
  let g = s.grid;
  g = g.set(move.from, null);
  g = g.set(move.over, null);
  g = g.set(move.to, s.turn);
  return { grid: g, turn: s.turn === 0 ? 1 : 0 };
}

function evaluateBot(s: BotState): number {
  const botMoves = botMovesList({ ...s, turn: 1 });
  const playerMoves = botMovesList({ ...s, turn: 0 });
  if (playerMoves.length === 0) return 1000;
  if (botMoves.length === 0) return -1000;
  return botMoves.length - playerMoves.length;
}

function botIsTerminal(s: BotState): boolean {
  return !hasAnyJump(s.grid, s.turn);
}

function getBotMove(state: KonaneState): BotMove | null {
  const bs: BotState = { grid: state.grid, turn: state.turn };
  const result = minimax<BotState, BotMove>(bs, {
    depth: 3,
    moves: botMovesList,
    apply: applyBotMove,
    isTerminal: botIsTerminal,
    evaluate: evaluateBot,
    maximizing: (s) => s.turn === 1,
  });
  return result.move;
}

function applyJumpToState(state: KonaneState, from: { row: number; col: number }, to: { row: number; col: number }, over: { row: number; col: number }, dir: { dr: number; dc: number }): KonaneState {
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  let g = state.grid;
  g = g.set(from, null);
  g = g.set(over, null);
  g = g.set(to, state.turn);

  // Check for chain
  const canChain = jumpTargets(g, to, state.turn, dir).length > 0;
  if (canChain) {
    return { ...state, grid: g, selected: to, jumpDir: dir, rngSeed: nextSeed };
  }

  // Check winner
  const nextTurn = (state.turn === 0 ? 1 : 0) as 0 | 1;
  const winner = !hasAnyJump(g, nextTurn) ? state.turn : null;
  return { ...state, grid: g, turn: nextTurn, selected: null, jumpDir: null, winner, rngSeed: nextSeed };
}

function runBotMoves(state: KonaneState): KonaneState {
  let s = state;
  let limit = 20;
  while (s.winner === null && s.turn === 1 && s.phase === "play" && limit-- > 0) {
    const move = getBotMove(s);
    if (!move) { // no moves — player wins
      s = { ...s, winner: 0 };
      break;
    }
    s = applyJumpToState(s, move.from, move.to, move.over, { dr: move.to.row - move.over.row, dc: move.to.col - move.over.col });
    if (s.jumpDir !== null) {
      // Bot continues chain in same direction if possible, otherwise ends
      const more = s.selected && jumpTargets(s.grid, s.selected, 1, s.jumpDir);
      if (!more || more.length === 0) {
        const winner2 = !hasAnyJump(s.grid, 0) ? 1 : null;
        s = { ...s, turn: 0, selected: null, jumpDir: null, winner: winner2 };
      }
    }
  }
  return s;
}

export function reducer(state: KonaneState, action: KonaneAction): KonaneState {
  if (state.winner !== null) return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  if (state.phase === "remove-black") {
    if (action.type !== "remove") return state;
    const { row, col } = action.at;
    if (!CENTRAL.some(c => c.row === row && c.col === col)) return state;
    if (state.grid.get({ row, col }) !== 0) return state;
    const newGrid = state.grid.set({ row, col }, null);
    return { ...state, grid: newGrid, phase: "remove-white", turn: 1, rngSeed: nextSeed };
  }

  if (state.phase === "remove-white") {
    if (action.type !== "remove") return state;
    const { row, col } = action.at;
    // White must remove a stone adjacent to the black gap
    const val = state.grid.get({ row, col });
    if (val !== 1) return state;
    // Check adjacency to a gap
    const dirs = [{ dr: 0, dc: 1 }, { dr: 0, dc: -1 }, { dr: 1, dc: 0 }, { dr: -1, dc: 0 }];
    const adjacentToGap = dirs.some(({ dr, dc }) => {
      const nr = row + dr; const nc = col + dc;
      return inBounds(nr, nc) && state.grid.get({ row: nr, col: nc }) === null;
    });
    if (!adjacentToGap) return state;
    const newGrid = state.grid.set({ row, col }, null);
    return { ...state, grid: newGrid, phase: "play", turn: 0, rngSeed: nextSeed };
  }

  // Play phase
  if (state.turn !== 0) return state;

  if (action.type === "end-chain") {
    if (state.jumpDir === null) return state;
    const winner = !hasAnyJump(state.grid, 1) ? 0 : null;
    const s: KonaneState = { ...state, turn: 1, selected: null, jumpDir: null, winner };
    if (s.winner !== null) return s;
    return runBotMoves(s);
  }

  if (action.type === "select") {
    if (state.jumpDir !== null && state.selected) return state; // locked in chain
    const val = state.grid.get(action.at);
    if (val !== 0) return state;
    return { ...state, selected: action.at };
  }

  if (action.type === "jump") {
    const from = state.selected;
    if (!from) return state;
    if (state.grid.get(from) !== 0) return state;
    const jumps = jumpTargets(state.grid, from, 0, state.jumpDir);
    const match = jumps.find(j => j.to.row === action.to.row && j.to.col === action.to.col);
    if (!match) return state;
    const over = { row: from.row + match.dir.dr, col: from.col + match.dir.dc };
    const next = applyJumpToState(state, from, action.to, over, match.dir);
    if (next.winner !== null) return next;
    if (next.jumpDir !== null) return next; // wait for chain continuation
    return runBotMoves(next);
  }

  return state;
}

export function isTerminal(state: KonaneState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}
