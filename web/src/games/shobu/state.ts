import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { minimax } from "../../engines/grid/minimax.js";

// Shobu — 4 boards (each 4×4), 16 stones per player.
// Two boards per player's "home side" (left/right), mirrored for opponent.
// Each turn:
//   1. PASSIVE move: move one stone on either of your own home boards (non-capturing).
//   2. AGGRESSIVE move: on any board on the OPPOSITE side, make the identical move
//      (same direction and distance), possibly pushing/capturing opponent stones.
//
// Boards: 0=top-left, 1=top-right (bot home), 2=bottom-left, 3=bottom-right (human home).
// Human home = boards 2 and 3 (bottom); bot home = boards 0 and 1 (top).
// Aggressive boards for human: boards 0 and 1 (top = bot's side).
// Aggressive boards for bot: boards 2 and 3 (bottom = human's side).
//
// Stone pushed off the edge of a board is removed.
// Win: push all opponent stones off any single board.

export type Player = 0 | 1;
export type Cell = Player | null;

// Each board is 4×4 (16 cells, row-major)
export interface ShobuState {
  boards: [Cell[], Cell[], Cell[], Cell[]]; // 4 boards
  turn: Player;
  phase: "passive" | "aggressive";
  passiveBoard: number | null;
  passiveFrom: number | null;
  passiveDr: number | null; // direction row
  passiveDc: number | null; // direction col
  passiveDist: number | null;
  selected: number | null; // for aggressive selection
  winner: Player | null;
  rngSeed: number;
  movesMade: number;
}

export type ShobuAction =
  | { type: "passive-select"; boardIdx: number; from: number }
  | { type: "passive-move"; to: number }
  | { type: "aggressive-select"; boardIdx: number; from: number }
  | { type: "aggressive-move"; to: number }
  | { type: "reset-phase" };

function homeBoards(player: Player): number[] {
  return player === 0 ? [2, 3] : [0, 1];
}
function aggressiveBoards(player: Player): number[] {
  return player === 0 ? [0, 1] : [2, 3];
}

function rcOf(idx: number): [number, number] { return [Math.floor(idx / 4), idx % 4]; }
function idxOf(r: number, c: number): number { return r * 4 + c; }
function inBounds(r: number, c: number): boolean { return r >= 0 && r < 4 && c >= 0 && c < 4; }

// Get all passive move (from, to, dr, dc, dist) on a home board (no capture)
export interface PassiveMove { boardIdx: number; from: number; to: number; dr: number; dc: number; dist: number }
export interface AggressiveMove { boardIdx: number; from: number; to: number }

export function getPassiveMoves(board: Cell[], boardIdx: number, player: Player): PassiveMove[] {
  const moves: PassiveMove[] = [];
  const dirs: [number, number][] = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  for (let i = 0; i < 16; i++) {
    if (board[i] !== player) continue;
    const [r, c] = rcOf(i);
    for (const [dr, dc] of dirs) {
      for (let dist = 1; dist <= 3; dist++) {
        const nr = r + dr * dist, nc = c + dc * dist;
        if (!inBounds(nr, nc)) break;
        const ni = idxOf(nr, nc);
        if (board[ni] !== null) break; // blocked
        moves.push({ boardIdx, from: i, to: ni, dr, dc, dist });
      }
    }
  }
  return moves;
}

// Apply aggressive move (same direction/distance) on a different board.
// Returns null if illegal (own piece in path, or pushing too many).
export function tryAggressive(
  board: Cell[], from: number, dr: number, dc: number, dist: number, player: Player
): Cell[] | null {
  const opp: Player = player === 0 ? 1 : 0;
  const [r, c] = rcOf(from);
  if (!inBounds(r, c) || board[from] !== player) return null;

  // Trace the path
  const path: number[] = [];
  for (let d = 1; d <= dist; d++) {
    const nr = r + dr * d, nc = c + dc * d;
    // If out of bounds: the stone falls off
    if (!inBounds(nr, nc)) {
      path.push(-1); // off board
    } else {
      path.push(idxOf(nr, nc));
    }
  }

  // Check legality: cannot push our own piece; can push at most 1 opponent
  let oppCount = 0;
  for (let d = 1; d <= dist; d++) {
    const ni = path[d - 1]!;
    if (ni === -1) continue;
    const cell = board[ni];
    if (cell === player) return null; // own piece blocks
    if (cell === opp) oppCount++;
    if (oppCount > 1) return null; // can't push 2+ opponents
  }

  // Simulate
  const nb = [...board];
  // Move the pushing stone
  nb[from] = null;
  // Shift everything forward; handle chain carefully
  // Work backwards from furthest
  const pushing = nb; // alias
  // Start from front of path
  for (let d = dist; d >= 1; d--) {
    const ni = path[d - 1]!;
    const prev = d === 1 ? from : path[d - 2]!;
    if (ni === -1) {
      // stone at prev falls off
      pushing[prev] = null;
    } else {
      pushing[ni] = pushing[prev]!;
      pushing[prev] = null;
    }
  }
  // Place moving stone at first path cell
  const dest = path[0]!;
  if (dest === -1) {
    nb[from] = null; // falls off
  } else {
    nb[dest] = player;
  }
  return nb;
}

