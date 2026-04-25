import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Card Flip Puzzle: a 4x4 grid of face-down cards.
// Flip any card to reveal it. Match pairs. Clear all pairs to win.
// Limited flips (2 per turn). Mismatches flip back.

export interface CardFlipPuzzleState {
  rngSeed: number;
  cards: number[];         // 16 cards, values 1-8 (two of each)
  revealed: boolean[];     // currently visible face-up
  matched: boolean[];      // permanently removed pairs
  flipA: number | null;    // first flip index this turn
  flipB: number | null;    // second flip index this turn
  moves: number;
  pairsFound: number;
  gameOver: boolean;
}

export type CardFlipPuzzleAction =
  | { type: "flip"; index: number }
  | { type: "clearMismatch" };

export function initialState(seed: number): CardFlipPuzzleState {
  const rng = mulberry32(seed);
  const deck = [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8];
  // shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j]!, deck[i]!];
  }
  return {
    rngSeed: seed,
    cards: deck,
    revealed: Array(16).fill(false),
    matched: Array(16).fill(false),
    flipA: null,
    flipB: null,
    moves: 0,
    pairsFound: 0,
    gameOver: false,
  };
}

export function reducer(state: CardFlipPuzzleState, action: CardFlipPuzzleAction): CardFlipPuzzleState {
  if (state.gameOver) return state;

  if (action.type === "clearMismatch") {
    if (state.flipA === null || state.flipB === null) return state;
    const revealed = [...state.revealed];
    revealed[state.flipA] = false;
    revealed[state.flipB] = false;
    return { ...state, revealed, flipA: null, flipB: null };
  }

  if (action.type === "flip") {
    const { index } = action;
    if (state.matched[index] || state.revealed[index]) return state;
    if (state.flipB !== null) return state; // waiting to clear

    const revealed = [...state.revealed];
    revealed[index] = true;

    if (state.flipA === null) {
      return { ...state, revealed, flipA: index };
    }

    // Second flip
    const flipA = state.flipA;
    const flipB = index;
    const moves = state.moves + 1;

    if (state.cards[flipA] === state.cards[flipB]) {
      // Match!
      const matched = [...state.matched];
      matched[flipA] = true;
      matched[flipB] = true;
      const pairsFound = state.pairsFound + 1;
      const gameOver = pairsFound === 8;
      return {
        ...state,
        revealed,
        matched,
        flipA: null,
        flipB: null,
        moves,
        pairsFound,
        gameOver,
      };
    }

    // Mismatch — stay revealed until clearMismatch
    return { ...state, revealed, flipA, flipB, moves };
  }

  return state;
}

export function isTerminal(state: CardFlipPuzzleState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: Math.max(0, 1000 - (state.moves - 8) * 30) };
}
