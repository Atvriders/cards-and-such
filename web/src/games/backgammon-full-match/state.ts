import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/* =============================================================================
 * Backgammon Full Match — match-to-7 play with doubling cube + Crawford rule.
 *
 * Board model
 * -----------
 *  - 24 points, indexed 0..23 from the player's perspective.
 *  - Each point holds a signed integer: positive = player (P) checkers,
 *    negative = computer (C) checkers, zero = empty.
 *  - The player (P) moves DOWN the indices (from 23 toward 0) and bears
 *    off when every checker is on points 0..5 (P's home quadrant).
 *  - The computer (C) moves UP the indices (from 0 toward 23) and bears
 *    off when every checker is on points 18..23 (C's home quadrant).
 *  - "bar" counters track hit checkers waiting to re-enter; "off"
 *    counters track checkers that have been borne off (0..15).
 *
 * Starting position (per rulebook, viewed from P's perspective):
 *   P:  2 on point 23, 5 on point 12, 3 on point 7, 5 on point 5
 *   C:  2 on point  0, 5 on point 11, 3 on point 16, 5 on point 18
 * (the C side mirrors the P side across the board)
 *
 * Match play
 * ----------
 *  - First side to `target` match points wins. Default target is 7.
 *  - Each finished game contributes `cube * multiplier` points where
 *    multiplier is 1 (single), 2 (gammon, loser has borne off 0) or 3
 *    (backgammon, loser still has checker on bar or in winner's home).
 *  - The doubling cube starts at 1, "centered" (either side may double).
 *    Either side may offer to double at the start of their turn before
 *    rolling. The opponent then "takes" (cube doubles and ownership
 *    flips) or "drops" (current cube value is awarded immediately).
 *  - Crawford rule: in the first game where either side reaches
 *    `target - 1` points the doubling cube is disabled for one game.
 *
 * AI
 * --
 *  - Heuristic evaluator combining
 *      pip   = own pip count - opponent pip count (lower is better)
 *      blots = exposed singletons in opponent's reach (penalty)
 *      prime = consecutive home-board points held by 2+ checkers (bonus)
 *      bar   = checkers stuck on the bar (heavy penalty)
 *      home  = points made inside own home board (bonus)
 *  - The CPU enumerates orderings of its dice and for each ordering does
 *    a greedy 1-ply search: for each die value it picks the legal move
 *    that maximizes the evaluator, then plays the next die from that
 *    state. The best ordering's full sequence is committed.
 *  - For doubling decisions the CPU compares pip counts: it offers when
 *    leading by 8+ pips and Crawford allows the cube, and it takes a
 *    double if it trails by at most 12 pips.
 *  - This is a tactical heuristic, not a neural net. For an XG-trained
 *    bot we would swap evaluator() for a learned NN; the rest of the
 *    pipeline stays unchanged.
 *
 * Determinism
 * -----------
 *  - All randomness is driven by `state.rngSeed` advanced through
 *    `mulberry32`; given the same seed and the same action sequence the
 *    state is reproducible.
 * ===========================================================================*/

export const POINTS = 24;
export const CHECKERS_PER_SIDE = 15;
export const DEFAULT_TARGET = 7;

export type Side = "P" | "C";
export type Phase =
  | "preRoll"          // current player chooses to double or roll
  | "doubleOffered"    // opponent must take or drop
  | "moving"           // dice rolled, moves available
  | "gameOver"         // single game finished, awaiting next-game button
  | "matchOver";       // match target reached

export interface Board {
  /** 24 signed slots; +N = P checkers, -N = C checkers. */
  points: number[];
  /** Checkers on the bar waiting to re-enter. */
  barP: number;
  barC: number;
  /** Checkers borne off. */
  offP: number;
  offC: number;
}

