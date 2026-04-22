import { Grid } from "../../engines/grid/index.js";
import { minimax } from "../../engines/grid/minimax.js";
import type { Coord } from "../../engines/grid/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dvonn-lite: 6x6 board stacking game.
// Phase 1 (Placement): Players alternate placing pieces. Each player has 18 pieces + 3 DVONN pieces.
//   DVONN pieces are placed first (alternating), then normal pieces.
// Phase 2 (Movement): Stacks move. A stack of height H moves exactly H squares orthogonally.
//   Can land on own or enemy stacks (stacking). A stack not connected to any DVONN piece is removed.
// Win: player controlling more stacks at end.
// Simplified further: 6x6 board, each player gets 12 pieces, 2 DVONN pieces placed at start.
// Movement only: one DVONN piece placed randomly, then players alternate placing 12 pieces each,
// then movement phase. Stack moves H squares in any of 4 orthogonal directions.
// Top piece of destination stack now controls it.

export type Owner = "W" | "B" | "D"; // D = DVONN (neutral, but marks anchor)

export interface Stack {
  height: number;
  top: Owner; // who controls this stack
  hasDvonn: boolean;
}

export interface DvonnLiteSettings {
  opponent: "bot" | "hot-seat";
}

export type Phase = "placement" | "movement";
export type PlacementSubPhase = "dvonn" | "pieces";

export interface DvonnLiteState {
  settings: DvonnLiteSettings;
  rngSeed: number;
  grid: Grid<Stack | null>;
  turn: "W" | "B";
  phase: Phase;
  placementSub: PlacementSubPhase;
  dvonnPlaced: number; // 0..2
  piecesPlaced: { W: number; B: number };
  selected: Coord | null;
  winner: "W" | "B" | "draw" | null;
}

export type DvonnLiteAction =
  | { type: "place"; at: Coord }
  | { type: "select"; at: Coord }
  | { type: "move"; from: Coord; to: Coord };

const TOTAL_DVONN = 2;
const PIECES_EACH = 12;
const ROWS = 6, COLS = 6;

export function initialState(seed: number, settings: DvonnLiteSettings): DvonnLiteState {
  const rng = mulberry32(seed);
  const cells: (Stack | null)[] = new Array(ROWS * COLS).fill(null);
  // Place 2 DVONN pieces at random positions
  const positions = [...Array(ROWS * COLS).keys()];
  // shuffle
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [positions[i], positions[j]] = [positions[j]!, positions[i]!];
  }
  for (let i = 0; i < TOTAL_DVONN; i++) {
    cells[positions[i]!] = { height: 1, top: "D", hasDvonn: true };
  }

  return {
    settings,
    rngSeed: seed,
    grid: new Grid<Stack | null>(ROWS, COLS, cells),
    turn: "W",
    phase: "placement",
    placementSub: "pieces",
    dvonnPlaced: TOTAL_DVONN,
    piecesPlaced: { W: 0, B: 0 },
    selected: null,
    winner: null,
  };
}

export function getLegalPlaces(state: DvonnLiteState): Coord[] {
  return [...state.grid.coords()].filter(c => state.grid.get(c) === null);
}

const DIRS4: [number, number][] = [[0, 1], [0, -1], [1, 0], [-1, 0]];

export function getLegalMoves(state: DvonnLiteState): Array<{ from: Coord; to: Coord }> {
  const moves: Array<{ from: Coord; to: Coord }> = [];
  for (const from of state.grid.coords()) {
    const stack = state.grid.get(from);
    if (!stack || stack.top !== state.turn) continue;
    const h = stack.height;
    for (const [dr, dc] of DIRS4) {
      const to = { row: from.row + dr * h, col: from.col + dc * h };
      if (!state.grid.inBounds(to)) continue;
      if (state.grid.get(to) === null) continue; // must land on existing stack
      moves.push({ from, to });
    }
  }
  return moves;
}

function isDvonnConnected(grid: Grid<Stack | null>): Set<string> {
  // BFS from all DVONN-containing stacks
  const key = (c: Coord) => `${c.row},${c.col}`;
  const connected = new Set<string>();
  const queue: Coord[] = [];

  for (const c of grid.coords()) {
    const s = grid.get(c);
    if (s && s.hasDvonn) { connected.add(key(c)); queue.push(c); }
  }

  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const [dr, dc] of DIRS4) {
      const n = { row: cur.row + dr, col: cur.col + dc };
      if (!grid.inBounds(n)) continue;
      if (connected.has(key(n))) continue;
      if (grid.get(n) !== null) { connected.add(key(n)); queue.push(n); }
    }
  }
  return connected;
}

function removeDisconnected(grid: Grid<Stack | null>): Grid<Stack | null> {
  const connected = isDvonnConnected(grid);
  let g = grid;
  for (const c of g.coords()) {
    if (g.get(c) !== null && !connected.has(`${c.row},${c.col}`)) {
      g = g.set(c, null);
    }
  }
  return g;
}

function applyMove(state: DvonnLiteState, from: Coord, to: Coord): DvonnLiteState {
  const fromStack = state.grid.get(from)!;
  const toStack = state.grid.get(to)!;
  const merged: Stack = {
    height: fromStack.height + toStack.height,
    top: fromStack.top === "D" ? toStack.top : fromStack.top,
    hasDvonn: fromStack.hasDvonn || toStack.hasDvonn,
  };
  let g = state.grid.set(from, null).set(to, merged);
  g = removeDisconnected(g);
  return { ...state, grid: g, turn: state.turn === "W" ? "B" : "W", selected: null };
}

