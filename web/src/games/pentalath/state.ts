import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Pentalath — Hex board (radius 5, 61 hexes). Place stones.
// Win: form a group of 5+ connected stones (orthogonally on hex = 6 neighbors).
// Capture: if you surround an opponent's group (all adjacent cells occupied by you or board edge), remove it.
// Simplified: we use axial hex coordinates, radius 5 board.
// Bot: greedy (place to maximize own largest group, break opponent's near-wins).

export type Player = 0 | 1;
export type HexOwner = Player | null;

export interface PentalathState {
  board: Map<string, HexOwner>;
  turn: Player;
  winner: Player | null;
  rngSeed: number;
  movesMade: number;
}

export type PentalathAction = { type: "place"; q: number; r: number };

export function hexKey(q: number, r: number): string { return `${q},${r}`; }

const RADIUS = 5;

export function onBoard(q: number, r: number): boolean {
  return Math.abs(q) <= RADIUS && Math.abs(r) <= RADIUS && Math.abs(q + r) <= RADIUS;
}

export function allHexes(): Array<{ q: number; r: number }> {
  const result: Array<{ q: number; r: number }> = [];
  for (let q = -RADIUS; q <= RADIUS; q++) {
    for (let r = -RADIUS; r <= RADIUS; r++) {
      if (onBoard(q, r)) result.push({ q, r });
    }
  }
  return result;
}

export const HEX_DIRS = [
  { q: 1, r: 0 }, { q: -1, r: 0 },
  { q: 0, r: 1 }, { q: 0, r: -1 },
  { q: 1, r: -1 }, { q: -1, r: 1 },
];

function neighbors(q: number, r: number): Array<{ q: number; r: number }> {
  return HEX_DIRS.map((d) => ({ q: q + d.q, r: r + d.r })).filter((n) => onBoard(n.q, n.r));
}

// Get connected group containing (q,r) for a player
function getGroup(board: Map<string, HexOwner>, q: number, r: number, player: Player): Set<string> {
  const group = new Set<string>();
  const queue = [hexKey(q, r)];
  group.add(hexKey(q, r));
  while (queue.length > 0) {
    const key = queue.shift()!;
    const [qs, rs] = key.split(",").map(Number);
    for (const n of neighbors(qs!, rs!)) {
      const nk = hexKey(n.q, n.r);
      if (!group.has(nk) && board.get(nk) === player) {
        group.add(nk);
        queue.push(nk);
      }
    }
  }
  return group;
}

// Check if a group is surrounded (all adjacent cells of the group are owned by opponent or off board)
function isSurrounded(board: Map<string, HexOwner>, group: Set<string>, player: Player): boolean {
  const opp: Player = player === 0 ? 1 : 0;
  for (const key of group) {
    const [qs, rs] = key.split(",").map(Number);
    for (const n of neighbors(qs!, rs!)) {
      const nk = hexKey(n.q, n.r);
      if (!group.has(nk)) {
        const nv = board.get(nk);
        if (nv !== opp) return false; // empty or out-of-bounds neighbor
      }
    }
  }
  return true;
}

// After placing for player at (q,r), check and remove surrounded opponent groups
function removeSurrounded(board: Map<string, HexOwner>, player: Player): Map<string, HexOwner> {
  const opp: Player = player === 0 ? 1 : 0;
  const nb = new Map(board);
  const visited = new Set<string>();
  for (const [key, owner] of nb.entries()) {
    if (owner !== opp || visited.has(key)) continue;
    const [qs, rs] = key.split(",").map(Number);
    const group = getGroup(nb, qs!, rs!, opp);
    for (const k of group) visited.add(k);
    if (isSurrounded(nb, group, opp)) {
      for (const k of group) nb.set(k, null);
    }
  }
  return nb;
}