export interface MatchState {
  rngSeed: number;
  board: Board;
  /** 0..3 unused remaining die values for current player's turn. */
  diceRemaining: number[];
  /** The two physical dice for display (doubles yield 4 plays). */
  diceShown: [number, number];
  turn: Side;
  phase: Phase;
  /** Doubling cube. value is 1,2,4,8...; owner null = centered. */
  cubeValue: number;
  cubeOwner: Side | null;
  /** Match score. */
  scoreP: number;
  scoreC: number;
  target: number;
  /** True during the Crawford game (cube disabled). */
  crawford: boolean;
  /** Set after Crawford game ends — post-Crawford rule (cube freely available). */
  crawfordDone: boolean;
  /** Last game's result, for end-of-game panel. */
  lastResult: GameResult | null;
  /** Whose turn first rolls the next game (alternates). */
  startingSide: Side;
}

export interface GameResult {
  winner: Side;
  multiplier: 1 | 2 | 3; // single / gammon / backgammon
  cube: number;
  pointsAwarded: number;
  cubeDropped: boolean;
}

export interface BackgammonMatchSettings {
  matchTarget: number;
}

/** Action types. */
export type MatchAction =
  | { type: "offerDouble" }
  | { type: "takeDouble" }
  | { type: "dropDouble" }
  | { type: "roll" }
  | { type: "move"; from: number; dieValue: number } // from -1 = bar; to is derived
  | { type: "passMove" }                                // skip when no legal moves
  | { type: "endTurn" }
  | { type: "nextGame" }
  | { type: "resign" };

/* ---------- helpers ------------------------------------------------------ */

function emptyBoard(): Board {
  return { points: Array.from({ length: POINTS }, () => 0), barP: 0, barC: 0, offP: 0, offC: 0 };
}

export function startingBoard(): Board {
  const b = emptyBoard();
  // Player (P) — moves 23 -> 0
  b.points[23] = 2;
  b.points[12] = 5;
  b.points[7] = 3;
  b.points[5] = 5;
  // Computer (C) — mirror image
  b.points[0] = -2;
  b.points[11] = -5;
  b.points[16] = -3;
  b.points[18] = -5;
  return b;
}

function cloneBoard(b: Board): Board {
  return { points: b.points.slice(), barP: b.barP, barC: b.barC, offP: b.offP, offC: b.offC };
}

function rollDice(seed: number): { d: [number, number]; nextSeed: number } {
  const rng = mulberry32(seed);
  const d1 = Math.floor(rng() * 6) + 1;
  const d2 = Math.floor(rng() * 6) + 1;
  const ns = Math.floor(rng() * 2 ** 31);
  return { d: [d1, d2] as [number, number], nextSeed: ns };
}

function expandDice(d: [number, number]): number[] {
  return d[0] === d[1] ? [d[0], d[0], d[0], d[0]] : [d[0], d[1]];
}

/* ---------- pip / status ------------------------------------------------- */

export function pipCount(board: Board, side: Side): number {
  let pip = 0;
  if (side === "P") {
    for (let i = 0; i < POINTS; i++) {
      const v = board.points[i]!;
      if (v > 0) pip += v * (i + 1);
    }
    pip += board.barP * 25;
  } else {
    for (let i = 0; i < POINTS; i++) {
      const v = board.points[i]!;
      if (v < 0) pip += (-v) * (POINTS - i);
    }
    pip += board.barC * 25;
  }
  return pip;
}

function allInHome(board: Board, side: Side): boolean {
  if (side === "P") {
    if (board.barP > 0) return false;
    for (let i = 6; i < POINTS; i++) if ((board.points[i]!) > 0) return false;
    return true;
  } else {
    if (board.barC > 0) return false;
    for (let i = 0; i < 18; i++) if ((board.points[i]!) < 0) return false;
    return true;
  }
}

/* ---------- moves -------------------------------------------------------- */

/** Compute destination index for a side moving `die` pips from `from`. Returns
 *  one of: 0..23, -2 to indicate "bear off", or -3 if move illegal. `from`
 *  may be the special value -1 meaning "from the bar". */
