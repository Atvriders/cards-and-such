import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { minimax } from "../../engines/grid/minimax.js";

// Oware (Awari) — 2-row, 6-pit mancala variant
// Board layout: pits[0-5] = player 0 (bottom row, left to right)
//               pits[6-11] = player 1 (top row, right to left from player 1's perspective)
// NO stores — seeds are captured to a separate score tally.
// Sowing: counterclockwise (from player 0's side: 0→1→2→3→4→5→11→10→9→8→7→6→5→... wait)
//
// Standard Oware sowing order (counterclockwise from player 0's perspective):
// Player 0's pits: 0,1,2,3,4,5 (left to right)
// Player 1's pits: 11,10,9,8,7,6 (right to left on board = their left to right)
// So sowing order starting from pit 0: 0→1→2→3→4→5→11→10→9→8→7→6→5→4...
// We use a linear sow: 0→1→2→3→4→5→6→7→8→9→10→11→0... but player 1's row is reversed:
// Pit indices 0-5 = P0 left→right, 6-11 = P1 right→left (as seen from board)
// So pit 6 is directly across from pit 5, pit 11 directly across from pit 0.
//
// For P0: pits 0-5 (own side) | For P1: pits 6-11 (own side, 6=rightmost, 11=leftmost)
// Counterclockwise from P0's view: 0→1→2→3→4→5→6→7→8→9→10→11→0 (wrap)
// (P1's side goes right-to-left as seen by P0, which = left-to-right as seen by P1)
// This is equivalent to incrementing mod 12.
//
// Capture rule: if last seed lands in OPPONENT's pit bringing it to 2 or 3, capture those.
//   Walk backwards (in the direction we came from) capturing any consecutive opponent pits with 2 or 3 seeds.
// Grand slam (all opponent pits captured in one move): disallowed — skip capture.
// Game ends when one player's side is empty. Remaining seeds go to the player who still has seeds.
// Most seeds wins.

export const NUM_PITS = 12; // 6 per player
export const SEEDS_PER_PIT = 4;

export type Cell = number; // seed count

export interface OwareSettings { dummy?: string }

export interface OwareState {
  pits: readonly number[]; // 12 pits, index 0-5 = P0, 6-11 = P1
  scores: [number, number];
  turn: 0 | 1;
  winner: 0 | 1 | "draw" | null;
  rngSeed: number;
  settings: OwareSettings;
  lastSowed: number | null; // for animation hint
}

export type OwareAction = { type: "sow"; pit: number };

export function playerPits(seat: 0 | 1): number[] {
  return seat === 0 ? [0, 1, 2, 3, 4, 5] : [6, 7, 8, 9, 10, 11];
}

export function oppPits(seat: 0 | 1): number[] { return playerPits(seat === 0 ? 1 : 0); }

export function initialState(seed: number, settings: OwareSettings): OwareState {
  const pits = new Array(NUM_PITS).fill(SEEDS_PER_PIT) as number[];
  return { pits, scores: [0, 0], turn: 0, winner: null, rngSeed: seed, settings, lastSowed: null };
}

// Sow seeds from pit, return new pits and last landing index
function sowSeeds(pits: number[], pit: number, seat: 0 | 1): { pits: number[]; lastLanding: number } {
  const b = [...pits];
  let seeds = b[pit]!;
  b[pit] = 0;
  let pos = pit;

  while (seeds > 0) {
    pos = (pos + 1) % NUM_PITS;
    if (pos === pit) continue; // skip originating pit (if count was 12+ seeds)
    b[pos]! += 1;
    seeds--;
  }
  void seat;
  return { pits: b, lastLanding: pos };
}

// Oware capture: from lastLanding walking backwards, capture opponent pits with 2 or 3 seeds
// Only captures opponent's pits
function captureSeeds(pits: number[], lastLanding: number, seat: 0 | 1): { pits: number[]; captured: number } {
  const opp = seat === 0 ? 1 : 0;
  const oppSide = new Set(playerPits(opp));
  const b = [...pits];
  let captured = 0;
  let pos = lastLanding;

  // Walk backwards (counterclockwise = subtract 1 mod 12)
  while (oppSide.has(pos) && (b[pos] === 2 || b[pos] === 3)) {
    captured += b[pos]!;
    b[pos] = 0;
    pos = (pos - 1 + NUM_PITS) % NUM_PITS;
  }

  // Grand slam check: if all opponent pits are empty after capture, undo
  if (captured > 0) {
    const allOppEmpty = playerPits(opp).every(p => b[p] === 0);
    if (allOppEmpty) {
      // Grand slam — return original pits (no capture)
      return { pits, captured: 0 };
    }
  }

  return { pits: b, captured };
}

