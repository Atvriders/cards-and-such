import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { minimax } from "../../engines/grid/minimax.js";

// Mu Torere — Māori board game.
// 8 outer "kewai" spaces arranged in a star/octagon + 1 central "putahi".
// Each player has 4 pieces on adjacent outer spaces (0 = human: positions 0-3, 1 = bot: positions 4-7).
// Space index 8 = center.
//
// Legal moves:
//   - A kewai piece can move to the putahi (center) IF it's empty AND at least one adjacent kewai
//     belongs to the opponent.
//   - A kewai piece can move to an adjacent kewai if that kewai is empty.
//   - The putahi piece can move to any empty kewai.
//
// Adjacency: kewai spaces are adjacent cyclically (i adjacent to i-1 and i+1 mod 8).
// Center is adjacent to all kewai.
//
// Win: the player who cannot move loses (opponent wins).

export type Player = 0 | 1;
export type Cell = Player | null;

export interface MuTorereState {
  // spaces[0..7] = outer kewai (circular), spaces[8] = center putahi
  spaces: Cell[];
  turn: Player;
  winner: Player | null;
  selected: number | null;
  rngSeed: number;
  movesMade: number;
}

export type MuTorereAction =
  | { type: "select"; idx: number }
  | { type: "move"; to: number };

function kewaiAdj(i: number): number[] {
  return [(i + 1) % 8, (i + 7) % 8];
}

export function getLegalMoves(spaces: Cell[], from: number, player: Player): number[] {
  if (spaces[from] !== player) return [];
  const opp: Player = player === 0 ? 1 : 0;
  const targets: number[] = [];

  if (from === 8) {
    // Center piece: can move to any empty kewai
    for (let k = 0; k < 8; k++) {
      if (spaces[k] === null) targets.push(k);
    }
  } else {
    // Kewai piece
    // Move to adjacent kewai if empty
    for (const adj of kewaiAdj(from)) {
      if (spaces[adj] === null) targets.push(adj);
    }
    // Move to center if empty and at least one adjacent kewai belongs to opponent
    if (spaces[8] === null) {
      const adjs = kewaiAdj(from);
      if (adjs.some((a) => spaces[a] === opp)) {
        targets.push(8);
      }
    }
  }
  return targets;
}

export function allMovesFor(spaces: Cell[], player: Player): Array<{ from: number; to: number }> {
  const moves: Array<{ from: number; to: number }> = [];
  for (let i = 0; i <= 8; i++) {
    if (spaces[i] !== player) continue;
    for (const to of getLegalMoves(spaces, i, player)) {
      moves.push({ from: i, to });
    }
  }
  return moves;
}

function applyMove(spaces: Cell[], from: number, to: number, player: Player): Cell[] {
  const ns = [...spaces];
  ns[from] = null;
  ns[to] = player;
  return ns;
}

function evalMuTorere(spaces: Cell[]): number {
  // Bot wants human to have no moves; positive = good for bot
  const humanMoves = allMovesFor(spaces, 0).length;
  const botMoves = allMovesFor(spaces, 1).length;
  return humanMoves - botMoves; // bot prefers human to have fewer moves
}

interface BotState { spaces: Cell[]; turn: Player }

function getBotMove(state: MuTorereState): { from: number; to: number } | null {
  const res = minimax<BotState, { from: number; to: number }>(
    { spaces: state.spaces, turn: 1 },
    {
      depth: 4,
      moves(s) { return allMovesFor(s.spaces, s.turn); },
      apply(s, m) {
        return { spaces: applyMove(s.spaces, m.from, m.to, s.turn), turn: s.turn === 0 ? 1 : 0 };
      },
      isTerminal(s) { return allMovesFor(s.spaces, s.turn).length === 0; },
      evaluate(s) { return evalMuTorere(s.spaces); },
      maximizing(s) { return s.turn === 1; },
    }
  );
  return res.move;
}

export function initialState(seed: number): MuTorereState {
  // Human (0) on positions 0-3, bot (1) on positions 4-7, center empty
  const spaces: Cell[] = [0, 0, 0, 0, 1, 1, 1, 1, null];
  return { spaces, turn: 0, winner: null, selected: null, rngSeed: seed, movesMade: 0 };
}

function runBot(state: MuTorereState): MuTorereState {
  let s = state;
  while (s.turn === 1 && s.winner === null) {
    const rng = mulberry32(s.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    if (allMovesFor(s.spaces, 1).length === 0) {
      return { ...s, winner: 0, rngSeed: nextSeed };
    }
    const mv = getBotMove(s);
    if (!mv) return { ...s, winner: 0, rngSeed: nextSeed };
    const ns = applyMove(s.spaces, mv.from, mv.to, 1);
    const winner: Player | null = allMovesFor(ns, 0).length === 0 ? 1 : null;
    s = { ...s, spaces: ns, turn: 0, winner, selected: null, movesMade: s.movesMade + 1, rngSeed: nextSeed };
    break;
  }
  return s;
}

export function reducer(state: MuTorereState, action: MuTorereAction): MuTorereState {
  if (state.winner !== null || state.turn !== 0) return state;

  if (action.type === "select") {
    if (state.spaces[action.idx] !== 0) return state;
    return { ...state, selected: state.selected === action.idx ? null : action.idx };
  }

  if (action.type === "move") {
    if (state.selected === null) return state;
    const legal = getLegalMoves(state.spaces, state.selected, 0);
    if (!legal.includes(action.to)) return state;
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const ns = applyMove(state.spaces, state.selected, action.to, 0);
    // Check if bot has no moves → human wins
    const winner: Player | null = allMovesFor(ns, 1).length === 0 ? 0 : null;
    let next: MuTorereState = { ...state, spaces: ns, turn: 1, winner, selected: null, movesMade: state.movesMade + 1, rngSeed: nextSeed };
    if (winner !== null) return next;
    next = runBot(next);
    return next;
  }

  return state;
}

export function isTerminal(state: MuTorereState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}
