// Three Men's Morris: 3×3 board with diagonals. Each player has 3 men.
// Phase 1: place all 3. Phase 2: slide one of your men to an adjacent empty cell.
// First to 3 in a row (horiz/vert/diag) wins.

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const POINTS = 9;
export const PIECES_PER = 3;

// 3×3 grid, with all 8 neighbors connected (rook + king moves restricted to adjacency)
// Standard Three Men's Morris adjacency:
//  0 -- 1 -- 2
//  | \  |  / |
//  3 -- 4 -- 5
//  | /  |  \ |
//  6 -- 7 -- 8
export const ADJACENCY: ReadonlyArray<readonly number[]> = [
  [1, 3, 4],         // 0
  [0, 2, 4],         // 1
  [1, 4, 5],         // 2
  [0, 4, 6],         // 3
  [0, 1, 2, 3, 5, 6, 7, 8], // 4 (center connects to all)
  [2, 4, 8],         // 5
  [3, 4, 7],         // 6
  [4, 6, 8],         // 7
  [4, 5, 7],         // 8
];

export const LINES: ReadonlyArray<readonly [number, number, number]> = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],             // diags
];

export type Cell = 0 | 1 | null;
export type Phase = "placing" | "moving";

export interface ThreeMorrisSettings {
  botStrength: "easy" | "hard";
}

export interface GameState {
  board: ReadonlyArray<Cell>;
  turn: 0 | 1;
  phase: [Phase, Phase];
  piecesToPlace: [number, number];
  selectedPos: number | null;
  winner: 0 | 1 | "draw" | null;
  rngSeed: number;
  settings: ThreeMorrisSettings;
  movesMade: number;
}

export type GameAction =
  | { type: "place"; pos: number }
  | { type: "select"; pos: number }
  | { type: "move"; to: number };

export function checkLineWin(board: ReadonlyArray<Cell>): { winner: 0 | 1 | null; line: readonly number[] | null } {
  for (const [a, b, c] of LINES) {
    const v = board[a];
    if (v !== null && v === board[b] && v === board[c]) {
      return { winner: v as 0 | 1, line: [a, b, c] };
    }
  }
  return { winner: null, line: null };
}

function getPhase(toPlace: number): Phase {
  return toPlace > 0 ? "placing" : "moving";
}

function legalMovesFor(board: ReadonlyArray<Cell>, seat: 0 | 1): Array<{ from: number; to: number }> {
  const out: Array<{ from: number; to: number }> = [];
  for (let i = 0; i < POINTS; i++) {
    if (board[i] !== seat) continue;
    for (const t of ADJACENCY[i]!) {
      if (board[t] === null) out.push({ from: i, to: t });
    }
  }
  return out;
}

function checkWinner(s: GameState): 0 | 1 | "draw" | null {
  const lw = checkLineWin(s.board);
  if (lw.winner !== null) return lw.winner;
  // Stalemate: in moving phase, current player can't move
  if (getPhase(s.piecesToPlace[s.turn]) === "moving") {
    if (legalMovesFor(s.board, s.turn).length === 0) {
      // Opponent wins
      return s.turn === 0 ? 1 : 0;
    }
  }
  return null;
}

interface BotMove {
  type: "place" | "move";
  pos?: number;
  from?: number;
  to?: number;
}

function botMoves(board: ReadonlyArray<Cell>, seat: 0 | 1, ptp: number): BotMove[] {
  if (ptp > 0) {
    return board
      .map((c, i) => ({ c, i }))
      .filter(({ c }) => c === null)
      .map(({ i }) => ({ type: "place" as const, pos: i }));
  }
  return legalMovesFor(board, seat).map((m) => ({ type: "move" as const, from: m.from, to: m.to }));
}

function applyBotMove(board: ReadonlyArray<Cell>, seat: 0 | 1, mv: BotMove): Cell[] {
  const next = [...board] as Cell[];
  if (mv.type === "place") next[mv.pos!] = seat;
  else { next[mv.from!] = null; next[mv.to!] = seat; }
  return next;
}

