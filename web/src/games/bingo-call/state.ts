import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Bingo Call: solo bingo — fill your card before running out of calls.
// 5x5 card, FREE center, numbers 1-75 called one at a time.
// Win = complete a line (row, column, or diagonal).

export interface BingoCallState {
  rngSeed: number;
  card: number[][];         // 5x5 grid, 0 = FREE
  marked: boolean[][];      // which cells are daubed
  calledNumbers: number[];  // numbers called so far
  callPool: number[];       // numbers not yet called
  lastCall: number | null;
  bingo: boolean;
  gameOver: boolean;
}

export type BingoCallAction = { type: "call" };

function generateCard(rng: () => number): number[][] {
  // B:1-15, I:16-30, N:31-45, G:46-60, O:61-75
  const ranges = [[1, 15], [16, 30], [31, 45], [46, 60], [61, 75]] as [number, number][];
  return ranges.map(([lo, hi]) => {
    const pool = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
    // shuffle and take 5
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j]!, pool[i]!];
    }
    return pool.slice(0, 5);
  });
}

function checkBingo(marked: boolean[][]): boolean {
  for (let r = 0; r < 5; r++) {
    if (marked[r]!.every(Boolean)) return true;
  }
  for (let c = 0; c < 5; c++) {
    if (marked.every((row) => row[c])) return true;
  }
  if ([0, 1, 2, 3, 4].every((i) => marked[i]![i])) return true;
  if ([0, 1, 2, 3, 4].every((i) => marked[i]![4 - i])) return true;
  return false;
}

export function initialState(seed: number): BingoCallState {
  const rng = mulberry32(seed);
  // Generate card (columns x rows transposed)
  const cols = generateCard(rng);
  const card: number[][] = Array.from({ length: 5 }, (_, r) =>
    cols.map((col) => col[r]!)
  );
  // Center is FREE
  card[2]![2] = 0;
  const marked: boolean[][] = Array.from({ length: 5 }, (_, r) =>
    Array.from({ length: 5 }, (__, c) => r === 2 && c === 2)
  );
  // Shuffle call pool
  const pool = Array.from({ length: 75 }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    card,
    marked,
    calledNumbers: [],
    callPool: pool,
    lastCall: null,
    bingo: false,
    gameOver: false,
  };
}

export function reducer(state: BingoCallState, action: BingoCallAction): BingoCallState {
  if (state.gameOver) return state;
  if (action.type !== "call") return state;
  if (state.callPool.length === 0) return { ...state, gameOver: true };

  const [called, ...rest] = state.callPool;
  const marked = state.marked.map((row, r) =>
    row.map((m, c) => m || state.card[r]![c] === called)
  );
  const bingo = checkBingo(marked);
  const gameOver = bingo || rest.length === 0;
  return {
    ...state,
    callPool: rest,
    calledNumbers: [...state.calledNumbers, called!],
    lastCall: called!,
    marked,
    bingo,
    gameOver,
  };
}

export function isTerminal(state: BingoCallState): { score: number } | null {
  if (!state.gameOver) return null;
  if (state.bingo) {
    // Fewer calls to bingo = higher score
    return { score: Math.max(0, 1000 - (state.calledNumbers.length - 1) * 20) };
  }
  return { score: 0 };
}
