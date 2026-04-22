import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface NimSettings {
  piles: "3" | "4" | "5";
  rule: "standard" | "misere";
}

export interface NimState {
  settings: NimSettings;
  rngSeed: number;
  piles: number[];
  turn: "player" | "bot";
  gameOver: boolean;
  winner: "player" | "bot" | null;
  lastMove: { pile: number; count: number } | null;
}

export type NimAction =
  | { type: "remove"; pile: number; count: number }
  | { type: "restart" };

function generatePiles(numPiles: number, rng: () => number): number[] {
  // Each pile has 3-9 stones
  return Array.from({ length: numPiles }, () => Math.floor(rng() * 7) + 3);
}

export function initialState(seed: number, settings: NimSettings): NimState {
  const rng = mulberry32(seed);
  const numPiles = parseInt(settings.piles, 10);
  return {
    settings,
    rngSeed: seed,
    piles: generatePiles(numPiles, rng),
    turn: "player",
    gameOver: false,
    winner: null,
    lastMove: null,
  };
}

/** Nim XOR value — used for perfect play */
function nimXor(piles: number[]): number {
  return piles.reduce((acc, p) => acc ^ p, 0);
}

/** Perfect bot move for standard Nim (and misère with adjustment). */
function botMove(piles: number[], rule: "standard" | "misere"): { pile: number; count: number } {
  const totalStones = piles.reduce((a, b) => a + b, 0);
  const nonZeroPiles = piles.filter((p) => p > 0);

  // Misère end-game: if all remaining piles have at most 1 stone, strategy inverts
  if (rule === "misere" && nonZeroPiles.every((p) => p <= 1)) {
    // Leave an odd number of piles with 1 stone (so opponent takes the last)
    // Take from the first pile with >0 that lets us leave odd count
    for (let i = 0; i < piles.length; i++) {
      if (piles[i]! > 0) {
        return { pile: i, count: piles[i]! };
      }
    }
  }

  const xorVal = nimXor(piles);
  if (xorVal !== 0) {
    // Make a move that results in xor=0
    for (let i = 0; i < piles.length; i++) {
      const target = piles[i]! ^ xorVal;
      if (target < piles[i]!) {
        return { pile: i, count: piles[i]! - target };
      }
    }
  }

  // xor already 0 or fallback: remove 1 from the largest pile
  let maxIdx = 0;
  for (let i = 1; i < piles.length; i++) {
    if (piles[i]! > piles[maxIdx]!) maxIdx = i;
  }
  if (piles[maxIdx]! === 0) return { pile: 0, count: 0 }; // shouldn't happen
  return { pile: maxIdx, count: 1 };
}

function checkGameOver(piles: number[], rule: "standard" | "misere", justMoved: "player" | "bot"): "player" | "bot" | null {
  const total = piles.reduce((a, b) => a + b, 0);
  if (total > 0) return null;

  if (rule === "standard") {
    // Player who took the last stone wins
    return justMoved;
  } else {
    // Misère: player who took the last stone loses
    return justMoved === "player" ? "bot" : "player";
  }
}

export function reducer(state: NimState, action: NimAction): NimState {
  if (action.type === "restart") {
    return initialState(state.rngSeed + 1, state.settings);
  }

  if (action.type === "remove") {
    if (state.gameOver || state.turn !== "player") return state;
    const { pile, count } = action;
    if (pile < 0 || pile >= state.piles.length) return state;
    if (count <= 0 || count > state.piles[pile]!) return state;

    const newPiles = [...state.piles];
    newPiles[pile] = newPiles[pile]! - count;

    const winnerAfterPlayer = checkGameOver(newPiles, state.settings.rule, "player");
    if (winnerAfterPlayer !== null) {
      return { ...state, piles: newPiles, gameOver: true, winner: winnerAfterPlayer, lastMove: { pile, count }, turn: "bot" };
    }

    // Bot move
    const move = botMove(newPiles, state.settings.rule);
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);

    if (move.count === 0) {
      return { ...state, piles: newPiles, turn: "bot", lastMove: { pile, count }, rngSeed: nextSeed };
    }

    const pilesAfterBot = [...newPiles];
    pilesAfterBot[move.pile] = pilesAfterBot[move.pile]! - move.count;

    const winnerAfterBot = checkGameOver(pilesAfterBot, state.settings.rule, "bot");

    return {
      ...state,
      rngSeed: nextSeed,
      piles: pilesAfterBot,
      turn: "player",
      gameOver: winnerAfterBot !== null,
      winner: winnerAfterBot,
      lastMove: move,
    };
  }

  return state;
}

export function isTerminal(state: NimState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.winner === "player" ? 100 : 0 };
}
