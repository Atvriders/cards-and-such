import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Mancala — Full Kalah, Match Play.
//
// Classic 6-pit Kalah with:
//   * 4 seeds per pit at start (24 per side, 48 total)
//   * counter-clockwise sowing, including your own home (store) but skipping
//     the opponent's home
//   * last seed in own home -> free turn
//   * last seed in own EMPTY pit with non-empty opposite pit -> capture both
//     that seed AND every seed in the opposite pit into your home (empty-side
//     capture)
//   * round ends when one side has all empty pits — the OTHER side sweeps its
//     remaining seeds into its own home
//   * winner of the round = side with more seeds in home (tie = draw)
//
// Match play: best-of-9 single rounds. We track per-side round-wins in state;
// once one side reaches 5 round-wins (or all 9 rounds played and someone
// leads), the match is over.
//
// Slot layout (single linear array of length 14):
//   indices 0..5  = player 0's six pits (you, bottom row, left-to-right)
//   index   6     = player 0's home / kalah / store
//   indices 7..12 = player 1's six pits (CPU, top row, sown CCW from p0 view)
//   index   13    = player 1's home / kalah / store

export const P0_PITS = [0, 1, 2, 3, 4, 5] as const;
export const P0_STORE = 6;
export const P1_PITS = [7, 8, 9, 10, 11, 12] as const;
export const P1_STORE = 13;
export const SLOTS = 14;
const SEEDS_PER_PIT = 4;
const MATCH_GAMES = 9;
const MATCH_TARGET = 5; // first to 5 wins best-of-9

export interface MancalaFullKalahSettings {
  _dummy?: string;
}

export interface MancalaFullKalahState {
  board: readonly number[];
  turn: 0 | 1;
  /** Round winner — null while round still being played. */
  roundWinner: 0 | 1 | "draw" | null;
  /** Number of rounds played and resolved so far (0..MATCH_GAMES). */
  roundsPlayed: number;
  /** Round-wins per side over the match. (draws don't count for either). */
  matchScore: { p0: number; p1: number };
  /** Match-level winner — null while match still being played. */
  matchWinner: 0 | 1 | "draw" | null;
  rngSeed: number;
  settings: MancalaFullKalahSettings;
  /** Last pit the human (or CPU after their move chain) sowed from, for UI hints. */
  lastMove: number | null;
  /** Last empty-side capture target pit (opposite captured), for UI flash. */
  lastCapturePit: number | null;
}

export type MancalaFullKalahAction =
  | { type: "sow"; pit: number }
  | { type: "nextRound" };

/* ---------------- helpers ---------------- */

function myPits(seat: 0 | 1): readonly number[] {
  return seat === 0 ? P0_PITS : P1_PITS;
}
function myStore(seat: 0 | 1): number {
  return seat === 0 ? P0_STORE : P1_STORE;
}
function oppStore(seat: 0 | 1): number {
  return seat === 0 ? P1_STORE : P0_STORE;
}
/** Opposite pit across the board (e.g. pit 0 <-> pit 12, pit 5 <-> pit 7). */
function oppositePit(pit: number): number {
  // P0 pits 0..5 mirror P1 pits 12..7 (and vice versa).
  if (pit >= 0 && pit <= 5) return 12 - pit;
  if (pit >= 7 && pit <= 12) return 12 - pit;
  return -1;
}
function isMyPit(seat: 0 | 1, pit: number): boolean {
  return (myPits(seat) as readonly number[]).includes(pit);
}

function isOver(board: readonly number[]): boolean {
  return P0_PITS.every((p) => board[p] === 0) || P1_PITS.every((p) => board[p] === 0);
}

function collectRemaining(board: readonly number[]): number[] {
  const b = [...board];
  for (const p of P0_PITS) { b[P0_STORE]! += b[p]!; b[p] = 0; }
  for (const p of P1_PITS) { b[P1_STORE]! += b[p]!; b[p] = 0; }
  return b;
}

function determineRoundWinner(board: readonly number[]): 0 | 1 | "draw" {
  if (board[P0_STORE]! > board[P1_STORE]!) return 0;
  if (board[P1_STORE]! > board[P0_STORE]!) return 1;
  return "draw";
}

/** Sow seeds CCW, applying extra-turn AND empty-side-capture rules. */
export function sowMove(
  board: readonly number[],
  pit: number,
  seat: 0 | 1,
): { board: number[]; extraTurn: boolean; capturePit: number | null } {
  const b = [...board];
  let seeds = b[pit]!;
  b[pit] = 0;
  let pos = pit;
  const skip = oppStore(seat);
  while (seeds > 0) {
    pos = (pos + 1) % SLOTS;
    if (pos === skip) continue;
    b[pos]! += 1;
    seeds--;
  }

  let extraTurn = false;
  let capturePit: number | null = null;

  if (pos === myStore(seat)) {
    extraTurn = true;
  } else if (isMyPit(seat, pos) && b[pos] === 1) {
    // last seed landed in own previously-empty pit; check opposite
    const opp = oppositePit(pos);
    if (opp >= 0 && b[opp]! > 0) {
      const captured = b[opp]! + b[pos]!; // capture the landing seed too
      b[opp] = 0;
      b[pos] = 0;
      b[myStore(seat)]! += captured;
      capturePit = pos;
    }
  }

  return { board: b, extraTurn, capturePit };
}

