import { minimax } from "../../engines/grid/minimax.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Abalone: hexagonal board (61 cells), 14 marbles each.
// Move 1, 2, or 3 marbles in a line. Push opponent if outnumbered.
// First to push 6 opponent marbles off board wins.
//
// We represent the board with axial coordinates (q, r).
// Standard board is a hexagon of radius 4 (so q+r in range [-4,4]).

// Axial coordinate
export interface HexCoord { q: number; r: number }

export type Cell = 0 | 1 | null; // 0 = human (black), 1 = bot (white)

export interface AbaloneSettings {
  startPosition: "standard" | "belgian_daisy";
}

export interface AbaloneState {
  settings: AbaloneSettings;
  board: Map<string, Cell>; // key = hexKey(q,r), value = marble or null
  turn: 0 | 1;
  pushed: [number, number]; // marbles pushed off: [human's off count, bot's off count]
  winner: 0 | 1 | null;
  // UI state: selected marbles for human
  selected: HexCoord[];
  movesMade: number;
  rngSeed: number;
}

export type AbaloneAction =
  | { type: "select"; coord: HexCoord }
  | { type: "move"; dir: number }; // dir 0-5

export function hexKey(q: number, r: number): string {
  return `${q},${r}`;
}

// 6 hex directions in axial coordinates
export const HEX_DIRS: readonly HexCoord[] = [
  { q: 1, r: 0 }, { q: -1, r: 0 },
  { q: 0, r: 1 }, { q: 0, r: -1 },
  { q: 1, r: -1 }, { q: -1, r: 1 },
];

// Is position on board (within radius 4)
export function onBoard(q: number, r: number): boolean {
  return Math.abs(q) <= 4 && Math.abs(r) <= 4 && Math.abs(q + r) <= 4;
}

function add(a: HexCoord, b: HexCoord): HexCoord {
  return { q: a.q + b.q, r: a.r + b.r };
}
function scale(a: HexCoord, n: number): HexCoord {
  return { q: a.q * n, r: a.r * n };
}

function getCell(board: Map<string, Cell>, q: number, r: number): Cell {
  if (!onBoard(q, r)) return null;
  return board.get(hexKey(q, r)) ?? null;
}

function setCell(board: Map<string, Cell>, q: number, r: number, value: Cell): Map<string, Cell> {
  const nb = new Map(board);
  if (onBoard(q, r)) {
    nb.set(hexKey(q, r), value);
  }
  return nb;
}

// Build all valid cells on board (61 cells for radius 4)
function allCells(): HexCoord[] {
  const result: HexCoord[] = [];
  for (let q = -4; q <= 4; q++) {
    for (let r = -4; r <= 4; r++) {
      if (onBoard(q, r)) result.push({ q, r });
    }
  }
  return result;
}

// Standard starting position
function standardPosition(): Map<string, Cell> {
  const board = new Map<string, Cell>();
  for (const c of allCells()) board.set(hexKey(c.q, c.r), null);

  // Human (0=black): top rows r=-4 to r=-3, and row r=-2 cols -1,0,1
  const blackCells: HexCoord[] = [];
  // Row r=-4: q=0..4 (5 cells)
  for (let q = 0; q <= 4; q++) if (onBoard(q, -4)) blackCells.push({ q, r: -4 });
  // Row r=-3: q=-1..4 → filter by board (6 cells)
  for (let q = -1; q <= 4; q++) if (onBoard(q, -3)) blackCells.push({ q, r: -3 });
  // Row r=-2 center: q=-1,0,1
  for (const q of [-1, 0, 1]) if (onBoard(q, -2)) blackCells.push({ q, r: -2 });

  for (const c of blackCells.slice(0, 14)) board.set(hexKey(c.q, c.r), 0);

  // Bot (1=white): bottom rows r=4 to r=3, and row r=2 center
  const whiteCells: HexCoord[] = [];
  for (let q = -4; q <= 0; q++) if (onBoard(q, 4)) whiteCells.push({ q, r: 4 });
  for (let q = -4; q <= 1; q++) if (onBoard(q, 3)) whiteCells.push({ q, r: 3 });
  for (const q of [-1, 0, 1]) if (onBoard(q, 2)) whiteCells.push({ q, r: 2 });

  for (const c of whiteCells.slice(0, 14)) board.set(hexKey(c.q, c.r), 1);

  return board;
}

