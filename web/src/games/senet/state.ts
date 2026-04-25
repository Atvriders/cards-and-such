import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Senet: Ancient Egyptian race game
// 30 squares in a row (snake path: 10 per row, 3 rows)
// Special squares: 15 (House of Rebirth), 26 (House of Happiness), 27 (House of Water – sends back to 15)
// 28 (Three beauties), 29 (Two beauties), 30 (exit)
// Player has 5 pieces (P), Bot has 5 pieces (B)
// Sticks throw: 0-4 (4 sticks, each 0 or 1). 0 blacks = 5 steps.

export type SenetCell = "P" | "B" | null;

export interface SenetSettings {
  dummy?: string;
}

export interface SenetState {
  board: SenetCell[]; // indices 0-29 (square 1-30), index 30 = escaped P, 31 = escaped B
  escapedP: number;
  escapedB: number;
  turn: "P" | "B";
  roll: number; // 1-5
  winner: "P" | "B" | null;
  rngSeed: number;
  settings: SenetSettings;
  mustRoll: boolean; // waiting for player to acknowledge roll
  lastRoll: number;
}

export type SenetAction =
  | { type: "roll" }
  | { type: "move"; from: number }; // from = board index (-1 = entering)

// Special square indices (0-based)
const HOUSE_REBIRTH = 14; // square 15
const HOUSE_WATER = 26;   // square 27 → back to 15
const EXIT_SQUARE = 30;   // beyond the board

function mulberry(seed: number) {
  return mulberry32(seed);
}

function rollSticks(rng: () => number): number {
  // 4 sticks, each 0 or 1; count of whites. All 0 (all dark) = 5.
  let whites = 0;
  for (let i = 0; i < 4; i++) whites += Math.floor(rng() * 2);
  return whites === 0 ? 5 : whites;
}

export function initialState(seed: number, settings: SenetSettings): SenetState {
  const board: SenetCell[] = new Array(30).fill(null);
  // Alternate placement: P on 0,2,4,6,8; B on 1,3,5,7,9
  for (let i = 0; i < 5; i++) {
    board[i * 2] = "P";
    board[i * 2 + 1] = "B";
  }
  return {
    board,
    escapedP: 0,
    escapedB: 0,
    turn: "P",
    roll: 0,
    winner: null,
    rngSeed: seed,
    settings,
    mustRoll: true,
    lastRoll: 0,
  };
}

function countPieces(board: SenetCell[], player: "P" | "B"): number {
  return board.filter((c) => c === player).length;
}

// Get legal moves for the current player given a roll
export function getLegalMoves(
  board: SenetCell[],
  escapedP: number,
  escapedB: number,
  player: "P" | "B",
  roll: number,
): number[] {
  const moves: number[] = [];
  for (let i = 0; i < 30; i++) {
    if (board[i] !== player) continue;
    const dest = i + roll;
    if (dest >= 30) {
      // Can escape if on square 25+ and dest == 30 or roll overshoots only from 29
      if (i === 29 && dest === 30) moves.push(i);
      else if (dest === 30 && i >= 25) moves.push(i); // need exact or from certain squares
      // Simplified: can escape if dest >= 30 and piece is on row 3 (sq 20-29)
      if (i >= 20) moves.push(i);
      continue;
    }
    const target = board[dest];
    if (target === null) { moves.push(i); continue; }
    if (target === player) continue; // blocked
    // Can capture (swap) if opponent is not in a protected group
    // Protected: opponent has two or more consecutive pieces
    let protectedGroup = false;
    // Check if dest is in a consecutive group of opponent
    const opp = player === "P" ? "B" : "P";
    if (board[dest] === opp) {
      const leftOk = dest > 0 && board[dest - 1] === opp;
      const rightOk = dest < 29 && board[dest + 1] === opp;
      if (leftOk || rightOk) protectedGroup = true;
    }
    if (!protectedGroup) moves.push(i);
  }
  return [...new Set(moves)];
}