/* ---------------- match / round bookkeeping ---------------- */

function freshBoard(): number[] {
  const board = new Array<number>(SLOTS).fill(0);
  for (const p of P0_PITS) board[p] = SEEDS_PER_PIT;
  for (const p of P1_PITS) board[p] = SEEDS_PER_PIT;
  return board;
}

export function initialState(seed: number, settings: MancalaFullKalahSettings): MancalaFullKalahState {
  return {
    board: freshBoard(),
    turn: 0,
    roundWinner: null,
    roundsPlayed: 0,
    matchScore: { p0: 0, p1: 0 },
    matchWinner: null,
    rngSeed: seed,
    settings,
    lastMove: null,
    lastCapturePit: null,
  };
}

/** Apply round-end consequences and possibly conclude the match. */
function resolveRoundEnd(
  state: MancalaFullKalahState,
  finalBoard: number[],
  lastMove: number,
  lastCapturePit: number | null,
  nextSeed: number,
): MancalaFullKalahState {
  const winner = determineRoundWinner(finalBoard);
  const roundsPlayed = state.roundsPlayed + 1;
  let matchScore = state.matchScore;
  if (winner === 0) matchScore = { p0: matchScore.p0 + 1, p1: matchScore.p1 };
  else if (winner === 1) matchScore = { p0: matchScore.p0, p1: matchScore.p1 + 1 };

  let matchWinner: 0 | 1 | "draw" | null = null;
  if (matchScore.p0 >= MATCH_TARGET) matchWinner = 0;
  else if (matchScore.p1 >= MATCH_TARGET) matchWinner = 1;
  else if (roundsPlayed >= MATCH_GAMES) {
    matchWinner = matchScore.p0 > matchScore.p1 ? 0 : matchScore.p1 > matchScore.p0 ? 1 : "draw";
  }

  return {
    ...state,
    rngSeed: nextSeed,
    board: finalBoard,
    roundWinner: winner,
    roundsPlayed,
    matchScore,
    matchWinner,
    lastMove,
    lastCapturePit,
  };
}

/* ---------------- CPU: 3-ply minimax ---------------- */

interface SimResult { board: number[]; turn: 0 | 1; over: boolean }

function applySimulatedMove(board: readonly number[], pit: number, seat: 0 | 1): SimResult {
  const { board: nb, extraTurn } = sowMove(board, pit, seat);
  if (isOver(nb)) {
    return { board: collectRemaining(nb), turn: seat, over: true };
  }
  const nextTurn: 0 | 1 = extraTurn ? seat : (seat === 0 ? 1 : 0);
  return { board: nb, turn: nextTurn, over: false };
}

function legalPits(board: readonly number[], seat: 0 | 1): number[] {
  return (myPits(seat) as readonly number[]).filter((p) => board[p]! > 0);
}

function evaluate(board: readonly number[], cpuSeat: 0 | 1): number {
  // Primary signal: store differential, plus a small tempo bonus for seeds
  // already on the CPU's side (closer to capture/store).
  const oppSeat: 0 | 1 = cpuSeat === 0 ? 1 : 0;
  const myStoreVal = board[myStore(cpuSeat)]!;
  const oppStoreVal = board[myStore(oppSeat)]!;
  let mySide = 0, oppSide = 0;
  for (const p of myPits(cpuSeat)) mySide += board[p]!;
  for (const p of myPits(oppSeat)) oppSide += board[p]!;
  return (myStoreVal - oppStoreVal) * 4 + (mySide - oppSide);
}

/** Minimax with alpha-beta. Returns the position evaluation from cpuSeat's POV. */
function minimax(
  board: readonly number[],
  toMove: 0 | 1,
  cpuSeat: 0 | 1,
  depth: number,
  alpha: number,
  beta: number,
): number {
  if (depth === 0 || isOver(board)) {
    const b = isOver(board) ? collectRemaining(board) : [...board];
    return evaluate(b, cpuSeat);
  }
  const pits = legalPits(board, toMove);
  if (pits.length === 0) {
    return evaluate(collectRemaining(board), cpuSeat);
  }
  const maximizing = toMove === cpuSeat;
  let best = maximizing ? -Infinity : Infinity;
  for (const p of pits) {
    const sim = applySimulatedMove(board, p, toMove);
    const v = sim.over
      ? evaluate(sim.board, cpuSeat)
      : minimax(sim.board, sim.turn, cpuSeat, depth - 1, alpha, beta);
    if (maximizing) {
      if (v > best) best = v;
      if (best > alpha) alpha = best;
    } else {
      if (v < best) best = v;
      if (best < beta) beta = best;
    }
    if (beta <= alpha) break;
  }
  return best;
}