export function destinationFor(side: Side, from: number, die: number): number {
  if (side === "P") {
    if (from === -1) {
      // enter from bar into points 18..23
      const to = 24 - die; // die=1 -> 23; die=6 -> 18
      return to;
    }
    const to = from - die;
    if (to < 0) return -2; // potential bear off
    return to;
  } else {
    if (from === -1) {
      const to = die - 1; // die=1 -> 0; die=6 -> 5
      return to;
    }
    const to = from + die;
    if (to >= POINTS) return -2;
    return to;
  }
}

/** Highest occupied point index in the player's home board (from their side).
 *  For P that's the largest index in 0..5 with a P checker; for C that's the
 *  smallest index in 18..23 with a C checker. Returns -1 if none. */
function highestHomeIndex(board: Board, side: Side): number {
  if (side === "P") {
    for (let i = 5; i >= 0; i--) if ((board.points[i]!) > 0) return i;
    return -1;
  } else {
    for (let i = 18; i < POINTS; i++) if ((board.points[i]!) < 0) return i;
    return -1;
  }
}

/** Can `side` legally move `die` pips from point `from`? Returns the move
 *  application (boards stay immutable) or null if illegal. */
export function tryMove(board: Board, side: Side, from: number, die: number): Board | null {
  if (die < 1 || die > 6) return null;
  // Must come off the bar first if any.
  if (side === "P" && board.barP > 0 && from !== -1) return null;
  if (side === "C" && board.barC > 0 && from !== -1) return null;

  if (from === -1) {
    if (side === "P" && board.barP === 0) return null;
    if (side === "C" && board.barC === 0) return null;
  } else {
    if (side === "P" && (board.points[from]! <= 0)) return null;
    if (side === "C" && (board.points[from]! >= 0)) return null;
  }

  const to = destinationFor(side, from, die);
  if (to === -3) return null;

  if (to === -2) {
    // Bear off: only legal if all checkers are in the home board AND either
    // - the die exactly clears the highest home checker, or
    // - the die exceeds and the moving checker is on the highest occupied home point.
    if (!allInHome(board, side)) return null;
    if (side === "P") {
      const exact = from - die === -1; // exact bear off (die == from+1)
      const overshoot = from - die < -1;
      if (exact) {
        const nb = cloneBoard(board);
        nb.points[from]!--;
        nb.offP++;
        return nb;
      }
      if (overshoot) {
        // Only legal if `from` is the highest occupied home point
        const hi = highestHomeIndex(board, "P");
        if (from !== hi) return null;
        const nb = cloneBoard(board);
        nb.points[from]!--;
        nb.offP++;
        return nb;
      }
      return null;
    } else {
      const exact = from + die === POINTS;
      const overshoot = from + die > POINTS;
      if (exact) {
        const nb = cloneBoard(board);
        nb.points[from]!++; // C checkers are negative; increment toward zero
        nb.offC++;
        return nb;
      }
      if (overshoot) {
        const hi = highestHomeIndex(board, "C");
        if (from !== hi) return null;
        const nb = cloneBoard(board);
        nb.points[from]!++;
        nb.offC++;
        return nb;
      }
      return null;
    }
  }

  // Regular move to `to`
  const destVal = board.points[to]!;
  if (side === "P") {
    if (destVal < -1) return null; // blocked by 2+ C checkers
    const nb = cloneBoard(board);
    if (from === -1) nb.barP--;
    else nb.points[from]!--;
    if (destVal === -1) {
      // hit blot
      nb.points[to] = 1;
      nb.barC++;
    } else {
      nb.points[to] = destVal + 1;
    }
    return nb;
  } else {
    if (destVal > 1) return null;
    const nb = cloneBoard(board);
    if (from === -1) nb.barC--;
    else nb.points[from]!++;
    if (destVal === 1) {
      nb.points[to] = -1;
      nb.barP++;
    } else {
      nb.points[to] = destVal - 1;
    }
    return nb;
  }
}