function applyMove(state: SenetState, from: number): SenetState {
  const rng = mulberry(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  const board = [...state.board];
  const roll = state.roll;
  const player = state.turn;
  const opp = player === "P" ? "B" : "P";
  const dest = from + roll;

  let escapedP = state.escapedP;
  let escapedB = state.escapedB;

  if (dest >= 30) {
    // Escape
    board[from] = null;
    if (player === "P") escapedP++;
    else escapedB++;
  } else {
    if (board[dest] !== null && board[dest] !== player) {
      // Swap
      board[from] = opp;
      board[dest] = player;
    } else {
      board[from] = null;
      board[dest] = player;
    }
    // House of Water
    if (dest === HOUSE_WATER && board[dest] === player) {
      board[dest] = null;
      if (board[HOUSE_REBIRTH] === null) {
        board[HOUSE_REBIRTH] = player;
      } else {
        // Find first empty before house of rebirth
        let placed = false;
        for (let i = HOUSE_REBIRTH - 1; i >= 0; i--) {
          if (board[i] === null) { board[i] = player; placed = true; break; }
        }
        if (!placed) {
          // just place at 0
          for (let i = 0; i < 30; i++) {
            if (board[i] === null) { board[i] = player; break; }
          }
        }
      }
    }
  }

  // Check winner
  let winner: "P" | "B" | null = null;
  if (escapedP === 5) winner = "P";
  if (escapedB === 5) winner = "B";

  // Extra turn on roll of 1, 4, or 5
  const extraTurn = roll === 1 || roll === 4 || roll === 5;
  const nextTurn = extraTurn ? player : opp;

  return {
    ...state,
    board,
    escapedP,
    escapedB,
    turn: nextTurn,
    roll: 0,
    winner,
    rngSeed: nextSeed,
    mustRoll: true,
    lastRoll: state.lastRoll,
  };
}

function botMove(state: SenetState): SenetState {
  const rng = mulberry(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const roll = rollSticks(rng);
  const nextSeed2 = Math.floor(rng() * 2 ** 31);

  const moves = getLegalMoves(state.board, state.escapedP, state.escapedB, "B", roll);
  if (moves.length === 0) {
    // No legal moves, skip turn
    const opp = state.turn === "B" ? "P" : "B";
    return { ...state, rngSeed: nextSeed2, turn: opp, roll: 0, mustRoll: true, lastRoll: roll };
  }
  // Simple AI: prefer capture, then furthest piece
  let best = moves[0]!;
  let bestScore = -999;
  for (const m of moves) {
    const dest = m + roll;
    let score = m; // prefer moving furthest piece
    if (dest < 30 && state.board[dest] === "P") score += 100; // capture bonus
    if (dest >= 30) score += 50; // escape bonus
    if (score > bestScore) { bestScore = score; best = m; }
  }

  const s2: SenetState = { ...state, rngSeed: nextSeed2, roll, lastRoll: roll, mustRoll: false };
  return applyMove(s2, best);
}

export function reducer(state: SenetState, action: SenetAction): SenetState {
  if (state.winner !== null) return state;

  if (action.type === "roll") {
    if (!state.mustRoll || state.turn !== "P") return state;
    const rng = mulberry(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const roll = rollSticks(rng);
    const nextSeed2 = Math.floor(rng() * 2 ** 31);
    const moves = getLegalMoves(state.board, state.escapedP, state.escapedB, "P", roll);
    if (moves.length === 0) {
      // Skip turn
      return { ...state, rngSeed: nextSeed2, turn: "B", roll: 0, mustRoll: true, lastRoll: roll };
    }
    return { ...state, rngSeed: nextSeed2, roll, mustRoll: false, lastRoll: roll };
  }

  if (action.type === "move") {
    if (state.mustRoll || state.turn !== "P" || state.roll === 0) return state;
    const moves = getLegalMoves(state.board, state.escapedP, state.escapedB, "P", state.roll);
    if (!moves.includes(action.from)) return state;
    let next = applyMove(state, action.from);
    // Bot turn(s)
    let limit = 10;
    while (next.winner === null && next.turn === "B" && limit-- > 0) {
      next = botMove(next);
    }
    return next;
  }

  return state;
}

export function isTerminal(state: SenetState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === "P") return { score: 100 };
  return { score: 0 };
}