// Belgian daisy starting position
function belgianDaisyPosition(): Map<string, Cell> {
  const board = new Map<string, Cell>();
  for (const c of allCells()) board.set(hexKey(c.q, c.r), null);

  // Two "daisy" clusters
  const blackBase: HexCoord[] = [
    { q: -2, r: -2 }, { q: -1, r: -2 }, { q: 0, r: -2 },
    { q: -3, r: -1 }, { q: -2, r: -1 }, { q: -1, r: -1 }, { q: 0, r: -1 },
    { q: -3, r: 0 }, { q: -2, r: 0 }, { q: -1, r: 0 },
    { q: 1, r: -3 }, { q: 2, r: -3 }, { q: 1, r: -2 }, { q: 2, r: -4 },
  ];

  const whiteBase: HexCoord[] = [
    { q: 2, r: 0 }, { q: 1, r: 0 }, { q: 0, r: 0 },
    { q: 3, r: -1 }, { q: 2, r: -1 }, { q: 1, r: -1 }, { q: 0, r: 1 },
    { q: 3, r: 0 }, { q: 2, r: 1 }, { q: 1, r: 2 },
    { q: -1, r: 2 }, { q: -2, r: 3 }, { q: -1, r: 3 }, { q: -2, r: 4 },
  ];

  for (const c of blackBase.slice(0, 14)) {
    if (onBoard(c.q, c.r)) board.set(hexKey(c.q, c.r), 0);
  }
  for (const c of whiteBase.slice(0, 14)) {
    if (onBoard(c.q, c.r)) board.set(hexKey(c.q, c.r), 1);
  }
  return board;
}

// Sort marbles in a direction (to determine leading marble for push)
function sortMarbles(marbles: HexCoord[], dir: HexCoord): HexCoord[] {
  return [...marbles].sort((a, b) => {
    const da = a.q * dir.q + a.r * dir.r;
    const db = b.q * dir.q + b.r * dir.r;
    return db - da; // descending: leading marble first
  });
}

// Check if selected marbles are collinear in a given direction
function areCollinear(marbles: HexCoord[], dir: HexCoord): boolean {
  if (marbles.length <= 1) return true;
  const sorted = sortMarbles(marbles, dir);
  for (let i = 0; i < sorted.length - 1; i++) {
    const diff = { q: sorted[i]!.q - sorted[i + 1]!.q, r: sorted[i]!.r - sorted[i + 1]!.r };
    if (diff.q !== dir.q || diff.r !== dir.r) return false;
  }
  return true;
}

// Is this direction (or its opposite) consistent with the line of marbles?
function marbleDir(marbles: HexCoord[]): HexCoord | null {
  if (marbles.length <= 1) return null;
  const diff = { q: marbles[1]!.q - marbles[0]!.q, r: marbles[1]!.r - marbles[0]!.r };
  // Normalise to one of 6 directions
  for (const d of HEX_DIRS) {
    if (d.q === diff.q && d.r === diff.r) return d;
    if (-d.q === diff.q && -d.r === diff.r) return d;
  }
  return null;
}

// Check if a move (marbles + direction) is legal
interface MoveResult {
  ok: boolean;
  newBoard?: Map<string, Cell>;
  pushed?: 0 | 1 | null; // which player had a marble pushed off
}

