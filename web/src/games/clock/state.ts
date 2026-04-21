import { type Card, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface ClockSettings {
  _dummy?: undefined;
}

/**
 * Clock solitaire state.
 *
 * 52 cards dealt face-down into 13 piles of 4 each.
 * Positions 0-11 = clock positions 1-12 (A-Q), position 12 = center (K).
 * Each pile is stored bottom→top (last element is top).
 * faceUp: how many top cards are face-up in each pile.
 */
export interface ClockState {
  piles: ClockPile[];
  currentPileIndex: number; // which pile we're currently drawing from
  score: number;
  movesMade: number;
  won: boolean;
  gameOver: boolean; // 4 kings revealed before all others = loss
  settings: ClockSettings;
}

export interface ClockPile {
  cards: Card[];
  faceUpCount: number;
}

export type ClockAction = { type: "flip" };

/** Map rank → pile index. A=0 (1 o'clock), 2=1, ..., Q=11 (12 o'clock), K=12 (center). */
function rankToPileIndex(rank: number): number {
  if (rank === 1) return 0;   // Ace → position 1 (index 0)
  if (rank === 13) return 12; // King → center
  return rank - 1;            // 2→1, 3→2, ..., Q→11
}

export function initialState(seed: number, settings: ClockSettings): ClockState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const piles: ClockPile[] = [];
  for (let i = 0; i < 13; i++) {
    piles.push({ cards: deck.slice(i * 4, i * 4 + 4), faceUpCount: 0 });
  }

  return {
    piles,
    currentPileIndex: 12, // start from center
    score: 0,
    movesMade: 0,
    won: false,
    gameOver: false,
    settings,
  };
}

export function reducer(state: ClockState, action: ClockAction): ClockState {
  if (state.won || state.gameOver) return state;

  switch (action.type) {
    case "flip": {
      const piles = state.piles.map((p) => ({ ...p, cards: [...p.cards] }));
      const currentPile = piles[state.currentPileIndex]!;

      // Find the top face-down card (from end, the first card where index < cards.length - faceUpCount)
      const faceDownIndex = currentPile.cards.length - 1 - currentPile.faceUpCount;
      if (faceDownIndex < 0) {
        // All cards in this pile are face-up. Shouldn't happen in normal play but guard.
        return state;
      }

      // Flip the top face-down card
      currentPile.faceUpCount++;
      const flippedCard = currentPile.cards[faceDownIndex]!;

      // Determine where this card goes
      const targetIndex = rankToPileIndex(flippedCard.rank as number);

      // Move flipped card to bottom of target pile's "draw queue" (it stays in place but
      // we need to track which pile to draw from next)
      // Actually in Clock solitaire: flip the top face-down card, place it face-up at that
      // clock position, then take the top face-down card from that position.
      // Simpler implementation: currentPileIndex becomes targetIndex.

      const kingCount = piles.reduce((sum, pile) => {
        const faceUpStart = pile.cards.length - pile.faceUpCount;
        return sum + pile.cards.slice(faceUpStart).filter((c) => c.rank === 13).length;
      }, 0);

      // Check if all non-king piles are face-up (win condition)
      const allNonKingFaceUp = piles.every((pile, idx) => {
        if (idx === 12) return true; // center (kings) doesn't count for win check here
        return pile.faceUpCount === pile.cards.length;
      });

      // Game over if 4th king is now face-up AND not all others face-up
      const centerPile = piles[12]!;
      const kingsUp = centerPile.faceUpCount;

      const won = allNonKingFaceUp && kingsUp <= 4;
      const gameOver = kingsUp === 4 && !allNonKingFaceUp;

      return {
        ...state,
        piles,
        currentPileIndex: targetIndex,
        score: state.score + 1,
        movesMade: state.movesMade + 1,
        won,
        gameOver,
      };

      void kingCount;
    }

    default:
      return state;
  }
}

export function isTerminal(state: ClockState): { score: number } | null {
  if (state.won) return { score: state.score };
  if (state.gameOver) return { score: 0 };
  return null;
}