function pickCpuMove(board: readonly number[], cpuSeat: 0 | 1, rng: () => number): number {
  const pits = legalPits(board, cpuSeat);
  if (pits.length === 0) return -1;
  let bestScore = -Infinity;
  let best: number[] = [];
  for (const p of pits) {
    const sim = applySimulatedMove(board, p, cpuSeat);
    const score = sim.over
      ? evaluate(sim.board, cpuSeat)
      : minimax(sim.board, sim.turn, cpuSeat, 3, -Infinity, Infinity);
    if (score > bestScore) { bestScore = score; best = [p]; }
    else if (score === bestScore) best.push(p);
  }
  return best[Math.floor(rng() * best.length)] ?? pits[0]!;
}

/* ---------------- reducer ---------------- */

function applyHumanMove(state: MancalaFullKalahState, pit: number): MancalaFullKalahState {
  const rng = mulberry32(state.rngSeed);
  const seedAfter = Math.floor(rng() * 2 ** 31);
  const { board: nb, extraTurn, capturePit } = sowMove(state.board, pit, state.turn);
  if (isOver(nb)) {
    return resolveRoundEnd(state, collectRemaining(nb), pit, capturePit, seedAfter);
  }
  const nextTurn: 0 | 1 = extraTurn ? state.turn : (state.turn === 0 ? 1 : 0);
  let next: MancalaFullKalahState = {
    ...state,
    rngSeed: seedAfter,
    board: nb,
    turn: nextTurn,
    lastMove: pit,
    lastCapturePit: capturePit,
  };

  // CPU plays out its whole chain (including extra turns).
  let safety = 32;
  while (next.roundWinner === null && next.turn === 1 && safety-- > 0) {
    const rng2 = mulberry32(next.rngSeed);
    const seedAfter2 = Math.floor(rng2() * 2 ** 31);
    const cpuPit = pickCpuMove(next.board, 1, rng2);
    if (cpuPit < 0) break;
    const { board: cb, extraTurn: ce, capturePit: cCap } = sowMove(next.board, cpuPit, 1);
    if (isOver(cb)) {
      next = resolveRoundEnd(next, collectRemaining(cb), cpuPit, cCap, seedAfter2);
      break;
    }
    const ct: 0 | 1 = ce ? 1 : 0;
    next = {
      ...next,
      rngSeed: seedAfter2,
      board: cb,
      turn: ct,
      lastMove: cpuPit,
      lastCapturePit: cCap,
    };
  }
  return next;
}

export function reducer(
  state: MancalaFullKalahState,
  action: MancalaFullKalahAction,
): MancalaFullKalahState {
  if (state.matchWinner !== null) return state;

  if (action.type === "nextRound") {
    if (state.roundWinner === null) return state;
    if (state.matchWinner !== null) return state;
    // Alternate who starts each round: loser of the previous round starts.
    // If draw, P0 starts.
    let starter: 0 | 1 = 0;
    if (state.roundWinner === 0) starter = 1;
    else if (state.roundWinner === 1) starter = 0;
    const rng = mulberry32(state.rngSeed);
    const seedAfter = Math.floor(rng() * 2 ** 31);
    let next: MancalaFullKalahState = {
      ...state,
      board: freshBoard(),
      turn: starter,
      roundWinner: null,
      rngSeed: seedAfter,
      lastMove: null,
      lastCapturePit: null,
    };
    // If CPU starts this round, let it play immediately.
    if (next.turn === 1) {
      let safety = 32;
      while (next.roundWinner === null && next.turn === 1 && safety-- > 0) {
        const rng2 = mulberry32(next.rngSeed);
        const seedAfter2 = Math.floor(rng2() * 2 ** 31);
        const cpuPit = pickCpuMove(next.board, 1, rng2);
        if (cpuPit < 0) break;
        const { board: cb, extraTurn: ce, capturePit: cCap } = sowMove(next.board, cpuPit, 1);
        if (isOver(cb)) {
          next = resolveRoundEnd(next, collectRemaining(cb), cpuPit, cCap, seedAfter2);
          break;
        }
        const ct: 0 | 1 = ce ? 1 : 0;
        next = {
          ...next,
          rngSeed: seedAfter2,
          board: cb,
          turn: ct,
          lastMove: cpuPit,
          lastCapturePit: cCap,
        };
      }
    }
    return next;
  }

  if (action.type !== "sow") return state;
  if (state.roundWinner !== null) return state;
  if (state.turn !== 0) return state;
  const pit = action.pit;
  if (!(P0_PITS as readonly number[]).includes(pit)) return state;
  if (state.board[pit] === 0) return state;
  return applyHumanMove(state, pit);
}

/* ---------------- terminal ---------------- */

export function isTerminal(state: MancalaFullKalahState): { score: number } | null {
  if (state.matchWinner === null) return null;
  // Score = (you-wins * 100) plus a bonus seed-margin tiebreaker, capped low.
  // Following the platform convention, 0 means loss.
  if (state.matchWinner === 0) {
    // higher wins = higher score; round-win count is what the prompt asked for.
    return { score: state.matchScore.p0 * 100 };
  }
  if (state.matchWinner === "draw") return { score: state.matchScore.p0 * 50 };
  // CPU won the match — leaderboard zero.
  return { score: 0 };
}
