import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface NimMultiSettings {
  piles: "5" | "7" | "9";
}

export interface NimMultiState {
  settings: NimMultiSettings;
  rngSeed: number;
  piles: number[];
  turn: "player" | "bot";
  gameOver: boolean;
  winner: "player" | "bot" | null;
  lastMove: { pile: number; count: number } | null;
  selected: { pile: number; count: number } | null;
}

export type NimMultiAction =
  | { type: "select"; pile: number; count: number }
  | { type: "take" }
  | { type: "restart" };

function generatePiles(n: number, rng: () => number): number[] {
  return Array.from({ length: n }, () => Math.floor(rng() * 9) + 2);
}

function nimXor(piles: number[]): number {
  return piles.reduce((acc, p) => acc ^ p, 0);
}

function botMove(piles: number[]): { pile: number; count: number } {
  const xorVal = nimXor(piles);
  if (xorVal !== 0) {
    for (let i = 0; i < piles.length; i++) {
      const target = piles[i]! ^ xorVal;
      if (target < piles[i]!) {
        return { pile: i, count: piles[i]! - target };
      }
    }
  }
  // Fallback: remove 1 from largest non-zero pile
  let maxIdx = 0;
  for (let i = 1; i < piles.length; i++) {
    if (piles[i]! > piles[maxIdx]!) maxIdx = i;
  }
  return { pile: maxIdx, count: 1 };
}

function checkWinner(piles: number[], justMoved: "player" | "bot"): "player" | "bot" | null {
  if (piles.reduce((a, b) => a + b, 0) === 0) return justMoved;
  return null;
}

export function initialState(seed: number, settings: NimMultiSettings): NimMultiState {
  const rng = mulberry32(seed);
  const n = parseInt(settings.piles, 10);
  return {
    settings,
    rngSeed: seed,
    piles: generatePiles(n, rng),
    turn: "player",
    gameOver: false,
    winner: null,
    lastMove: null,
    selected: null,
  };
}

export function reducer(state: NimMultiState, action: NimMultiAction): NimMultiState {
  if (action.type === "restart") {
    return initialState(state.rngSeed + 1, state.settings);
  }

  if (state.gameOver || state.turn !== "player") return state;

  if (action.type === "select") {
    const { pile, count } = action;
    if (pile < 0 || pile >= state.piles.length) return state;
    const maxCount = state.piles[pile]!;
    if (maxCount === 0) return state;
    const safeCount = Math.max(1, Math.min(count, maxCount));
    return { ...state, selected: { pile, count: safeCount } };
  }

  if (action.type === "take") {
    if (!state.selected) return state;
    const { pile, count } = state.selected;
    if (count <= 0 || count > state.piles[pile]!) return state;

    const newPiles = [...state.piles];
    newPiles[pile] = newPiles[pile]! - count;

    const winnerAfterPlayer = checkWinner(newPiles, "player");
    if (winnerAfterPlayer) {
      return { ...state, piles: newPiles, gameOver: true, winner: winnerAfterPlayer, lastMove: { pile, count }, selected: null };
    }

    // Bot turn
    const move = botMove(newPiles);
    const pilesAfterBot = [...newPiles];
    pilesAfterBot[move.pile] = pilesAfterBot[move.pile]! - move.count;
    const winnerAfterBot = checkWinner(pilesAfterBot, "bot");

    return {
      ...state,
      piles: pilesAfterBot,
      turn: "player",
      gameOver: winnerAfterBot !== null,
      winner: winnerAfterBot,
      lastMove: move,
      selected: null,
    };
  }

  return state;
}

export function isTerminal(state: NimMultiState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.winner === "player" ? 100 : 0 };
}
