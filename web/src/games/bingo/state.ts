import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface BingoSettings {
  difficulty: "easy" | "medium" | "hard";
}

/** 5x5 bingo card. center [2][2] = FREE */
export type BingoCard = number[][]; // 5x5, 0 = free

export interface BingoState {
  settings: BingoSettings;
  rngSeed: number;
  card: BingoCard;
  marked: boolean[][]; // which cells player has marked
  drawOrder: number[];  // 1-75, seeded random draw order
  currentDrawIdx: number; // how many have been drawn so far
  currentNumber: number | null;
  opponentCards: BingoCard[];    // N opponent cards (auto-marked)
  opponentMarked: boolean[][][]; // per opponent
  opponentWon: number | null;    // which opponent won (-1=none)
  playerWon: boolean;
  gameOver: boolean;
  drawCount: number; // how many numbers drawn total
}

export type BingoAction =
  | { type: "draw" }
  | { type: "mark"; row: number; col: number };

// Column ranges: B=1-15, I=16-30, N=31-45, G=46-60, O=61-75
const COL_RANGES: [number, number][] = [
  [1, 15],
  [16, 30],
  [31, 45],
  [46, 60],
  [61, 75],
];

function generateCard(rng: () => number): BingoCard {
  const card: number[][] = [];
  for (let col = 0; col < 5; col++) {
    const [lo, hi] = COL_RANGES[col]!;
    const pool: number[] = [];
    for (let n = lo; n <= hi; n++) pool.push(n);
    // shuffle pool and take 5
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j]!, pool[i]!];
    }
    card.push(pool.slice(0, 5));
  }
  // Transpose: card[row][col]
  const transposed: number[][] = [];
  for (let r = 0; r < 5; r++) {
    transposed.push(card.map((col) => col[r]!));
  }
  // Center is FREE
  transposed[2]![2] = 0;
  return transposed;
}

function generateDrawOrder(rng: () => number): number[] {
  const pool: number[] = [];
  for (let n = 1; n <= 75; n++) pool.push(n);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool;
}

function initMarked(card: BingoCard): boolean[][] {
  return card.map((row, r) => row.map((n, c) => r === 2 && c === 2 ? true : false));
}

function checkBingo(marked: boolean[][]): boolean {
  // Rows
  for (let r = 0; r < 5; r++) {
    if (marked[r]!.every(Boolean)) return true;
  }
  // Cols
  for (let c = 0; c < 5; c++) {
    if (marked.every((row) => row[c])) return true;
  }
  // Diagonals
  if ([0, 1, 2, 3, 4].every((i) => marked[i]![i])) return true;
  if ([0, 1, 2, 3, 4].every((i) => marked[i]![4 - i])) return true;
  return false;
}

function autoMarkCard(card: BingoCard, marked: boolean[][], drawn: Set<number>): boolean[][] {
  return card.map((row, r) => row.map((n, c) => marked[r]![c]! || drawn.has(n) || n === 0));
}

function opponentCount(difficulty: "easy" | "medium" | "hard"): number {
  if (difficulty === "easy") return 1;
  if (difficulty === "medium") return 3;
  return 6;
}

export function initialState(seed: number, settings: BingoSettings): BingoState {
  const rng = mulberry32(seed);
  const card = generateCard(rng);
  const numOpponents = opponentCount(settings.difficulty);
  const opponentCards: BingoCard[] = Array.from({ length: numOpponents }, () => generateCard(rng));
  const drawOrder = generateDrawOrder(rng);

  return {
    settings,
    rngSeed: seed,
    card,
    marked: initMarked(card),
    drawOrder,
    currentDrawIdx: 0,
    currentNumber: null,
    opponentCards,
    opponentMarked: opponentCards.map((c) => initMarked(c)),
    opponentWon: null,
    playerWon: false,
    gameOver: false,
    drawCount: 0,
  };
}

export function reducer(state: BingoState, action: BingoAction): BingoState {
  if (state.gameOver) return state;

  if (action.type === "draw") {
    if (state.currentDrawIdx >= state.drawOrder.length) return state;

    const currentNumber = state.drawOrder[state.currentDrawIdx]!;
    const newDrawIdx = state.currentDrawIdx + 1;
    const drawCount = state.drawCount + 1;

    // Auto-mark opponent cards
    const drawnSoFar = new Set(state.drawOrder.slice(0, newDrawIdx));
    const newOpponentMarked = state.opponentCards.map((card, i) =>
      autoMarkCard(card, state.opponentMarked[i]!, drawnSoFar)
    );

    // Check if any opponent has bingo
    let opponentWon: number | null = state.opponentWon;
    for (let i = 0; i < newOpponentMarked.length; i++) {
      if (checkBingo(newOpponentMarked[i]!)) {
        opponentWon = i;
        break;
      }
    }

    const gameOver = opponentWon !== null || state.playerWon;

    return {
      ...state,
      currentDrawIdx: newDrawIdx,
      currentNumber,
      opponentMarked: newOpponentMarked,
      opponentWon,
      drawCount,
      gameOver,
    };
  }

  if (action.type === "mark") {
    const { row, col } = action;
    if (row < 0 || row > 4 || col < 0 || col > 4) return state;
    const cellValue = state.card[row]![col]!;
    if (cellValue === 0) return state; // FREE always marked
    if (state.currentNumber === null || cellValue !== state.currentNumber) return state; // can only mark current number
    if (state.marked[row]![col]) return state; // already marked

    const newMarked = state.marked.map((r, ri) =>
      ri === row ? r.map((v, ci) => ci === col ? true : v) : r
    );
    const playerWon = checkBingo(newMarked);
    const gameOver = playerWon || state.opponentWon !== null;

    return {
      ...state,
      marked: newMarked,
      playerWon,
      gameOver,
    };
  }

  return state;
}

export function isTerminal(state: BingoState): { score: number } | null {
  if (!state.gameOver) return null;
  if (state.playerWon) return { score: Math.max(100, 1000 - state.drawCount * 10) };
  return { score: 0 };
}

export { checkBingo };
