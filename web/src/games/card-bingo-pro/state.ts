import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CardBingoProSettings {
  cards: "1" | "2" | "4";
}

// Card Bingo Pro: 5x5 Bingo cards (B-I-N-G-O columns 1-15, 16-30, 31-45, 46-60, 61-75)
// FREE space at center. Draw numbers, mark them, first to complete a line wins.
export type BingoCard = number[]; // 25 numbers, index 12 = FREE (0)

export interface CardBingoPro {
  settings: CardBingoProSettings;
  rngSeed: number;
  cards: BingoCard[];
  marked: boolean[][];      // marked[cardIdx][cellIdx]
  drawn: number[];          // numbers drawn so far
  lastDrawn: number | null;
  numCards: number;
  bingoCards: number[];     // which card indices have bingo
  callsLeft: number;
  gameOver: boolean;
  score: number;
}

export type CardBingoProAction =
  | { type: "draw" };

const COL_RANGES: [number, number][] = [[1,15],[16,30],[31,45],[46,60],[61,75]];

function generateCard(rng: () => number): BingoCard {
  const card: number[] = [];
  for (let col = 0; col < 5; col++) {
    const [lo, hi] = COL_RANGES[col]!;
    const pool = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
    // shuffle and pick 5
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j]!, pool[i]!];
    }
    for (let row = 0; row < 5; row++) card[row * 5 + col] = pool[row]!;
  }
  card[12] = 0; // FREE space
  return card;
}

function checkBingo(marked: boolean[]): boolean {
  // rows
  for (let r = 0; r < 5; r++) {
    if ([0,1,2,3,4].every(c => marked[r*5+c])) return true;
  }
  // cols
  for (let c = 0; c < 5; c++) {
    if ([0,1,2,3,4].every(r => marked[r*5+c])) return true;
  }
  // diagonals
  if ([0,6,12,18,24].every(i => marked[i])) return true;
  if ([4,8,12,16,20].every(i => marked[i])) return true;
  return false;
}

export function initialState(seed: number, settings: CardBingoProSettings): CardBingoPro {
  const rng = mulberry32(seed);
  const numCards = parseInt(settings.cards, 10);
  const cards: BingoCard[] = [];
  for (let i = 0; i < numCards; i++) cards.push(generateCard(rng));

  const marked: boolean[][] = cards.map(card => card.map(n => n === 0));
  const newSeed = (mulberry32(seed)() * 2**31) >>> 0;

  return {
    settings,
    rngSeed: newSeed,
    cards,
    marked,
    drawn: [],
    lastDrawn: null,
    numCards,
    bingoCards: [],
    callsLeft: 75,
    gameOver: false,
    score: 0,
  };
}

export function reducer(state: CardBingoPro, action: CardBingoProAction): CardBingoPro {
  if (state.gameOver) return state;

  if (action.type === "draw") {
    if (state.callsLeft <= 0) return state;

    // Draw a number not yet drawn
    const rng = mulberry32(state.rngSeed);
    const available = Array.from({ length: 75 }, (_, i) => i + 1).filter(n => !state.drawn.includes(n));
    if (available.length === 0) return { ...state, gameOver: true };
    const drawn = available[Math.floor(rng() * available.length)]!;
    const newSeed = (state.rngSeed ^ (drawn * 0x6d2b79f5)) >>> 0;

    const allDrawn = [...state.drawn, drawn];

    // Mark cards
    const newMarked = state.marked.map((marks, ci) =>
      marks.map((m, i) => m || state.cards[ci]![i] === drawn)
    );

    // Check for new bingos
    const newBingoCards = newMarked
      .map((marks, i) => ({ i, bingo: checkBingo(marks) }))
      .filter(r => r.bingo && !state.bingoCards.includes(r.i))
      .map(r => r.i);

    const allBingos = [...state.bingoCards, ...newBingoCards];
    const gameOver = allBingos.length > 0;
    const score = gameOver ? Math.max(0, (75 - allDrawn.length) * 20 + allBingos.length * 100) : 0;

    return {
      ...state,
      rngSeed: newSeed,
      drawn: allDrawn,
      lastDrawn: drawn,
      marked: newMarked,
      bingoCards: allBingos,
      callsLeft: state.callsLeft - 1,
      gameOver,
      score,
    };
  }

  return state;
}

export function isTerminal(state: CardBingoPro): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.score };
}