function tryMove(
  board: Map<string, Cell>,
  marbles: HexCoord[],
  dir: number,
  seat: 0 | 1,
): MoveResult {
  const d = HEX_DIRS[dir]!;
  const opp: 0 | 1 = seat === 0 ? 1 : 0;

  if (marbles.length === 0 || marbles.length > 3) return { ok: false };
  // All marbles must belong to seat
  if (marbles.some((m) => getCell(board, m.q, m.r) !== seat)) return { ok: false };

  // Inline move (direction parallel to marble line, or single marble)
  const mDir = marbleDir(marbles);
  const isInline = marbles.length === 1 || (mDir !== null && (
    (mDir.q === d.q && mDir.r === d.r) || (-mDir.q === d.q && -mDir.r === d.r)
  ));
  // Verify collinearity
  if (!isInline) {
    // Broadside move: marbles move perpendicular to their line
    if (marbles.length > 1 && !areCollinear(marbles, mDir ?? d)) return { ok: false };
    // All destination cells must be empty
    for (const m of marbles) {
      const dest = add(m, d);
      if (!onBoard(dest.q, dest.r) || getCell(board, dest.q, dest.r) !== null) return { ok: false };
    }
    // Apply broadside move
    let nb = new Map(board);
    for (const m of marbles) nb = setCell(nb, m.q, m.r, null);
    for (const m of marbles) nb = setCell(nb, add(m, d).q, add(m, d).r, seat);
    return { ok: true, newBoard: nb, pushed: null };
  }

  // Inline move
  const sorted = sortMarbles(marbles, d); // leading marble first
  const lead = sorted[0]!;
  const next1 = add(lead, d);

  // Check what's ahead
  const v1 = onBoard(next1.q, next1.r) ? getCell(board, next1.q, next1.r) : undefined;

  if (v1 === seat) return { ok: false }; // own marble blocking
  if (v1 === null) {
    // Simple inline move
    let nb = new Map(board);
    for (const m of marbles) nb = setCell(nb, m.q, m.r, null);
    for (const m of sorted) nb = setCell(nb, add(m, d).q, add(m, d).r, seat);
    return { ok: true, newBoard: nb, pushed: null };
  }
  if (v1 === undefined) return { ok: false }; // lead marble is off board
  // v1 === opp: push attempt
  // Count opponent marbles ahead
  let oppCount = 0;
  const oppChain: HexCoord[] = [];
  let check = next1;
  while (true) {
    const cv = onBoard(check.q, check.r) ? getCell(board, check.q, check.r) : undefined;
    if (cv !== opp) break;
    oppChain.push(check);
    oppCount++;
    check = add(check, d);
    if (oppCount >= marbles.length) break; // can't push as many or more
  }
  if (oppCount >= marbles.length) return { ok: false }; // can't push

  // Check what's behind the opponent chain
  const afterOpp = check;
  const afterV = onBoard(afterOpp.q, afterOpp.r) ? getCell(board, afterOpp.q, afterOpp.r) : undefined;
  if (afterV !== null && afterV !== undefined) return { ok: false }; // not empty or edge

  // Legal push
  let nb = new Map(board);
  for (const m of marbles) nb = setCell(nb, m.q, m.r, null);
  for (const m of sorted) nb = setCell(nb, add(m, d).q, add(m, d).r, seat);
  // Move opponent chain forward
  for (const oc of oppChain) nb = setCell(nb, oc.q, oc.r, null);
  let pushedOff: 0 | 1 | null = null;
  for (const oc of oppChain) {
    const dest = add(oc, d);
    if (onBoard(dest.q, dest.r)) {
      nb = setCell(nb, dest.q, dest.r, opp);
    } else {
      pushedOff = opp; // marble pushed off board
    }
  }
  return { ok: true, newBoard: nb, pushed: pushedOff };
}

// Count marbles on board for a player
function countOnBoard(board: Map<string, Cell>, seat: 0 | 1): number {
  let count = 0;
  for (const v of board.values()) if (v === seat) count++;
  return count;
}

