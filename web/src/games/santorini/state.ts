import { minimax } from "../../engines/grid/minimax.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// 5×5 grid. Heights 0-4 (0=ground, 1-3=levels, 4=dome/sealed).
// 2 players, 2 workers each. Worker positions stored as flat index (row*5+col).

export interface SantoriniSettings {
  dummy?: string;
}

export interface SantoriniState {
  settings: SantoriniSettings;
  // Board heights: flat array of 25 cells, value 0-4
  heights: readonly number[];
  // Worker positions: [p0w0, p0w1, p1w0, p1w1], -1 = not placed
  workers: readonly number[];
  turn: 0 | 1; // 0 = human, 1 = bot
  // Phase: "place0" (placing workers), "play", "over"
  phase: "place0" | "place1" | "play" | "over";
  // During play, which sub-step: select worker, move worker, build
  playStep: "select" | "move" | "build";
  selectedWorker: number | null; // index into workers array (0-3)
  movedTo: number | null; // position after moving
  winner: 0 | 1 | null;
  rngSeed: number;
}

export type SantoriniAction =
  | { type: "placeWorker"; pos: number }
  | { type: "selectWorker"; workerIdx: number }
  | { type: "moveWorker"; pos: number }
  | { type: "build"; pos: number };

const SIZE = 5;

export function posToCoord(pos: number): { row: number; col: number } {
  return { row: Math.floor(pos / SIZE), col: pos % SIZE };
}
export function coordToPos(row: number, col: number): number {
  return row * SIZE + col;
}

function adjPositions(pos: number): number[] {
  const { row, col } = posToCoord(pos);
  const result: number[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
        result.push(coordToPos(nr, nc));
      }
    }
  }
  return result;
}

function workerAt(workers: readonly number[], pos: number): boolean {
  return workers.some((w) => w === pos);
}

// Get legal moves for a worker at position
function legalMoves(heights: readonly number[], workers: readonly number[], pos: number): number[] {
  const curH = heights[pos]!;
  return adjPositions(pos).filter((adj) => {
    if (heights[adj]! >= 4) return false; // dome
    if (workerAt(workers, adj)) return false;
    if (heights[adj]! > curH + 1) return false; // too high
    return true;
  });
}

// Get legal build positions from a position
function legalBuilds(heights: readonly number[], workers: readonly number[], pos: number): number[] {
  return adjPositions(pos).filter((adj) => {
    if (heights[adj]! >= 4) return false; // already dome
    if (workerAt(workers, adj)) return false;
    return true;
  });
}

// Check if a player has any legal moves
function hasLegalMoves(heights: readonly number[], workers: readonly number[], playerIdx: 0 | 1): boolean {
  const w0 = workers[playerIdx * 2]!;
  const w1 = workers[playerIdx * 2 + 1]!;
  if (w0 < 0 || w1 < 0) return false;
  return (
    legalMoves(heights, workers, w0).some((to) => {
      const tmp = workers.map((w, i) => (i === playerIdx * 2 ? to : w));
      return legalBuilds(heights, tmp, to).length > 0;
    }) ||
    legalMoves(heights, workers, w1).some((to) => {
      const tmp = workers.map((w, i) => (i === playerIdx * 2 + 1 ? to : w));
      return legalBuilds(heights, tmp, to).length > 0;
    })
  );
}

// Eval: max own worker height - max opp height + bonus for being near level 3
function evalState(heights: readonly number[], workers: readonly number[], forSeat: 0 | 1): number {
  const opp: 0 | 1 = forSeat === 0 ? 1 : 0;
  const myH = Math.max(heights[workers[forSeat * 2]!]!, heights[workers[forSeat * 2 + 1]!]!);
  const oppH = Math.max(heights[workers[opp * 2]!]!, heights[workers[opp * 2 + 1]!]!);
  let score = (myH - oppH) * 100;
  // Bonus for adjacency to level 3 (not domed)
  for (let i = 0; i < 2; i++) {
    const wp = workers[forSeat * 2 + i]!;
    if (wp < 0) continue;
    for (const adj of adjPositions(wp)) {
      if (heights[adj] === 3) score += 10;
    }
  }
  return score;
}