function isGameOver(pits: readonly number[]): boolean {
  return playerPits(0).every(p => pits[p] === 0) || playerPits(1).every(p => pits[p] === 0);
}

function finalizeScores(pits: readonly number[], scores: [number, number]): { scores: [number, number] } {
  const s: [number, number] = [...scores] as [number, number];
  for (const p of playerPits(0)) s[0] += pits[p]!;
  for (const p of playerPits(1)) s[1] += pits[p]!;
  return { scores: s };
}

function computeWinner(scores: [number, number]): 0 | 1 | "draw" {
  if (scores[0] > scores[1]) return 0;
  if (scores[1] > scores[0]) return 1;
  return "draw";
}

function validPits(pits: readonly number[], seat: 0 | 1): number[] {
  return playerPits(seat).filter(p => pits[p]! > 0);
}

// Minimax
interface BotState { pits: readonly number[]; scores: [number, number]; turn: 0 | 1 }

function botMoves(s: BotState): number[] { return validPits(s.pits, s.turn); }

function applyBotSow(s: BotState, pit: number): BotState {
  const { pits: p1, lastLanding } = sowSeeds([...s.pits], pit, s.turn);
  const opp = s.turn === 0 ? 1 : 0;
  const oppSide = new Set(playerPits(opp));
  let finalPits = p1;
  let captured = 0;

  if (oppSide.has(lastLanding) && (p1[lastLanding] === 2 || p1[lastLanding] === 3)) {
    const res = captureSeeds(p1, lastLanding, s.turn);
    finalPits = res.pits;
    captured = res.captured;
  }

  const newScores: [number, number] = [...s.scores] as [number, number];
  newScores[s.turn] += captured;

  if (isGameOver(finalPits)) {
    const fin = finalizeScores(finalPits, newScores);
    return { pits: new Array(NUM_PITS).fill(0), scores: fin.scores, turn: opp };
  }

  // If opponent has no seeds, current player must give them seeds (simplified: pass turn)
  const nextTurn = opp;
  return { pits: finalPits, scores: newScores, turn: nextTurn };
}

function evaluateBot(s: BotState): number {
  return s.scores[1] - s.scores[0]; // bot = seat 1, maximizes
}

function botIsTerminal(s: BotState): boolean {
  return isGameOver(s.pits) || botMoves(s).length === 0;
}

function getBotMove(state: OwareState): number | null {
  const bs: BotState = { pits: state.pits, scores: state.scores, turn: state.turn };
  const result = minimax<BotState, number>(bs, {
    depth: 4,
    moves: botMoves,
    apply: applyBotSow,
    isTerminal: botIsTerminal,
    evaluate: evaluateBot,
    maximizing: (s) => s.turn === 1,
  });
  return result.move;
}

function applySowToState(state: OwareState, pit: number): OwareState {
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const seat = state.turn;
  const opp = (seat === 0 ? 1 : 0) as 0 | 1;

  const { pits: p1, lastLanding } = sowSeeds([...state.pits], pit, seat);
  const oppSide = new Set(playerPits(opp));
  let finalPits: number[] = p1;
  let captured = 0;

  if (oppSide.has(lastLanding) && (p1[lastLanding] === 2 || p1[lastLanding] === 3)) {
    const res = captureSeeds(p1, lastLanding, seat);
    finalPits = [...res.pits];
    captured = res.captured;
  }

  const newScores: [number, number] = [...state.scores] as [number, number];
  newScores[seat] += captured;

  if (isGameOver(finalPits)) {
    const fin = finalizeScores(finalPits, newScores);
    const winner = computeWinner(fin.scores);
    return { ...state, pits: new Array(NUM_PITS).fill(0), scores: fin.scores, winner, rngSeed: nextSeed, lastSowed: pit };
  }

  return { ...state, pits: finalPits, scores: newScores, turn: opp, winner: null, rngSeed: nextSeed, lastSowed: pit };
}

function runBotMoves(state: OwareState): OwareState {
  let s = state;
  let limit = 5;
  while (s.winner === null && s.turn === 1 && limit-- > 0) {
    const valid = validPits(s.pits, 1);
    if (valid.length === 0) { s = { ...s, winner: 0 }; break; }
    const move = getBotMove(s);
    if (move === null) break;
    s = applySowToState(s, move);
  }
  return s;
}

export function reducer(state: OwareState, action: OwareAction): OwareState {
  if (state.winner !== null) return state;
  if (state.turn !== 0) return state;
  if (!playerPits(0).includes(action.pit)) return state;
  if ((state.pits[action.pit] ?? 0) === 0) return state;

  const next = applySowToState(state, action.pit);
  if (next.winner !== null) return next;
  return runBotMoves(next);
}

export function isTerminal(state: OwareState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === 0) return { score: 100 };
  if (state.winner === "draw") return { score: 50 };
  return { score: 0 };
}