// Central position bonus (distance from center 0,0)
function centralScore(board: Map<string, Cell>, seat: 0 | 1): number {
  let score = 0;
  const opp: 0 | 1 = seat === 0 ? 1 : 0;
  for (const [key, v] of board.entries()) {
    const [qs, rs] = key.split(",").map(Number);
    const dist = (Math.abs(qs!) + Math.abs(rs!) + Math.abs(qs! + rs!)) / 2;
    if (v === seat) score -= dist;
    else if (v === opp) score += dist;
  }
  return score;
}

function evalAbalone(
  board: Map<string, Cell>,
  pushed: [number, number],
  seat: 0 | 1,
): number {
  const opp: 0 | 1 = seat === 0 ? 1 : 0;
  const myPushed = pushed[opp]; // opponent's marbles we've pushed off
  const oppPushed = pushed[seat]; // our marbles they've pushed off
  return (myPushed - oppPushed) * 200 + centralScore(board, seat) * 5;
}

// Get all legal moves for a player as (marbles, dir) pairs
interface AbaloneMove {
  marbles: HexCoord[];
  dir: number;
}

function allLegalMoves(board: Map<string, Cell>, seat: 0 | 1): AbaloneMove[] {
  const allM: HexCoord[] = [];
  for (const [key, v] of board.entries()) {
    if (v !== seat) continue;
    const [qs, rs] = key.split(",").map(Number);
    allM.push({ q: qs!, r: rs! });
  }

  const moves: AbaloneMove[] = [];

  // Single marble moves
  for (const m of allM) {
    for (let dir = 0; dir < 6; dir++) {
      if (tryMove(board, [m], dir, seat).ok) {
        moves.push({ marbles: [m], dir });
      }
    }
  }

  // 2-marble moves: find adjacent pairs
  for (let i = 0; i < allM.length; i++) {
    for (let j = i + 1; j < allM.length; j++) {
      const mi = allM[i]!;
      const mj = allM[j]!;
      // Check if adjacent
      const diff = { q: mj.q - mi.q, r: mj.r - mi.r };
      const isAdj = HEX_DIRS.some((d) => d.q === diff.q && d.r === diff.r);
      if (!isAdj) continue;
      for (let dir = 0; dir < 6; dir++) {
        if (tryMove(board, [mi, mj], dir, seat).ok) {
          moves.push({ marbles: [mi, mj], dir });
        }
      }
    }
  }

  // 3-marble moves: find collinear triples
  for (let i = 0; i < allM.length; i++) {
    for (let j = i + 1; j < allM.length; j++) {
      for (let k = j + 1; k < allM.length; k++) {
        const triple = [allM[i]!, allM[j]!, allM[k]!];
        for (let dir = 0; dir < 6; dir++) {
          if (tryMove(board, triple, dir, seat).ok) {
            moves.push({ marbles: triple, dir });
          }
        }
      }
    }
  }

  return moves;
}

interface BotSearchState {
  board: Map<string, Cell>;
  pushed: [number, number];
  turn: 0 | 1;
}

function getBotMove(state: AbaloneState): AbaloneMove | null {
  const result = minimax<BotSearchState, AbaloneMove>(
    { board: state.board, pushed: state.pushed, turn: 1 },
    {
      depth: 2,
      moves(s) {
        if (s.pushed[0] >= 6 || s.pushed[1] >= 6) return [];
        return allLegalMoves(s.board, s.turn);
      },
      apply(s, m) {
        const res = tryMove(s.board, m.marbles, m.dir, s.turn);
        const newPushed: [number, number] = [...s.pushed];
        if (res.pushed !== null && res.pushed !== undefined) {
          newPushed[res.pushed]++;
        }
        return {
          board: res.newBoard ?? s.board,
          pushed: newPushed,
          turn: (s.turn === 0 ? 1 : 0) as 0 | 1,
        };
      },
      isTerminal(s) { return s.pushed[0] >= 6 || s.pushed[1] >= 6; },
      evaluate(s) { return evalAbalone(s.board, s.pushed, 1); },
      maximizing(s) { return s.turn === 1; },
    }
  );
  return result.move;
}