function pickBot(state: GameState): BotMove | null {
  const seat = 1 as const;
  const opp = 0 as const;
  const ptp = state.piecesToPlace[seat];
  const moves = botMoves(state.board, seat, ptp);
  if (moves.length === 0) return null;
  // Win-now
  for (const m of moves) {
    const after = applyBotMove(state.board, seat, m);
    if (checkLineWin(after).winner === seat) return m;
  }
  // Block opp's win-now
  const oppMoves = botMoves(state.board, opp, state.piecesToPlace[opp]);
  for (const m of moves) {
    const after = applyBotMove(state.board, seat, m);
    let oppCanWin = false;
    for (const om of botMoves(after, opp, state.piecesToPlace[opp])) {
      const after2 = applyBotMove(after, opp, om);
      if (checkLineWin(after2).winner === opp) { oppCanWin = true; break; }
    }
    if (!oppCanWin) {
      // Prefer this move
      if (state.settings.botStrength === "hard") return m;
    }
  }
  // Hard-block: if any opp move wins, find a way to disrupt
  for (const om of oppMoves) {
    const after = applyBotMove(state.board, opp, om);
    if (checkLineWin(after).winner === opp) {
      // see if any of our moves prevents this
      for (const m of moves) {
        const a2 = applyBotMove(state.board, seat, m);
        const oppMoves2 = botMoves(a2, opp, state.piecesToPlace[opp]);
        let stillWin = false;
        for (const om2 of oppMoves2) {
          if (checkLineWin(applyBotMove(a2, opp, om2)).winner === opp) { stillWin = true; break; }
        }
        if (!stillWin) return m;
      }
    }
  }
  // Default: prefer center if possible
  const rng = mulberry32(state.rngSeed);
  if (state.settings.botStrength === "easy") {
    return moves[Math.floor(rng() * moves.length)]!;
  }
  // Hard fallback: prefer cells with most adjacency
  let best = moves[0]!;
  let bs = -Infinity;
  for (const m of moves) {
    const target = m.type === "place" ? m.pos! : m.to!;
    const adj = ADJACENCY[target]!.length;
    const center = target === 4 ? 5 : 0;
    const s = adj + center + rng() * 0.001;
    if (s > bs) { bs = s; best = m; }
  }
  return best;
}

export function initialState(seed: number, settings: ThreeMorrisSettings): GameState {
  return {
    board: new Array(POINTS).fill(null) as Cell[],
    turn: 0,
    phase: ["placing", "placing"],
    piecesToPlace: [PIECES_PER, PIECES_PER],
    selectedPos: null,
    winner: null,
    rngSeed: seed,
    settings,
    movesMade: 0,
  };
}

function applyToState(state: GameState, board: Cell[], seat: 0 | 1, mv: BotMove): GameState {
  const opp: 0 | 1 = seat === 0 ? 1 : 0;
  const ptp: [number, number] = [...state.piecesToPlace];
  if (mv.type === "place") ptp[seat] -= 1;
  let next: GameState = {
    ...state,
    board,
    turn: opp,
    piecesToPlace: ptp,
    selectedPos: null,
    movesMade: state.movesMade + 1,
  };
  next.phase = [getPhase(next.piecesToPlace[0]), getPhase(next.piecesToPlace[1])];
  return { ...next, winner: checkWinner(next) };
}

function runBot(state: GameState): GameState {
  if (state.winner !== null || state.turn !== 1) return state;
  const mv = pickBot(state);
  if (!mv) return state;
  const board = applyBotMove(state.board, 1, mv);
  return applyToState(state, board, 1, mv);
}

export function reducer(state: GameState, action: GameAction): GameState {
  if (state.winner !== null) return state;
  const seat = state.turn;
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  if (action.type === "place") {
    if (state.phase[seat] !== "placing") return state;
    if (state.board[action.pos] !== null) return state;
    const board = [...state.board] as Cell[];
    board[action.pos] = seat;
    let next = applyToState({ ...state, rngSeed: nextSeed }, board, seat, { type: "place", pos: action.pos });
    if (next.winner === null) next = runBot(next);
    return next;
  }

  if (action.type === "select") {
    if (state.phase[seat] === "placing") return state;
    if (state.board[action.pos] !== seat) return state;
    return { ...state, selectedPos: action.pos };
  }

  if (action.type === "move") {
    if (state.phase[seat] === "placing") return state;
    if (state.selectedPos === null) return state;
    const from = state.selectedPos;
    if (state.board[from] !== seat) return state;
    if (state.board[action.to] !== null) return state;
    if (!ADJACENCY[from]!.includes(action.to)) return state;
    const board = [...state.board] as Cell[];
    board[from] = null;
    board[action.to] = seat;
    let next = applyToState({ ...state, rngSeed: nextSeed }, board, seat, { type: "move", from, to: action.to });
    if (next.winner === null) next = runBot(next);
    return next;
  }

  return state;
}

export function isTerminal(state: GameState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === 0) return { score: 100 };
  if (state.winner === "draw") return { score: 50 };
  return { score: 0 };
}