// Check if player has 5+ in a row (connected group of 5+)
export function hasWon(board: Map<string, HexOwner>, player: Player): boolean {
  const visited = new Set<string>();
  for (const [key, owner] of board.entries()) {
    if (owner !== player || visited.has(key)) continue;
    const [qs, rs] = key.split(",").map(Number);
    const group = getGroup(board, qs!, rs!, player);
    for (const k of group) visited.add(k);
    if (group.size >= 5) return true;
  }
  return false;
}

function largestGroup(board: Map<string, HexOwner>, player: Player): number {
  const visited = new Set<string>();
  let max = 0;
  for (const [key, owner] of board.entries()) {
    if (owner !== player || visited.has(key)) continue;
    const [qs, rs] = key.split(",").map(Number);
    const group = getGroup(board, qs!, rs!, player);
    for (const k of group) visited.add(k);
    if (group.size > max) max = group.size;
  }
  return max;
}

function getBotMove(state: PentalathState): { q: number; r: number } | null {
  const rng = mulberry32(state.rngSeed);
  const empties: Array<{ q: number; r: number }> = [];
  for (const [key, owner] of state.board.entries()) {
    if (owner !== null) continue;
    const [qs, rs] = key.split(",").map(Number);
    empties.push({ q: qs!, r: rs! });
  }
  if (empties.length === 0) return null;

  // Check for immediate win
  for (const m of empties) {
    const nb = new Map(state.board);
    nb.set(hexKey(m.q, m.r), 1);
    const nb2 = removeSurrounded(nb, 1);
    if (hasWon(nb2, 1)) return m;
  }

  // Block human near-win (4 in group)
  for (const m of empties) {
    const nb = new Map(state.board);
    nb.set(hexKey(m.q, m.r), 0);
    if (hasWon(nb, 0)) return m;
  }

  // Greedy: maximize own largest group
  let best: { q: number; r: number } | null = null;
  let bestScore = -Infinity;
  for (const m of empties) {
    const nb = new Map(state.board);
    nb.set(hexKey(m.q, m.r), 1);
    const nb2 = removeSurrounded(nb, 1);
    const score = largestGroup(nb2, 1) * 10 - largestGroup(nb2, 0);
    if (score > bestScore) { bestScore = score; best = m; }
  }
  if (best) return best;

  // Random fallback
  const idx = Math.floor(rng() * empties.length);
  return empties[idx]!;
}

export function initialState(seed: number): PentalathState {
  const board = new Map<string, HexOwner>();
  for (const { q, r } of allHexes()) board.set(hexKey(q, r), null);
  return { board, turn: 0, winner: null, rngSeed: seed, movesMade: 0 };
}

function runBot(state: PentalathState): PentalathState {
  let s = state;
  while (s.turn === 1 && s.winner === null) {
    const rng = mulberry32(s.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const mv = getBotMove(s);
    if (!mv) return { ...s, winner: 0, rngSeed: nextSeed };
    const nb = new Map(s.board);
    nb.set(hexKey(mv.q, mv.r), 1);
    const nb2 = removeSurrounded(nb, 1);
    const winner = hasWon(nb2, 1) ? 1 : null;
    s = { ...s, board: nb2, turn: 0, winner, movesMade: s.movesMade + 1, rngSeed: nextSeed };
    break;
  }
  return s;
}

export function reducer(state: PentalathState, action: PentalathAction): PentalathState {
  if (state.winner !== null || state.turn !== 0) return state;
  if (action.type === "place") {
    const { q, r } = action;
    if (!onBoard(q, r) || state.board.get(hexKey(q, r)) !== null) return state;
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const nb = new Map(state.board);
    nb.set(hexKey(q, r), 0);
    const nb2 = removeSurrounded(nb, 0);
    const winner = hasWon(nb2, 0) ? 0 : null;
    let next: PentalathState = { ...state, board: nb2, turn: 1, winner, movesMade: state.movesMade + 1, rngSeed: nextSeed };
    if (winner !== null) return next;
    next = runBot(next);
    return next;
  }
  return state;
}

export function isTerminal(state: PentalathState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}
