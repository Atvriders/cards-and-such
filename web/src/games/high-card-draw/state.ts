import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface HighCardDrawSettings {
  roundsToWin: "3" | "5" | "10";
}

export type Suit = "♠" | "♥" | "♦" | "♣";
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export interface Card {
  rank: Rank;
  suit: Suit;
}

export type RoundResult = "player" | "bot" | "tie";

export interface HighCardDrawState {
  settings: HighCardDrawSettings;
  rngSeed: number;
  deck: Card[];
  playerCard: Card | null;
  botCard: Card | null;
  playerWins: number;
  botWins: number;
  roundsToWin: number;
  lastResult: RoundResult | null;
  roundsPlayed: number;
  done: boolean;
  playerWon: boolean;
}

export type HighCardDrawAction = { type: "draw" };

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RANKS: Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

export function rankLabel(r: Rank): string {
  if (r === 11) return "J";
  if (r === 12) return "Q";
  if (r === 13) return "K";
  if (r === 14) return "A";
  return String(r);
}

function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

function shuffleDeck(deck: Card[], rng: () => number): Card[] {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [d[i], d[j]] = [d[j]!, d[i]!];
  }
  return d;
}

export function initialState(seed: number, settings: HighCardDrawSettings): HighCardDrawState {
  const rng = mulberry32(seed >>> 0);
  const deck = shuffleDeck(buildDeck(), rng);
  // Advance seed
  const newSeed = (rng() * 2 ** 31) >>> 0;
  return {
    settings,
    rngSeed: newSeed,
    deck,
    playerCard: null,
    botCard: null,
    playerWins: 0,
    botWins: 0,
    roundsToWin: parseInt(settings.roundsToWin, 10),
    lastResult: null,
    roundsPlayed: 0,
    done: false,
    playerWon: false,
  };
}

export function reducer(state: HighCardDrawState, action: HighCardDrawAction): HighCardDrawState {
  if (state.done) return state;
  if (action.type !== "draw") return state;

  const deck = [...state.deck];
  const playerCard = deck.shift()!;
  const botCard = deck.shift()!;

  let lastResult: RoundResult;
  if (playerCard.rank > botCard.rank) lastResult = "player";
  else if (botCard.rank > playerCard.rank) lastResult = "bot";
  else lastResult = "tie";

  const playerWins = state.playerWins + (lastResult === "player" ? 1 : 0);
  const botWins = state.botWins + (lastResult === "bot" ? 1 : 0);
  const roundsPlayed = state.roundsPlayed + 1;

  const playerWon = playerWins >= state.roundsToWin;
  const botWon = botWins >= state.roundsToWin;
  const done = playerWon || botWon || deck.length < 2;

  return {
    ...state,
    deck,
    playerCard,
    botCard,
    playerWins,
    botWins,
    lastResult,
    roundsPlayed,
    done,
    playerWon: playerWon && !botWon,
  };
}

export function isTerminal(state: HighCardDrawState): { score: number } | null {
  if (!state.done) return null;
  const score = state.playerWon ? state.playerWins * 100 : state.playerWins * 20;
  return { score };
}