function countPieces(board: Cell[], player: Player): number {
  return board.filter((c) => c === player).length;
}

function checkWinner(boards: [Cell[], Cell[], Cell[], Cell[]]): Player | null {
  for (const b of boards) {
    if (countPieces(b, 0) === 0) return 1;
    if (countPieces(b, 1) === 0) return 0;
  }
  return null;
}

interface BotState {
  boards: [Cell[], Cell[], Cell[], Cell[]];
  turn: Player;
}
interface BotFullMove {
  passiveBoard: number; passiveFrom: number; passiveTo: number;
  aggrBoard: number; aggrFrom: number;
  dr: number; dc: number; dist: number;
}

function allBotMoves(boards: [Cell[], Cell[], Cell[], Cell[]], player: Player): BotFullMove[] {
  const moves: BotFullMove[] = [];
  for (const hb of homeBoards(player)) {
    const passives = getPassiveMoves(boards[hb]!, hb, player);
    for (const pm of passives) {
      for (const ab of aggressiveBoards(player)) {
        // Find matching piece on aggressive board
        for (let i = 0; i < 16; i++) {
          if (boards[ab]![i] !== player) continue;
          const result = tryAggressive(boards[ab]!, i, pm.dr, pm.dc, pm.dist, player);
          if (result !== null) {
            moves.push({
              passiveBoard: hb, passiveFrom: pm.from, passiveTo: pm.to,
              aggrBoard: ab, aggrFrom: i,
              dr: pm.dr, dc: pm.dc, dist: pm.dist,
            });
          }
        }
      }
    }
  }
  return moves;
}

function evalShobu(boards: [Cell[], Cell[], Cell[], Cell[]]): number {
  let score = 0;
  for (const b of boards) {
    score += countPieces(b, 1) - countPieces(b, 0);
  }
  return score * 10;
}

function getBotMove(state: ShobuState): BotFullMove | null {
  const res = minimax<BotState, BotFullMove>(
    { boards: state.boards, turn: 1 },
    {
      depth: 2,
      moves(s) { return allBotMoves(s.boards, s.turn); },
      apply(s, m) {
        const nb = s.boards.map((b) => [...b]) as [Cell[], Cell[], Cell[], Cell[]];
        // Apply passive
        nb[m.passiveBoard]![m.passiveFrom] = null;
        nb[m.passiveBoard]![m.passiveTo] = s.turn;
        // Apply aggressive
        const aggrResult = tryAggressive(nb[m.aggrBoard]!, m.aggrFrom, m.dr, m.dc, m.dist, s.turn);
        if (aggrResult) nb[m.aggrBoard] = aggrResult;
        return { boards: nb, turn: s.turn === 0 ? 1 : 0 };
      },
      isTerminal(s) { return checkWinner(s.boards) !== null; },
      evaluate(s) { return evalShobu(s.boards); },
      maximizing(s) { return s.turn === 1; },
    }
  );
  return res.move;
}

export function initialState(seed: number): ShobuState {
  // Each board: human (0) on bottom 2 rows (rows 2-3), bot (1) on top 2 rows (rows 0-1)
  function makeBoard(): Cell[] {
    const b: Cell[] = new Array(16).fill(null);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) b[idxOf(r, c)] = 1; // bot top
    for (let r = 2; r < 4; r++) for (let c = 0; c < 4; c++) b[idxOf(r, c)] = 0; // human bottom
    return b;
  }
  return {
    boards: [makeBoard(), makeBoard(), makeBoard(), makeBoard()],
    turn: 0,
    phase: "passive",
    passiveBoard: null, passiveFrom: null, passiveDr: null, passiveDc: null, passiveDist: null,
    selected: null,
    winner: null,
    rngSeed: seed,
    movesMade: 0,
  };
}

