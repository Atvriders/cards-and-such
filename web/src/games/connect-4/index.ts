import type { GamePlugin } from "../../platform/game-plugin/types.js";
import {
  connect4Initial,
  connect4Reduce,
  connect4Terminal,
  type Connect4State,
  type Connect4Action,
  COLS,
  ROWS,
} from "@cards/shared";
import { Connect4 } from "./Connect4.js";

const settings = {
  opponent: { kind: "enum" as const, label: "Opponent", options: ["bot", "hot-seat"] as const, default: "bot" as const },
  botDepth: { kind: "enum" as const, label: "Bot depth", options: ["2", "4"] as const, default: "4" as const },
} as const;

type SPState = Connect4State & { settings: { opponent: "bot" | "hot-seat"; botDepth: "2" | "4" } };

function initial(seed: number, s: { opponent: "bot" | "hot-seat"; botDepth: "2" | "4" }): SPState {
  return { ...connect4Initial(seed, 2), settings: s };
}

function reducer(state: SPState, action: Connect4Action): SPState {
  const after = connect4Reduce(state, action, state.turn) as SPState;
  if ("settings" in state && !("settings" in after)) (after as SPState).settings = state.settings;
  // If opponent is bot and it's now bot's turn and game not over, have bot move.
  if (after !== state && after.winner === null && state.settings.opponent === "bot" && after.turn === 1) {
    const botMove = chooseBotMove(after, Number(state.settings.botDepth));
    if (botMove !== null) {
      return { ...connect4Reduce(after, { type: "drop", col: botMove }, 1), settings: state.settings } as SPState;
    }
  }
  return after;
}

function isTerminal(state: SPState): { score: number } | null {
  const t = connect4Terminal(state);
  if (!t) return null;
  // Seat 0 is the human; winner 0 → score 100, draw → 50, else 0.
  if (t.winner === 0) return { score: 100 };
  if (t.winner === "draw") return { score: 50 };
  return { score: 0 };
}

function chooseBotMove(state: Connect4State, depth: number): number | null {
  const valid: number[] = [];
  for (let c = 0; c < COLS; c++) {
    if (state.board[c] === null) valid.push(c);
  }
  if (valid.length === 0) return null;

  // Depth 2: block-or-win heuristic. Depth 4: minimax.
  if (depth <= 2) {
    // Try win
    for (const c of valid) {
      const next = connect4Reduce(state, { type: "drop", col: c }, state.turn);
      if (next.winner === state.turn) return c;
    }
    // Block opponent win
    const opp = state.turn === 0 ? 1 : 0;
    for (const c of valid) {
      const hypothetical = { ...state, turn: opp } as Connect4State;
      const next = connect4Reduce(hypothetical, { type: "drop", col: c }, opp);
      if (next.winner === opp) return c;
    }
    // Prefer center
    const center = Math.floor(COLS / 2);
    return valid.sort((a, b) => Math.abs(a - center) - Math.abs(b - center))[0]!;
  }

  // Minimax depth 4
  const maxSeat = 1 as 0 | 1;
  function minimax(s: Connect4State, d: number, alpha: number, beta: number): { score: number; col: number | null } {
    if (s.winner !== null || d === 0) {
      const base = s.winner === maxSeat ? 1000 : s.winner === (maxSeat === 0 ? 1 : 0) ? -1000 : 0;
      // light evaluation: center column ownership
      let eval2 = 0;
      const centerCol = Math.floor(COLS / 2);
      for (let r = 0; r < ROWS; r++) {
        const v = s.board[r * COLS + centerCol];
        if (v === maxSeat) eval2 += 3;
        else if (v !== null) eval2 -= 3;
      }
      return { score: base + eval2, col: null };
    }
    const cols: number[] = [];
    for (let c = 0; c < COLS; c++) if (s.board[c] === null) cols.push(c);
    if (cols.length === 0) return { score: 0, col: null };
    const isMax = s.turn === maxSeat;
    let bestCol: number | null = cols[0]!;
    let bestScore = isMax ? -Infinity : Infinity;
    for (const c of cols) {
      const next = connect4Reduce(s, { type: "drop", col: c }, s.turn);
      const { score } = minimax(next, d - 1, alpha, beta);
      if (isMax) {
        if (score > bestScore) { bestScore = score; bestCol = c; }
        alpha = Math.max(alpha, bestScore);
      } else {
        if (score < bestScore) { bestScore = score; bestCol = c; }
        beta = Math.min(beta, bestScore);
      }
      if (beta <= alpha) break;
    }
    return { score: bestScore, col: bestCol };
  }

  const { col } = minimax(state, depth, -Infinity, Infinity);
  return col ?? valid[0]!;
}

export const connect4Plugin: GamePlugin<SPState, Connect4Action, typeof settings> = {
  id: "connect-4",
  title: "Connect 4",
  category: "board",
  players: { min: 2, max: 2, multiplayer: true },
  description: "Drop discs. Connect four in a row — horizontally, vertically, or diagonally.",
  settings,
  initialState: initial,
  reducer,
  isTerminal,
  component: Connect4,
};