interface BotSearchMove {
  workerIdx: 0 | 1; // 0 or 1 within bot's workers
  moveTo: number;
  buildAt: number;
}

interface BotSearchState {
  heights: readonly number[];
  workers: readonly number[];
  turn: 0 | 1;
}

function getBotMove(state: SantoriniState): BotSearchMove | null {
  const result = minimax<BotSearchState, BotSearchMove>(
    { heights: state.heights, workers: state.workers, turn: 1 },
    {
      depth: 3,
      moves(s) {
        const ms: BotSearchMove[] = [];
        for (const wi of [0, 1] as const) {
          const wp = s.workers[s.turn * 2 + wi];
          if (wp === undefined || wp < 0) continue;
          for (const moveTo of legalMoves(s.heights, s.workers, wp)) {
            const tmpWorkers = s.workers.map((w, i) => (i === s.turn * 2 + wi ? moveTo : w));
            for (const buildAt of legalBuilds(s.heights, tmpWorkers, moveTo)) {
              ms.push({ workerIdx: wi, moveTo, buildAt });
            }
          }
        }
        return ms;
      },
      apply(s, m) {
        const newWorkers = s.workers.map((w, i) => (i === s.turn * 2 + m.workerIdx ? m.moveTo : w));
        const newHeights = s.heights.map((h, i) => (i === m.buildAt ? h + 1 : h));
        return { heights: newHeights, workers: newWorkers, turn: (s.turn === 0 ? 1 : 0) as 0 | 1 };
      },
      isTerminal(s) {
        // Check win conditions
        for (const seat of [0, 1] as const) {
          for (let i = 0; i < 2; i++) {
            const wp = s.workers[seat * 2 + i];
            if (wp !== undefined && wp >= 0 && s.heights[wp] === 3) return true;
          }
        }
        return !hasLegalMoves(s.heights, s.workers, s.turn);
      },
      evaluate(s) {
        // Check immediate wins
        for (const seat of [0, 1] as const) {
          for (let i = 0; i < 2; i++) {
            const wp = s.workers[seat * 2 + i];
            if (wp !== undefined && wp >= 0 && s.heights[wp] === 3) {
              return seat === 1 ? 100000 : -100000;
            }
          }
        }
        return evalState(s.heights, s.workers, 1);
      },
      maximizing(s) { return s.turn === 1; },
    }
  );
  return result.move;
}

function runBot(state: SantoriniState): SantoriniState {
  let s = state;
  while (s.turn === 1 && s.phase === "play" && s.winner === null) {
    const rng = mulberry32(s.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);

    // Check if bot has legal moves
    if (!hasLegalMoves(s.heights, s.workers, 1)) {
      return { ...s, winner: 0, phase: "over", rngSeed: nextSeed };
    }

    const move = getBotMove(s);
    if (!move) {
      return { ...s, winner: 0, phase: "over", rngSeed: nextSeed };
    }

    const { workerIdx, moveTo, buildAt } = move;
    const newWorkers = s.workers.map((w, i) => (i === 1 * 2 + workerIdx ? moveTo : w));
    // Check win
    if (s.heights[moveTo] === 3) {
      return { ...s, workers: newWorkers, winner: 1, phase: "over", rngSeed: nextSeed };
    }
    const newHeights = s.heights.map((h, i) => (i === buildAt ? h + 1 : h));
    s = {
      ...s,
      heights: newHeights,
      workers: newWorkers,
      turn: 0,
      playStep: "select",
      selectedWorker: null,
      movedTo: null,
      rngSeed: nextSeed,
    };
    break;
  }
  return s;
}

export function initialState(seed: number, settings: SantoriniSettings): SantoriniState {
  return {
    settings,
    heights: new Array(25).fill(0),
    workers: [-1, -1, -1, -1],
    turn: 0,
    phase: "place0",
    playStep: "select",
    selectedWorker: null,
    movedTo: null,
    winner: null,
    rngSeed: seed,
  };
}

