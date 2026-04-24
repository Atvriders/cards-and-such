import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Tumbleweed — Hex-grid placement game (simplified on 7×7 rhombus hex grid).
// Each turn, a player places a stack on any hex or replaces an enemy stack if
// they have greater line-of-sight count on that hex.
// Line-of-sight (LOS): number of same-color stacks visible in straight lines from the target hex.
// You may only place if LOS > 0 (or on the starting hex). Stack height = LOS value.
// Winner: most hexes controlled (by stack height) when neither player can move.
//
// Simplified: flat hex grid (no stack heights), standard 7-hex radius board.
// Each hex is either owned by a player, empty, or blocked.
// LOS count = count of own pieces reachable in 6 hex directions without obstruction.
// Place on empty if LOS > 0; replace opponent hex if own LOS > opponent's stack height.
// Bot: greedy (pick move that maximizes own territory).

export type Player = 0 | 1;
export type HexOwner = Player | null;

export interface HexCell {
  owner: HexOwner;
  stack: number; // stack height (= LOS when placed)
}

// Axial coordinates (q, r), radius 3 board = 37 hexes
export interface HexCoord { q: number; r: number }

export interface TumbleweedState {
  board: Map<string, HexCell>;
  turn: Player;
  winner: Player | null;
  passCount: [number, number]; // consecutive passes
  rngSeed: number;
  movesMade: number;
}

export type TumbleweedAction =
  | { type: "place"; q: number; r: number }
  | { type: "pass" };

export function hexKey(q: number, r: number): string { return `${q},${r}`; }

const RADIUS = 3;

export function onBoard(q: number, r: number): boolean {
  return Math.abs(q) <= RADIUS && Math.abs(r) <= RADIUS && Math.abs(q + r) <= RADIUS;
}

export function allHexes(): HexCoord[] {
  const result: HexCoord[] = [];
  for (let q = -RADIUS; q <= RADIUS; q++) {
    for (let r = -RADIUS; r <= RADIUS; r++) {
      if (onBoard(q, r)) result.push({ q, r });
    }
  }
  return result;
}

const HEX_DIRS: HexCoord[] = [
  { q: 1, r: 0 }, { q: -1, r: 0 },
  { q: 0, r: 1 }, { q: 0, r: -1 },
  { q: 1, r: -1 }, { q: -1, r: 1 },
];

function getCell(board: Map<string, HexCell>, q: number, r: number): HexCell | null {
  return board.get(hexKey(q, r)) ?? null;
}

// Count LOS: how many same-color pieces are visible from (q,r) in all 6 directions
export function countLOS(board: Map<string, HexCell>, q: number, r: number, player: Player): number {
  let count = 0;
  for (const d of HEX_DIRS) {
    let nq = q + d.q, nr = r + d.r;
    while (onBoard(nq, nr)) {
      const cell = getCell(board, nq, nr);
      if (cell === null || cell.owner === null) { nq += d.q; nr += d.r; continue; }
      if (cell.owner === player) { count++; }
      break; // blocked
    }
  }
  return count;
}

export function getLegalMoves(board: Map<string, HexCell>, player: Player): HexCoord[] {
  const opp: Player = player === 0 ? 1 : 0;
  const moves: HexCoord[] = [];
  for (const [key] of board.entries()) {
    const [qs, rs] = key.split(",").map(Number);
    const q = qs!, r = rs!;
    const cell = getCell(board, q, r);
    const los = countLOS(board, q, r, player);
    if (cell === null || cell.owner === null) {
      if (los > 0) moves.push({ q, r });
    } else if (cell.owner === opp) {
      if (los > cell.stack) moves.push({ q, r });
    }
    // Can't place on own cells (would need to replace with same or higher — skip for simplicity)
  }
  return moves;
}

function applyPlace(board: Map<string, HexCell>, q: number, r: number, player: Player): Map<string, HexCell> {
  const nb = new Map(board);
  const los = countLOS(board, q, r, player);
  nb.set(hexKey(q, r), { owner: player, stack: los });
  return nb;
}

function countOwned(board: Map<string, HexCell>, player: Player): number {
  let c = 0;
  for (const cell of board.values()) if (cell.owner === player) c++;
  return c;
}

function getBotMove(state: TumbleweedState): HexCoord | null {
  const moves = getLegalMoves(state.board, 1);
  if (moves.length === 0) return null;
  // Greedy: pick move that maximizes bot's territory
  let best: HexCoord | null = null;
  let bestScore = -Infinity;
  for (const m of moves) {
    const nb = applyPlace(state.board, m.q, m.r, 1);
    const score = countOwned(nb, 1) - countOwned(nb, 0);
    if (score > bestScore) { bestScore = score; best = m; }
  }
  return best;
}

export function initialState(seed: number): TumbleweedState {
  const board = new Map<string, HexCell>();
  for (const { q, r } of allHexes()) {
    board.set(hexKey(q, r), { owner: null, stack: 0 });
  }
  // Place starting pieces: human at (0, RADIUS), bot at (0, -RADIUS)
  board.set(hexKey(0, RADIUS), { owner: 0, stack: 1 });
  board.set(hexKey(0, -RADIUS), { owner: 1, stack: 1 });
  return { board, turn: 0, winner: null, passCount: [0, 0], rngSeed: seed, movesMade: 0 };
}

function checkEnd(board: Map<string, HexCell>, passCount: [number, number]): Player | null {
  if (passCount[0] > 0 && passCount[1] > 0) {
    // Both passed: count territory
    const h = countOwned(board, 0);
    const b = countOwned(board, 1);
    return h > b ? 0 : b > h ? 1 : 0; // tie goes to human
  }
  return null;
}

function runBot(state: TumbleweedState): TumbleweedState {
  let s = state;
  while (s.turn === 1 && s.winner === null) {
    const rng = mulberry32(s.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const mv = getBotMove(s);
    if (!mv) {
      const newPass: [number, number] = [s.passCount[0], s.passCount[1] + 1];
      const winner = checkEnd(s.board, newPass);
      s = { ...s, passCount: newPass, turn: 0, winner, movesMade: s.movesMade + 1, rngSeed: nextSeed };
      break;
    }
    const nb = applyPlace(s.board, mv.q, mv.r, 1);
    s = { ...s, board: nb, passCount: [s.passCount[0], 0], turn: 0, movesMade: s.movesMade + 1, rngSeed: nextSeed };
    break;
  }
  return s;
}

export function reducer(state: TumbleweedState, action: TumbleweedAction): TumbleweedState {
  if (state.winner !== null || state.turn !== 0) return state;

  if (action.type === "pass") {
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const newPass: [number, number] = [state.passCount[0] + 1, state.passCount[1]];
    const winner = checkEnd(state.board, newPass);
    let next: TumbleweedState = { ...state, passCount: newPass, turn: 1, winner, movesMade: state.movesMade + 1, rngSeed: nextSeed };
    if (winner !== null) return next;
    next = runBot(next);
    return next;
  }

  if (action.type === "place") {
    const { q, r } = action;
    if (!onBoard(q, r)) return state;
    const legal = getLegalMoves(state.board, 0);
    if (!legal.some((m) => m.q === q && m.r === r)) return state;
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const nb = applyPlace(state.board, q, r, 0);
    let next: TumbleweedState = { ...state, board: nb, passCount: [0, state.passCount[1]], turn: 1, winner: null, movesMade: state.movesMade + 1, rngSeed: nextSeed };
    next = runBot(next);
    return next;
  }

  return state;
}

export function isTerminal(state: TumbleweedState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}
