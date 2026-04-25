import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Clock Tournament Solitaire: a variant of Clock patience.
// Cards are dealt into 13 piles (12 clock positions + center).
// Flip the top card of the king pile (center), move it to its clock position pile.
// Kings go back to center. Win if all non-king cards are in correct piles before 4 kings face up.

export type Suit = "S" | "H" | "D" | "C";
export interface Card { value: number; suit: Suit; faceUp: boolean }

export interface SolitaireClockState {
  rngSeed: number;
  piles: Card[][];   // indices 0-12: 0=ace(1), 1=2,...,12=king
  currentPile: number; // king=12 to start
  moves: number;
  won: boolean;
  lost: boolean;
  gameOver: boolean;
}

export type SolitaireClockAction = { type: "flip" };

function buildDeck(rng: () => number): Card[] {
  const suits: Suit[] = ["S", "H", "D", "C"];
  const deck: Card[] = [];
  for (const suit of suits) {
    for (let v = 1; v <= 13; v++) {
      deck.push({ value: v, suit, faceUp: false });
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j]!, deck[i]!];
  }
  return deck;
}

export function initialState(seed: number): SolitaireClockState {
  const rng = mulberry32(seed);
  const deck = buildDeck(rng);
  // Deal 4 cards to each of 13 piles
  const piles: Card[][] = Array.from({ length: 13 }, () => []);
  for (let i = 0; i < 52; i++) {
    piles[i % 13]!.push(deck[i]!);
  }
  return {
    rngSeed: seed,
    piles,
    currentPile: 12, // start at king pile
    moves: 0,
    won: false,
    lost: false,
    gameOver: false,
  };
}

export function reducer(state: SolitaireClockState, action: SolitaireClockAction): SolitaireClockState {
  if (state.gameOver) return state;
  if (action.type !== "flip") return state;

  const piles = state.piles.map((p) => p.map((c) => ({ ...c })));
  const pile = piles[state.currentPile]!;
  const topCard = pile[pile.length - 1];
  if (!topCard || topCard.faceUp) {
    // Move to next pile with unflipped cards
    let next = (state.currentPile + 1) % 13;
    while (next !== state.currentPile && (piles[next]!.length === 0 || piles[next]![piles[next]!.length - 1]!.faceUp)) {
      next = (next + 1) % 13;
    }
    if (next === state.currentPile) {
      // No more moves
      return { ...state, lost: true, gameOver: true };
    }
    return { ...state, currentPile: next };
  }

  // Flip top card face up
  topCard.faceUp = true;
  const targetPile = topCard.value - 1; // 1->0, 13->12
  // Move this card to its target pile
  pile.pop();
  piles[targetPile]!.push(topCard);

  const moves = state.moves + 1;
  // Count face-up kings
  const kingsUp = piles[12]!.filter((c) => c.faceUp && c.value === 13).length;

  // Check win: all non-king piles have all cards face-up
  const allCorrect = piles.slice(0, 12).every((p, idx) =>
    p.every((c) => c.faceUp && c.value === idx + 1)
  );
  const won = allCorrect;
  const lost = kingsUp >= 4 && !won;
  const gameOver = won || lost;

  // Next pile: the pile where we just placed the card (face down cards there)
  const nextPile = piles[targetPile]!.some((c) => !c.faceUp) ? targetPile : state.currentPile;

  return {
    ...state,
    piles,
    currentPile: gameOver ? state.currentPile : nextPile,
    moves,
    won,
    lost,
    gameOver,
  };
}

export function isTerminal(state: SolitaireClockState): { score: number } | null {
  if (!state.gameOver) return null;
  if (state.won) return { score: Math.max(100, 1000 - state.moves * 5) };
  return { score: 0 };
}
