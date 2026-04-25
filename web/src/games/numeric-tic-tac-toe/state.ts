import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Numeric TTT: players use numbers instead of X/O.
// Player 1 uses odd numbers 1,3,5,7,9; Player 2 uses even 2,4,6,8.
// Each number used only once. Win = any line of 3 summing to 15.
// Human is odd, AI is even.

export type Cell = number | null;

export interface NumericTTTState {
  rngSeed: number;
  board: Cell[];
  humanNumbers: number[];   // remaining odd numbers for human
  aiNumbers: number[];       // remaining even numbers for AI
  selectedNumber: number | null;
  currentPlayer: "human" | "ai";
  winner: "human" | "ai" | "draw" | null;
  gameOver: boolean;
}

export type NumericTTTAction =
  | { type: "selectNumber"; number: number }
  | { type: "place"; index: number };

const LINES: [number, number, number][] = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

function checkWinner(board: Cell[]): "human" | "ai" | "draw" | null {
  for (const [a, b, c] of LINES) {
    const va = board[a] ?? null, vb = board[b] ?? null, vc = board[c] ?? null;
    if (va !== null && vb !== null && vc !== null && (va as number) + (vb as number) + (vc as number) === 15) {
      // Determine who placed these — odd = human
      const isHuman = [va, vb, vc].every((v) => (v as number) % 2 === 1);
      const isAi = [va, vb, vc].every((v) => (v as number) % 2 === 0);
      if (isHuman) return "human";
      if (isAi) return "ai";
    }
  }
  if (board.every((c) => c !== null)) return "draw";
  return null;
}

function aiPick(board: Cell[], aiNumbers: number[], humanNumbers: number[], rng: () => number): { number: number; index: number } {
  // Try to win
  for (const [a, b, c] of LINES) {
    const cells = [board[a], board[b], board[c]];
    const evenNums = cells.filter((v): v is number => v !== null && (v as number) % 2 === 0);
    const emptySlots = [a, b, c].filter((idx) => board[idx] === null);
    if (evenNums.length === 2 && emptySlots.length === 1) {
      const sum = evenNums.reduce((a, b) => a + b, 0);
      const needed = 15 - sum;
      if (needed > 0 && needed % 2 === 0 && aiNumbers.includes(needed)) {
        return { number: needed, index: emptySlots[0]! };
      }
    }
  }
  // Block human
  for (const [a, b, c] of LINES) {
    const cells = [board[a], board[b], board[c]];
    const oddNums = cells.filter((v): v is number => v !== null && (v as number) % 2 === 1);
    const emptySlots = [a, b, c].filter((idx) => board[idx] === null);
    if (oddNums.length === 2 && emptySlots.length === 1) {
      const sum = oddNums.reduce((a, b) => a + b, 0);
      const needed = 15 - sum;
      if (needed > 0 && needed % 2 === 1 && humanNumbers.includes(needed)) {
        // Block with any available even
        const pick = aiNumbers[Math.floor(rng() * aiNumbers.length)] ?? aiNumbers[0]!;
        return { number: pick, index: emptySlots[0]! };
      }
    }
  }
  // Random
  const empties = board.map((v, i) => (v === null ? i : -1)).filter((i) => i !== -1);
  const num = aiNumbers[Math.floor(rng() * aiNumbers.length)] ?? aiNumbers[0]!;
  const idx = empties[Math.floor(rng() * empties.length)] ?? 0;
  return { number: num, index: idx };
}

export function initialState(seed: number): NumericTTTState {
  return {
    rngSeed: seed,
    board: Array(9).fill(null),
    humanNumbers: [1, 3, 5, 7, 9],
    aiNumbers: [2, 4, 6, 8],
    selectedNumber: null,
    currentPlayer: "human",
    winner: null,
    gameOver: false,
  };
}

export function reducer(state: NumericTTTState, action: NumericTTTAction): NumericTTTState {
  if (state.gameOver) return state;

  if (action.type === "selectNumber") {
    if (state.currentPlayer !== "human") return state;
    if (!state.humanNumbers.includes(action.number)) return state;
    return { ...state, selectedNumber: action.number };
  }

  if (action.type === "place") {
    if (state.currentPlayer !== "human") return state;
    if (state.selectedNumber === null) return state;
    if (state.board[action.index] !== null) return state;

    const board = [...state.board] as Cell[];
    board[action.index] = state.selectedNumber;
    const humanNumbers = state.humanNumbers.filter((n) => n !== state.selectedNumber);
    const winner = checkWinner(board);
    if (winner) {
      return { ...state, board, humanNumbers, selectedNumber: null, winner, gameOver: true };
    }

    // AI turn
    if (state.aiNumbers.length === 0) {
      return { ...state, board, humanNumbers, selectedNumber: null, currentPlayer: "human", winner: "draw", gameOver: true };
    }
    const rng = mulberry32(state.rngSeed);
    const { number: aiNum, index: aiIdx } = aiPick(board, state.aiNumbers, humanNumbers, rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    board[aiIdx] = aiNum;
    const aiNumbers = state.aiNumbers.filter((n) => n !== aiNum);
    const winner2 = checkWinner(board);
    const gameOver = winner2 !== null || (humanNumbers.length === 0 && aiNumbers.length === 0);
    return {
      ...state,
      rngSeed: nextSeed,
      board,
      humanNumbers,
      aiNumbers,
      selectedNumber: null,
      currentPlayer: "human",
      winner: winner2 ?? (gameOver ? "draw" : null),
      gameOver,
    };
  }

  return state;
}

export function isTerminal(state: NumericTTTState): { score: number } | null {
  if (!state.gameOver) return null;
  if (state.winner === "human") return { score: 1000 };
  if (state.winner === "draw") return { score: 500 };
  return { score: 0 };
}