export function initialState(seed: number, settings: AbaloneSettings): AbaloneState {
  const board = settings.startPosition === "belgian_daisy"
    ? belgianDaisyPosition()
    : standardPosition();
  return {
    settings,
    board,
    turn: 0,
    pushed: [0, 0],
    winner: null,
    selected: [],
    movesMade: 0,
    rngSeed: seed,
  };
}

function runBot(state: AbaloneState): AbaloneState {
  let s = state;
  while (s.turn === 1 && s.winner === null) {
    const rng = mulberry32(s.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const move = getBotMove(s);
    if (!move) {
      // No legal moves: opponent wins
      return { ...s, winner: 0, rngSeed: nextSeed };
    }
    const res = tryMove(s.board, move.marbles, move.dir, 1);
    if (!res.ok || !res.newBoard) return { ...s, rngSeed: nextSeed };

    const newPushed: [number, number] = [...s.pushed];
    if (res.pushed !== null && res.pushed !== undefined) {
      newPushed[res.pushed]++;
    }
    const winner: 0 | 1 | null = newPushed[0] >= 6 ? 1 : newPushed[1] >= 6 ? 0 : null;
    s = {
      ...s,
      board: res.newBoard,
      pushed: newPushed,
      winner,
      turn: 0,
      selected: [],
      movesMade: s.movesMade + 1,
      rngSeed: nextSeed,
    };
    break;
  }
  return s;
}

export function reducer(state: AbaloneState, action: AbaloneAction): AbaloneState {
  if (state.winner !== null) return state;
  if (state.turn !== 0) return state;

  if (action.type === "select") {
    const { q, r } = action.coord;
    const cell = getCell(state.board, q, r);

    // Deselect if already selected
    const alreadySel = state.selected.some((s) => s.q === q && s.r === r);
    if (alreadySel) {
      return { ...state, selected: state.selected.filter((s) => !(s.q === q && s.r === r)) };
    }

    if (cell === 0) {
      // Select this marble (up to 3)
      if (state.selected.length >= 3) return state;
      const newSel = [...state.selected, { q, r }];
      // Validate they are collinear and contiguous
      if (newSel.length <= 1) return { ...state, selected: newSel };
      // Check contiguity
      for (let i = 0; i < newSel.length - 1; i++) {
        const a = newSel[i]!;
        const b = newSel[i + 1]!;
        const diff = { q: b.q - a.q, r: b.r - a.r };
        const ok = HEX_DIRS.some((d) => (Math.abs(d.q - diff.q) < 0.01 && Math.abs(d.r - diff.r) < 0.01));
        if (!ok) {
          // Not valid: just replace selection
          return { ...state, selected: [{ q, r }] };
        }
      }
      return { ...state, selected: newSel };
    }

    // Clicking empty/opponent cell: treat as deselect all or ignore
    return { ...state, selected: [] };
  }

  if (action.type === "move") {
    if (state.selected.length === 0) return state;
    const res = tryMove(state.board, state.selected, action.dir, 0);
    if (!res.ok || !res.newBoard) return state;

    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);

    const newPushed: [number, number] = [...state.pushed];
    if (res.pushed !== null && res.pushed !== undefined) {
      newPushed[res.pushed]++;
    }
    const winner: 0 | 1 | null = newPushed[0] >= 6 ? 1 : newPushed[1] >= 6 ? 0 : null;

    let next: AbaloneState = {
      ...state,
      board: res.newBoard,
      pushed: newPushed,
      winner,
      turn: 1,
      selected: [],
      movesMade: state.movesMade + 1,
      rngSeed: nextSeed,
    };

    if (winner !== null) return next;
    next = runBot(next);
    return next;
  }

  return state;
}

export function isTerminal(state: AbaloneState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === 0) return { score: 100 };
  return { score: 0 };
}

export { tryMove, allLegalMoves, getCell };
