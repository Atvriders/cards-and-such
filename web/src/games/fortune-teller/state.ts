import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface FortuneTellerSettings {
  deckSize: "16" | "32";
}

export interface FortuneCard {
  id: number;
  suit: string;
  rank: string;
  fortune: string;
}

export interface FortuneTellerState {
  settings: FortuneTellerSettings;
  rngSeed: number;
  deck: FortuneCard[];
  drawnCards: FortuneCard[];
  currentCard: FortuneCard | null;
  cardsRemaining: number;
  gameOver: boolean;
}

export type FortuneTellerAction =
  | { type: "draw" }
  | { type: "reset" };

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const FORTUNES: string[] = [
  "A great journey awaits you soon — pack light and embrace the unknown.",
  "Someone close to you holds a secret that will change your perspective.",
  "Luck favors the bold today; take the risk you've been avoiding.",
  "An unexpected windfall arrives when you least expect it.",
  "True wisdom comes from listening more and speaking less.",
  "A reunion with an old friend will brighten your week ahead.",
  "The stars align in your favor — trust your instincts completely.",
  "A small act of kindness will return to you tenfold.",
  "New opportunities hide behind the doors you've been afraid to open.",
  "Your patience will be rewarded beyond your wildest expectations.",
  "A creative spark ignites — now is the time to start that project.",
  "Let go of what no longer serves you; clarity awaits on the other side.",
  "A meal shared with loved ones will heal more than any medicine.",
  "The answer you seek is already within you — trust yourself.",
  "Financial news brings a welcome surprise before the month ends.",
  "Your laughter is contagious and lifts everyone around you today.",
  "A dream you had recently contains an important message.",
  "The obstacles in your path are teachers in disguise.",
  "Someone admires you from afar and will soon make their presence known.",
  "A pet or animal will bring unexpected joy into your life.",
  "The book you've been meaning to read holds a life-changing idea.",
  "Your hard work is about to be recognized in a meaningful way.",
  "Travel plans — even small ones — will refresh your spirit greatly.",
  "A phone call today will open a door you thought was closed forever.",
  "The universe conspires to help those who help themselves.",
  "A new friendship blossoms from an unlikely meeting this week.",
  "Music will heal your soul — let it play and dance freely.",
  "Your generosity plants seeds that grow into forests of goodwill.",
  "A challenge ahead is smaller than it appears; face it with courage.",
  "The number three will prove lucky for you in the coming days.",
  "Rest is productive — recharge before taking your next great leap.",
  "An apology given or received will set your heart free at last.",
];

function buildDeck(deckSize: number, rng: () => number): FortuneCard[] {
  const allCards: { suit: string; rank: string }[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      allCards.push({ suit, rank });
    }
  }
  // Shuffle
  for (let i = allCards.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = allCards[i]!;
    allCards[i] = allCards[j]!;
    allCards[j] = tmp;
  }
  // Take first deckSize cards and assign fortunes
  const shuffledFortunes = [...FORTUNES];
  for (let i = shuffledFortunes.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = shuffledFortunes[i]!;
    shuffledFortunes[i] = shuffledFortunes[j]!;
    shuffledFortunes[j] = tmp;
  }
  return allCards.slice(0, deckSize).map((card, i) => ({
    id: i,
    suit: card.suit,
    rank: card.rank,
    fortune: shuffledFortunes[i % shuffledFortunes.length]!,
  }));
}

export function initialState(seed: number, settings: FortuneTellerSettings): FortuneTellerState {
  const rng = mulberry32(seed >>> 0);
  const deckSize = parseInt(settings.deckSize, 10);
  const deck = buildDeck(deckSize, rng);
  return {
    settings,
    rngSeed: seed >>> 0,
    deck,
    drawnCards: [],
    currentCard: null,
    cardsRemaining: deckSize,
    gameOver: false,
  };
}

export function reducer(state: FortuneTellerState, action: FortuneTellerAction): FortuneTellerState {
  if (action.type === "reset") {
    return initialState(state.rngSeed + 1, state.settings);
  }
  if (action.type === "draw") {
    if (state.gameOver) return state;
    const remaining = state.deck.filter(c => !state.drawnCards.some(d => d.id === c.id));
    if (remaining.length === 0) return { ...state, gameOver: true };
    const idx = 0; // deck is pre-shuffled
    const card = remaining[idx]!;
    const drawnCards = [...state.drawnCards, card];
    const gameOver = drawnCards.length >= state.deck.length;
    return {
      ...state,
      drawnCards,
      currentCard: card,
      cardsRemaining: state.deck.length - drawnCards.length,
      gameOver,
    };
  }
  return state;
}

export function isTerminal(state: FortuneTellerState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.drawnCards.length * 10 };
}