/** Enumerate every distinct (from, dieValue, resultingBoard) legal move
 *  for the side with the given remaining dice. */
export interface MoveOption { from: number; die: number; board: Board }

export function listMoves(board: Board, side: Side, dice: number[]): MoveOption[] {
  const out: MoveOption[] = [];
  const seenDice = new Set<number>();
  for (const die of dice) {
    if (seenDice.has(die)) continue;
    seenDice.add(die);
    // Bar entry first
    if ((side === "P" ? board.barP : board.barC) > 0) {
      const nb = tryMove(board, side, -1, die);
      if (nb) out.push({ from: -1, die, board: nb });
      continue; // when on bar only bar moves are legal
    }
    for (let from = 0; from < POINTS; from++) {
      if (side === "P" && board.points[from]! <= 0) continue;
      if (side === "C" && board.points[from]! >= 0) continue;
      const nb = tryMove(board, side, from, die);
      if (nb) out.push({ from, die, board: nb });
    }
  }
  return out;
}

/* ---------- AI evaluator ------------------------------------------------- */

function blotCount(board: Board, side: Side): number {
  let n = 0;
  for (let i = 0; i < POINTS; i++) {
    const v = board.points[i]!;
    if (side === "P" && v === 1) n++;
    if (side === "C" && v === -1) n++;
  }
  return n;
}

function pointsMadeInHome(board: Board, side: Side): number {
  let n = 0;
  if (side === "P") {
    for (let i = 0; i <= 5; i++) if (board.points[i]! >= 2) n++;
  } else {
    for (let i = 18; i < POINTS; i++) if (board.points[i]! <= -2) n++;
  }
  return n;
}

/** Higher is better for `side`. */
export function evaluate(board: Board, side: Side): number {
  const opp: Side = side === "P" ? "C" : "P";
  const myPip = pipCount(board, side);
  const oppPip = pipCount(board, opp);
  const myBar = side === "P" ? board.barP : board.barC;
  const myOff = side === "P" ? board.offP : board.offC;
  const myBlots = blotCount(board, side);
  const myHomePoints = pointsMadeInHome(board, side);

  // Lower own pip is better; higher opponent pip is better.
  let v = (oppPip - myPip) * 1.0;
  // Big penalty for our own checkers on the bar.
  v -= myBar * 30;
  // Reward borne-off checkers
  v += myOff * 12;
  // Light penalty per blot.
  v -= myBlots * 2.5;
  // Reward home-board points (priming).
  v += myHomePoints * 5;
  return v;
}

/** Best play for the side: try every ordering of `dice`, do a greedy 1-ply
 *  search for each ordering, return the sequence with the highest score and
 *  the final board after applying it. Includes "no legal move" handling
 *  (returns the input board if nothing playable). */
export function planTurn(board: Board, side: Side, dice: number[]): { board: Board; plays: { from: number; die: number }[] } {
  // Generate distinct orderings of dice (small: 2 or 4 elements).
  function permutations(arr: number[]): number[][] {
    if (arr.length <= 1) return [arr.slice()];
    const out: number[][] = [];
    const seen = new Set<string>();
    for (let i = 0; i < arr.length; i++) {
      const rest = arr.slice(0, i).concat(arr.slice(i + 1));
      for (const p of permutations(rest)) {
        const key = String([arr[i]!, ...p]);
        if (seen.has(key)) continue;
        seen.add(key);
        out.push([arr[i]!, ...p]);
      }
    }
    return out;
  }
  const orderings = permutations(dice);
  let bestScore = -Infinity;
  let bestBoard = board;
  let bestPlays: { from: number; die: number }[] = [];
  for (const ordering of orderings) {
    let cur = board;
    const plays: { from: number; die: number }[] = [];
    for (const die of ordering) {
      const opts = listMoves(cur, side, [die]);
      if (opts.length === 0) continue;
      let bScore = -Infinity;
      let bOpt = opts[0]!;
      for (const o of opts) {
        const s = evaluate(o.board, side);
        if (s > bScore) { bScore = s; bOpt = o; }
      }
      cur = bOpt.board;
      plays.push({ from: bOpt.from, die: bOpt.die });
    }
    const score = evaluate(cur, side);
    if (score > bestScore) {
      bestScore = score;
      bestBoard = cur;
      bestPlays = plays;
    }
  }
  return { board: bestBoard, plays: bestPlays };
}

