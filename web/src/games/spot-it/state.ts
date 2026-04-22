import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Spot It / Dobble implementation using a projective plane design
// We use order 7 (8 symbols per card, 57 cards) — classic Dobble.
// For simplicity, we use a pre-generated 30-card subset with 8 emoji symbols per card.

// Using order 2 Fano plane gives 7 cards × 3 symbols — too small.
// We'll use a mathematical construction for order 7:
// 57 cards, 8 symbols each, any two cards share exactly 1 symbol.
// We generate a subset of 30 cards for gameplay.

// Symbols (57 symbols for order-7 projective plane)
const SYMBOLS = [
  "🌟","🌊","🔥","🌙","☀️","🌈","⚡","🎵","🎯","🎮",
  "🎨","🎭","🎪","🏆","🎲","🃏","🎸","🎺","🎻","🥁",
  "🌺","🌸","🌼","🍀","🌿","🌱","🌲","🌳","🌴","🍁",
  "🦁","🐯","🐻","🦊","🐺","🦝","🐗","🦌","🐘","🦏",
  "🦋","🐝","🐞","🦗","🕷️","🦂","🐢","🦎","🐍","🦕",
  "🍎","🍊","🍋","🍇","🍓","🍑","🥝",
];

// Generate a valid Dobble-style deck using mathematical projective plane
// For order p (prime), we have p^2+p+1 cards, each with p+1 symbols
// Using p=7: 57 cards, 8 symbols each

function generateProjectivePlane(p: number): number[][] {
  const n = p * p + p + 1;
  const cards: number[][] = [];

  // Point representation: each point is an equivalence class of (a:b:c) in PG(2,p)
  // Card i corresponds to a line in PG(2,p)
  // We use the algebraic construction

  // Generate all points (n points)
  const points: [number, number, number][] = [];
  // Points of the form (1:y:z)
  for (let y = 0; y < p; y++) {
    for (let z = 0; z < p; z++) {
      points.push([1, y, z]);
    }
  }
  // Points of the form (0:1:z)
  for (let z = 0; z < p; z++) {
    points.push([0, 1, z]);
  }
  // Point (0:0:1)
  points.push([0, 0, 1]);

  // Lines: line [a:b:c] contains point [x:y:z] iff ax+by+cz = 0 (mod p)
  // Generate all lines (same structure as points)
  const lines: [number, number, number][] = [...points];

  for (const [la, lb, lc] of lines) {
    const card: number[] = [];
    for (let pi = 0; pi < points.length; pi++) {
      const [px, py, pz] = points[pi]!;
      if (((la * px + lb * py + lc * pz) % p + p) % p === 0) {
        card.push(pi);
      }
    }
    cards.push(card);
  }

  return cards;
}

// Pre-generate the deck
const DECK_STRUCTURE = generateProjectivePlane(7);

export interface SpotItCard {
  symbols: string[];
}

export interface SpotItState {
  deck: SpotItCard[];
  card1: SpotItCard;
  card2: SpotItCard;
  score: number;
  botScore: number;
  pairsPlayed: number;
  totalPairs: number;
  won: boolean;
  lost: boolean;
  botReactionMs: number; // ms before bot answers
  clickedAt: number | null; // timestamp when pair shown
  botAnswered: boolean;
  lastMatchSymbol: string | null;
  showResult: boolean;
}

export type SpotItAction =
  | { type: "click"; symbol: string }
  | { type: "tick"; nowMs: number }
  | { type: "next" };

export function initialState(seed: number): SpotItState {
  const rng = mulberry32(seed);

  // Pick 30 cards from the deck
  const shuffledIndices = [...Array(DECK_STRUCTURE.length).keys()]
    .sort(() => rng() - 0.5)
    .slice(0, 30);

  const deck: SpotItCard[] = shuffledIndices.map(i => ({
    symbols: DECK_STRUCTURE[i]!.map(si => SYMBOLS[si % SYMBOLS.length]!),
  }));

  // Shuffle deck
  deck.sort(() => rng() - 0.5);

  const totalPairs = 14;
  const [c1, c2] = [deck[0]!, deck[1]!];

  return {
    deck,
    card1: c1,
    card2: c2,
    score: 0,
    botScore: 0,
    pairsPlayed: 0,
    totalPairs,
    won: false,
    lost: false,
    botReactionMs: 2000 + Math.floor(rng() * 2000),
    clickedAt: null,
    botAnswered: false,
    lastMatchSymbol: null,
    showResult: false,
  };
}

function findMatch(card1: SpotItCard, card2: SpotItCard): string | null {
  for (const s1 of card1.symbols) {
    for (const s2 of card2.symbols) {
      if (s1 === s2) return s1;
    }
  }
  return null;
}

function advancePair(state: SpotItState, rng: () => number): SpotItState {
  const nextPair = state.pairsPlayed + 1;
  const won = state.score > state.botScore && nextPair >= state.totalPairs;
  const lost = nextPair >= state.totalPairs && state.score <= state.botScore;
  const done = nextPair >= state.totalPairs;

  if (done) {
    return { ...state, pairsPlayed: nextPair, won: state.score > state.botScore, lost: state.score <= state.botScore };
  }

  const offset = nextPair * 2;
  const c1 = state.deck[offset % state.deck.length]!;
  const c2 = state.deck[(offset + 1) % state.deck.length]!;

  return {
    ...state,
    card1: c1,
    card2: c2,
    pairsPlayed: nextPair,
    botReactionMs: 1500 + Math.floor(rng() * 2500),
    clickedAt: null,
    botAnswered: false,
    lastMatchSymbol: null,
    showResult: false,
  };
}

export function reducer(state: SpotItState, action: SpotItAction): SpotItState {
  if (state.won || state.lost) {
    if (action.type === "next") {
      return initialState(state.score + state.botScore + 99);
    }
    return state;
  }

  switch (action.type) {
    case "click": {
      if (state.botAnswered || state.showResult) return state;
      const match = findMatch(state.card1, state.card2);
      if (action.symbol === match) {
        const score = state.score + 1;
        const rng = mulberry32(score * 17 + state.pairsPlayed);
        const next = advancePair({ ...state, score, lastMatchSymbol: match, showResult: true }, rng);
        return next;
      }
      return state;
    }

    case "tick": {
      if (state.botAnswered || state.showResult) return state;
      if (state.clickedAt === null) return { ...state, clickedAt: action.nowMs };

      const elapsed = action.nowMs - (state.clickedAt ?? action.nowMs);
      if (elapsed >= state.botReactionMs) {
        // Bot found it
        const botScore = state.botScore + 1;
        const match = findMatch(state.card1, state.card2);
        const rng = mulberry32(botScore * 13 + state.pairsPlayed + 5);
        const next = advancePair({ ...state, botScore, lastMatchSymbol: match, showResult: true, botAnswered: true }, rng);
        return next;
      }
      return state;
    }

    case "next": {
      return state; // handled implicitly by tick/click advancing
    }
  }
}

export function isTerminal(state: SpotItState): { score: number } | null {
  if (state.won) return { score: state.score * 10 };
  if (state.lost) return { score: state.score * 5 };
  return null;
}