export function reducer(state: SantoriniState, action: SantoriniAction): SantoriniState {
  if (state.phase === "over" || state.winner !== null) return state;

  // Placement phase
  if (state.phase === "place0" || state.phase === "place1") {
    if (action.type !== "placeWorker") return state;
    const pos = action.pos;
    if (pos < 0 || pos >= 25) return state;
    if (workerAt(state.workers, pos)) return state;

    const newWorkers = [...state.workers];
    // Count placed workers for current player
    if (state.phase === "place0") {
      if (newWorkers[0] === -1) {
        newWorkers[0] = pos;
      } else if (newWorkers[1] === -1) {
        newWorkers[1] = pos;
        // Human placed both workers, now bot places
        // Bot places at simple positions
        const rng = mulberry32(state.rngSeed);
        const nextSeed = Math.floor(rng() * 2 ** 31);
        // Bot picks positions far from human
        const candidates = Array.from({ length: 25 }, (_, i) => i)
          .filter((p) => !newWorkers.includes(p));
        // Prefer corners / opposite side
        const preferred = [24, 20, 4, 0, 18, 6].filter((p) => candidates.includes(p));
        const pick1 = preferred[0] ?? candidates[0]!;
        const rem = candidates.filter((p) => p !== pick1);
        const pick2 = preferred[1] ?? rem[0]!;
        newWorkers[2] = pick1;
        newWorkers[3] = pick2;
        return {
          ...state,
          workers: newWorkers,
          phase: "play",
          turn: 0,
          rngSeed: nextSeed,
        };
      }
    }
    return { ...state, workers: newWorkers };
  }

  // Play phase
  if (state.phase === "play") {
    if (action.type === "selectWorker") {
      if (state.turn !== 0 || state.playStep !== "select") return state;
      const { workerIdx } = action;
      if (workerIdx < 0 || workerIdx > 1) return state; // only human workers
      const wp = state.workers[workerIdx]!;
      if (wp < 0) return state;
      const moves = legalMoves(state.heights, state.workers, wp);
      if (moves.length === 0) return state; // no moves from this worker
      return { ...state, selectedWorker: workerIdx, playStep: "move" };
    }

    if (action.type === "moveWorker") {
      if (state.turn !== 0 || state.playStep !== "move") return state;
      if (state.selectedWorker === null) return state;
      const wp = state.workers[state.selectedWorker]!;
      const moves = legalMoves(state.heights, state.workers, wp);
      if (!moves.includes(action.pos)) return state;

      const newWorkers = state.workers.map((w, i) => (i === state.selectedWorker ? action.pos : w));
      // Check win
      if (state.heights[action.pos] === 3) {
        return { ...state, workers: newWorkers, winner: 0, phase: "over", movedTo: action.pos };
      }
      return { ...state, workers: newWorkers, movedTo: action.pos, playStep: "build" };
    }

    if (action.type === "build") {
      if (state.turn !== 0 || state.playStep !== "build") return state;
      if (state.movedTo === null) return state;
      const builds = legalBuilds(state.heights, state.workers, state.movedTo);
      if (!builds.includes(action.pos)) return state;

      const newHeights = state.heights.map((h, i) => (i === action.pos ? h + 1 : h));
      // Check if bot has legal moves
      let next: SantoriniState = {
        ...state,
        heights: newHeights,
        turn: 1,
        playStep: "select",
        selectedWorker: null,
        movedTo: null,
      };

      if (!hasLegalMoves(newHeights, state.workers, 1)) {
        return { ...next, winner: 0, phase: "over" };
      }
      next = runBot(next);
      // After bot, check if human has legal moves
      if (next.winner === null && !hasLegalMoves(next.heights, next.workers, 0)) {
        next = { ...next, winner: 1, phase: "over" };
      }
      return next;
    }
  }

  return state;
}

export function isTerminal(state: SantoriniState): { score: number } | null {
  if (state.winner === null && state.phase !== "over") return null;
  if (state.winner === 0) return { score: 100 };
  if (state.winner === 1) return { score: 0 };
  return null;
}