/* ---------- match flow --------------------------------------------------- */

export function initialState(seed: number, s: BackgammonMatchSettings): MatchState {
  const target = Math.max(1, Math.floor(s.matchTarget || DEFAULT_TARGET));
  return {
    rngSeed: seed >>> 0,
    board: startingBoard(),
    diceRemaining: [],
    diceShown: [0, 0],
    turn: "P",
    phase: "preRoll",
    cubeValue: 1,
    cubeOwner: null,
    scoreP: 0,
    scoreC: 0,
    target,
    crawford: false,
    crawfordDone: false,
    lastResult: null,
    startingSide: "P",
  };
}

function isCubeAvailableTo(state: MatchState, side: Side): boolean {
  if (state.crawford) return false;
  if (state.cubeOwner === null) return true;
  return state.cubeOwner === side;
}

function determineMultiplier(board: Board, loser: Side): 1 | 2 | 3 {
  // Backgammon: loser still on bar OR has a checker in winner's home board.
  if (loser === "P") {
    if (board.offP > 0) return 1; // not even a gammon
    if (board.barP > 0) return 3;
    // any P checker in C's home (points 18..23)?
    for (let i = 18; i < POINTS; i++) if ((board.points[i]!) > 0) return 3;
    return 2;
  } else {
    if (board.offC > 0) return 1;
    if (board.barC > 0) return 3;
    for (let i = 0; i <= 5; i++) if ((board.points[i]!) < 0) return 3;
    return 2;
  }
}

function checkWin(state: MatchState): MatchState {
  // Winner if any side reached 15 borne off.
  if (state.board.offP >= CHECKERS_PER_SIDE || state.board.offC >= CHECKERS_PER_SIDE) {
    const winner: Side = state.board.offP >= CHECKERS_PER_SIDE ? "P" : "C";
    const loser: Side = winner === "P" ? "C" : "P";
    const mult = determineMultiplier(state.board, loser);
    const pts = state.cubeValue * mult;
    const next: MatchState = { ...state, lastResult: { winner, multiplier: mult, cube: state.cubeValue, pointsAwarded: pts, cubeDropped: false } };
    if (winner === "P") next.scoreP = state.scoreP + pts;
    else next.scoreC = state.scoreC + pts;
    next.phase = (next.scoreP >= next.target || next.scoreC >= next.target) ? "matchOver" : "gameOver";
    // After a Crawford game finishes, mark crawfordDone.
    if (state.crawford) { next.crawford = false; next.crawfordDone = true; }
    return next;
  }
  return state;
}

function postMoveAdvance(state: MatchState): MatchState {
  // If win occurred, finalize.
  const w = checkWin(state);
  if (w !== state) return w;
  // If still dice left and current side has legal play, stay in moving phase.
  if (state.diceRemaining.length > 0) {
    const opts = listMoves(state.board, state.turn, state.diceRemaining);
    if (opts.length > 0) return state;
  }
  // Otherwise, end of player's turn. Pass to opponent.
  const nextTurn: Side = state.turn === "P" ? "C" : "P";
  return { ...state, turn: nextTurn, diceRemaining: [], diceShown: [0, 0], phase: "preRoll" };
}