function computeWinner(state: DvonnLiteState): "W" | "B" | "draw" {
  let w = 0, b = 0;
  for (const c of state.grid.coords()) {
    const s = state.grid.get(c);
    if (!s) continue;
    if (s.top === "W") w++;
    else if (s.top === "B") b++;
  }
  if (w > b) return "W";
  if (b > w) return "B";
  return "draw";
}

function evaluate(state: DvonnLiteState): number {
  // Bot is B (maximizer)
  let w = 0, b = 0;
  for (const c of state.grid.coords()) {
    const s = state.grid.get(c);
    if (!s) continue;
    if (s.top === "W") w += s.height;
    else if (s.top === "B") b += s.height;
  }
  return b - w;
}

function botMoveAction(state: DvonnLiteState): DvonnLiteState {
  if (state.phase === "placement") {
    const places = getLegalPlaces(state);
    if (places.length === 0) return state;
    // Just pick center-ish placement
    const center = { row: Math.floor(ROWS / 2), col: Math.floor(COLS / 2) };
    const best = places.reduce((a, b) => {
      const da = Math.abs(a.row - center.row) + Math.abs(a.col - center.col);
      const db = Math.abs(b.row - center.row) + Math.abs(b.col - center.col);
      return da < db ? a : b;
    });
    return applyPlacement(state, best);
  }

  const legalMoves = getLegalMoves(state);
  if (legalMoves.length === 0) {
    // Bot can't move, skip turn
    const nextTurn: "W" | "B" = "W";
    const wMoves = getLegalMoves({ ...state, turn: "W" });
    if (wMoves.length === 0) {
      return { ...state, winner: computeWinner(state) };
    }
    return { ...state, turn: nextTurn };
  }

  type DvonnMove = { from: Coord; to: Coord };
  const result = minimax<DvonnLiteState, DvonnMove>(state, {
    depth: 2,
    moves: (s) => getLegalMoves(s),
    apply: (s, m) => {
      const next = applyMove(s, m.from, m.to);
      const nm = getLegalMoves(next);
      if (nm.length === 0) {
        const oppTurn: "W" | "B" = next.turn === "W" ? "B" : "W";
        const opp = getLegalMoves({ ...next, turn: oppTurn });
        if (opp.length === 0) return { ...next, winner: computeWinner(next) };
        return { ...next, turn: oppTurn };
      }
      return next;
    },
    isTerminal: (s) => s.winner !== null,
    evaluate: (s) => {
      if (s.winner === "B") return 100000;
      if (s.winner === "W") return -100000;
      return evaluate(s);
    },
    maximizing: (s) => s.turn === "B",
  });

  if (!result.move) return { ...state, winner: computeWinner(state) };
  return applyMove(state, result.move.from, result.move.to);
}

function applyPlacement(state: DvonnLiteState, at: Coord): DvonnLiteState {
  const newGrid = state.grid.set(at, { height: 1, top: state.turn, hasDvonn: false });
  const newPieces = { ...state.piecesPlaced, [state.turn]: state.piecesPlaced[state.turn] + 1 };
  const nextTurn: "W" | "B" = state.turn === "W" ? "B" : "W";
  const totalPlaced = newPieces.W + newPieces.B;
  const doneWithPlacement = totalPlaced >= PIECES_EACH * 2;

  return {
    ...state,
    grid: newGrid,
    turn: doneWithPlacement ? "W" : nextTurn,
    piecesPlaced: newPieces,
    phase: doneWithPlacement ? "movement" : "placement",
    selected: null,
  };
}

export function reducer(state: DvonnLiteState, action: DvonnLiteAction): DvonnLiteState {
  if (state.winner) return state;

  if (state.phase === "placement") {
    if (action.type === "place") {
      if (!state.grid.inBounds(action.at)) return state;
      if (state.grid.get(action.at) !== null) return state;
      const next = applyPlacement(state, action.at);
      // After W places, bot (B) places
      if (!next.winner && next.phase === "placement" && state.settings.opponent === "bot" && next.turn === "B") {
        return botMoveAction(next);
      }
      return next;
    }
    return state;
  }

  // Movement phase
  if (action.type === "select") {
    if (state.settings.opponent !== "hot-seat" && state.turn !== "W") return state;
    const s = state.grid.get(action.at);
    if (!s || s.top !== state.turn) return state;
    return { ...state, selected: action.at };
  }

  if (action.type === "move") {
    const legal = getLegalMoves(state);
    const isLegal = legal.some(
      m => m.from.row === action.from.row && m.from.col === action.from.col &&
           m.to.row === action.to.row && m.to.col === action.to.col
    );
    if (!isLegal) return state;
    let next = applyMove(state, action.from, action.to);

    // Check if next player can move
    const nextMoves = getLegalMoves(next);
    if (nextMoves.length === 0) {
      const oppMoves = getLegalMoves({ ...next, turn: next.turn === "W" ? "B" : "W" });
      if (oppMoves.length === 0) {
        return { ...next, winner: computeWinner(next) };
      }
      // Skip turn
      next = { ...next, turn: next.turn === "W" ? "B" : "W" };
    }

    if (!next.winner && state.settings.opponent === "bot" && next.turn === "B") {
      return botMoveAction(next);
    }
    return next;
  }

  return state;
}

export function isTerminal(state: DvonnLiteState): { score: number } | null {
  if (!state.winner) return null;
  if (state.winner === "W") return { score: 100 };
  if (state.winner === "B") return { score: 0 };
  return { score: 50 };
}