function runBot(state: ShobuState): ShobuState {
  let s = state;
  while (s.turn === 1 && s.winner === null) {
    const rng = mulberry32(s.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const mv = getBotMove(s);
    if (!mv) return { ...s, winner: 0, rngSeed: nextSeed };
    const nb = s.boards.map((b) => [...b]) as [Cell[], Cell[], Cell[], Cell[]];
    nb[mv.passiveBoard]![mv.passiveFrom] = null;
    nb[mv.passiveBoard]![mv.passiveTo] = 1;
    const aggrResult = tryAggressive(nb[mv.aggrBoard]!, mv.aggrFrom, mv.dr, mv.dc, mv.dist, 1);
    if (aggrResult) nb[mv.aggrBoard] = aggrResult;
    const winner = checkWinner(nb);
    s = {
      ...s, boards: nb, turn: 0, phase: "passive",
      passiveBoard: null, passiveFrom: null, passiveDr: null, passiveDc: null, passiveDist: null,
      selected: null, winner, movesMade: s.movesMade + 1, rngSeed: nextSeed,
    };
    break;
  }
  return s;
}

export function reducer(state: ShobuState, action: ShobuAction): ShobuState {
  if (state.winner !== null || state.turn !== 0) return state;

  if (action.type === "reset-phase") {
    return { ...state, phase: "passive", passiveBoard: null, passiveFrom: null, passiveDr: null, passiveDc: null, passiveDist: null, selected: null };
  }

  if (action.type === "passive-select") {
    if (!homeBoards(0).includes(action.boardIdx)) return state;
    if (state.boards[action.boardIdx]![action.from] !== 0) return state;
    return { ...state, passiveBoard: action.boardIdx, passiveFrom: action.from };
  }

  if (action.type === "passive-move") {
    if (state.passiveBoard === null || state.passiveFrom === null) return state;
    const board = state.boards[state.passiveBoard]!;
    const [fr, fc] = rcOf(state.passiveFrom);
    const [tr, tc] = rcOf(action.to);
    if (board[action.to] !== null) return state;
    const dr = Math.sign(tr - fr);
    const dc = Math.sign(tc - fc);
    const dist = Math.max(Math.abs(tr - fr), Math.abs(tc - fc));
    if (dist === 0 || (dr === 0 && dc === 0)) return state;
    // Validate straight line
    if (dr !== 0 && dc !== 0 && Math.abs(tr - fr) !== Math.abs(tc - fc)) return state;
    // Validate path is clear
    for (let d = 1; d < dist; d++) {
      const nr = fr + dr * d, nc = fc + dc * d;
      if (!inBounds(nr, nc) || board[idxOf(nr, nc)] !== null) return state;
    }
    const nb = state.boards.map((b) => [...b]) as [Cell[], Cell[], Cell[], Cell[]];
    nb[state.passiveBoard]![state.passiveFrom] = null;
    nb[state.passiveBoard]![action.to] = 0;
    return { ...state, boards: nb, phase: "aggressive", passiveDr: dr, passiveDc: dc, passiveDist: dist };
  }

  if (action.type === "aggressive-select") {
    if (!aggressiveBoards(0).includes(action.boardIdx)) return state;
    if (state.boards[action.boardIdx]![action.from] !== 0) return state;
    return { ...state, selected: action.from, passiveBoard: action.boardIdx };
  }

  if (action.type === "aggressive-move") {
    if (state.selected === null || state.passiveDr === null || state.passiveDc === null || state.passiveDist === null) return state;
    const aggrBoardIdx = state.passiveBoard!;
    if (!aggressiveBoards(0).includes(aggrBoardIdx)) return state;
    const aggrBoard = state.boards[aggrBoardIdx]!;
    const result = tryAggressive(aggrBoard, state.selected, state.passiveDr, state.passiveDc, state.passiveDist, 0);
    if (!result) return state;
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const nb = state.boards.map((b) => [...b]) as [Cell[], Cell[], Cell[], Cell[]];
    nb[aggrBoardIdx] = result;
    const winner = checkWinner(nb);
    let next: ShobuState = {
      ...state, boards: nb, turn: 1, phase: "passive",
      passiveBoard: null, passiveFrom: null, passiveDr: null, passiveDc: null, passiveDist: null,
      selected: null, winner, movesMade: state.movesMade + 1, rngSeed: nextSeed,
    };
    if (winner !== null) return next;
    next = runBot(next);
    return next;
  }

  return state;
}

export function isTerminal(state: ShobuState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}