/** Apply the CPU's whole turn (after the human ends theirs or CPU's preRoll). */
function runCpuTurn(state: MatchState): MatchState {
  if (state.turn !== "C" || state.phase !== "preRoll") return state;
  // 1) CPU doubling decision (skipped during Crawford and if it doesn't own cube)
  let s = state;
  if (isCubeAvailableTo(s, "C") && shouldCpuDouble(s)) {
    s = { ...s, phase: "doubleOffered", turn: "C" };
    return s; // player must respond
  }
  // 2) Roll
  const r = rollDice(s.rngSeed);
  const dice = expandDice(r.d);
  s = { ...s, rngSeed: r.nextSeed, diceShown: r.d, diceRemaining: dice, phase: "moving" };
  // 3) Plan and apply best moves greedily
  const plan = planTurn(s.board, "C", dice);
  let b = s.board;
  let remaining = dice.slice();
  for (const p of plan.plays) {
    const nb = tryMove(b, "C", p.from, p.die);
    if (!nb) break;
    b = nb;
    const idx = remaining.indexOf(p.die);
    if (idx >= 0) remaining.splice(idx, 1);
  }
  s = { ...s, board: b, diceRemaining: remaining };
  const won = checkWin(s);
  if (won !== s) return won;
  // 4) End CPU's turn
  return { ...s, turn: "P", diceRemaining: [], diceShown: [0, 0], phase: "preRoll" };
}

function shouldCpuDouble(state: MatchState): boolean {
  // Crawford disables doubling.
  if (state.crawford) return false;
  // Don't double if cube already huge enough to clinch (a double in a final
  // game offers no benefit when the CPU is also in winning range).
  const myPip = pipCount(state.board, "C");
  const opPip = pipCount(state.board, "P");
  const lead = opPip - myPip;
  // Offer when ahead by 8+ pips and not already on the bar
  if (state.board.barC > 0) return false;
  if (lead < 8) return false;
  // Limit ridiculous escalation (cube above 8 unlikely heuristically).
  if (state.cubeValue >= 8) return false;
  return true;
}

function shouldCpuAcceptDouble(state: MatchState): boolean {
  if (state.crawford) return false;
  const myPip = pipCount(state.board, "C");
  const opPip = pipCount(state.board, "P");
  // CPU accepts if it isn't more than 12 pips behind P.
  return myPip - opPip <= 12;
}

/* ---------- reducer ------------------------------------------------------ */

function startNewGame(state: MatchState): MatchState {
  const nextStart: Side = state.startingSide === "P" ? "C" : "P";
  const willBeCrawford = !state.crawford && !state.crawfordDone &&
    (state.scoreP === state.target - 1 || state.scoreC === state.target - 1);
  return {
    ...state,
    board: startingBoard(),
    diceRemaining: [],
    diceShown: [0, 0],
    turn: nextStart,
    phase: "preRoll",
    cubeValue: 1,
    cubeOwner: null,
    crawford: willBeCrawford,
    lastResult: null,
    startingSide: nextStart,
  };
}

export function reducer(state: MatchState, action: MatchAction): MatchState {
  if (state.phase === "matchOver") return state;

  // Next-game button between games
  if (action.type === "nextGame" && state.phase === "gameOver") {
    return startNewGame(state);
  }

  // Resign the entire current game (player gives one cube-value of points).
  if (action.type === "resign" && (state.phase === "preRoll" || state.phase === "moving") && state.turn === "P") {
    const pts = state.cubeValue;
    const next: MatchState = {
      ...state,
      scoreC: state.scoreC + pts,
      lastResult: { winner: "C", multiplier: 1, cube: state.cubeValue, pointsAwarded: pts, cubeDropped: true },
    };
    next.phase = next.scoreC >= next.target ? "matchOver" : "gameOver";
    if (state.crawford) { next.crawford = false; next.crawfordDone = true; }
    return next;
  }

  // Doubling cube — offer
  if (action.type === "offerDouble" && state.phase === "preRoll" && state.turn === "P") {
    if (!isCubeAvailableTo(state, "P")) return state;
    return { ...state, phase: "doubleOffered" };
  }

  // Doubling cube — take/drop responses
  if (action.type === "takeDouble" && state.phase === "doubleOffered") {
    // The non-current-turn side took the cube; current turn keeps moving.
    const taker: Side = state.turn === "P" ? "C" : "P";
    const newCube = state.cubeValue * 2;
    let s: MatchState = { ...state, cubeValue: newCube, cubeOwner: taker, phase: "preRoll" };
    // If it was the CPU's turn that offered, resume CPU turn.
    if (s.turn === "C") s = runCpuTurn(s);
    return s;
  }
  if (action.type === "dropDouble" && state.phase === "doubleOffered") {
    const dropper: Side = state.turn === "P" ? "C" : "P";
    const winner: Side = dropper === "P" ? "C" : "P";
    const pts = state.cubeValue;
    const next: MatchState = {
      ...state,
      lastResult: { winner, multiplier: 1, cube: state.cubeValue, pointsAwarded: pts, cubeDropped: true },
    };
    if (winner === "P") next.scoreP = state.scoreP + pts;
    else next.scoreC = state.scoreC + pts;
    next.phase = (next.scoreP >= next.target || next.scoreC >= next.target) ? "matchOver" : "gameOver";
    if (state.crawford) { next.crawford = false; next.crawfordDone = true; }
    return next;
  }

  // Player rolls
  if (action.type === "roll" && state.phase === "preRoll" && state.turn === "P") {
    const r = rollDice(state.rngSeed);
    const dice = expandDice(r.d);
    let s: MatchState = { ...state, rngSeed: r.nextSeed, diceShown: r.d, diceRemaining: dice, phase: "moving" };
    // If no legal moves at all, immediately pass turn.
    const opts = listMoves(s.board, "P", s.diceRemaining);
    if (opts.length === 0) {
      s = { ...s, diceRemaining: [], turn: "C", phase: "preRoll" };
      return runCpuTurn(s);
    }
    return s;
  }

  // Player move
  if (action.type === "move" && state.phase === "moving" && state.turn === "P") {
    if (!state.diceRemaining.includes(action.dieValue)) return state;
    const nb = tryMove(state.board, "P", action.from, action.dieValue);
    if (!nb) return state;
    const rem = state.diceRemaining.slice();
    rem.splice(rem.indexOf(action.dieValue), 1);
    let s: MatchState = { ...state, board: nb, diceRemaining: rem };
    s = postMoveAdvance(s);
    if (s.phase === "preRoll" && s.turn === "C") return runCpuTurn(s);
    return s;
  }

  // Player explicitly skips remaining dice
  if (action.type === "passMove" && state.phase === "moving" && state.turn === "P") {
    let s: MatchState = { ...state, diceRemaining: [] };
    s = postMoveAdvance(s);
    if (s.phase === "preRoll" && s.turn === "C") return runCpuTurn(s);
    return s;
  }

  // Player ends turn (only legal when no dice remaining or no legal moves)
  if (action.type === "endTurn" && state.phase === "moving" && state.turn === "P") {
    if (state.diceRemaining.length > 0) {
      const opts = listMoves(state.board, "P", state.diceRemaining);
      if (opts.length > 0) return state;
    }
    let s: MatchState = { ...state, diceRemaining: [], diceShown: [0, 0], turn: "C", phase: "preRoll" };
    return runCpuTurn(s);
  }

  return state;
}

/* ---------- terminal ----------------------------------------------------- */

export function isTerminal(state: MatchState): { score: number } | null {
  if (state.phase !== "matchOver") return null;
  // Score: positive if player won the match; 0 if CPU won.
  if (state.scoreP > state.scoreC) {
    return { score: 100 + state.scoreP * 10 + (state.target - state.scoreC) };
  }
  return { score: 0 };
}

/* ---------- exports for tests ------------------------------------------- */

export const __test = {
  startingBoard,
  rollDice,
  expandDice,
  tryMove,
  listMoves,
  destinationFor,
  evaluate,
  planTurn,
  pipCount,
  determineMultiplier,
  shouldCpuAcceptDouble,
};
