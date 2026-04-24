// Forty-Fives – traditional Irish trick-taking game
// 4 players (2 teams), 5 cards, trump is crucial, first to 45 wins
// Special trump hierarchy: 5 > J > A♥ > A(trump) > K > Q > ...
import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface FortyFivesSettings {
  botDifficulty: "easy" | "hard";
}

export type FortyFivesPhase = "playing" | "done";

export interface FortyFivesState {
  settings: FortyFivesSettings;
  rngSeed: number;
  hands: readonly (readonly Card[])[];
  trumpSuit: Suit;
  currentTrick: readonly { seat: number; card: Card }[];
  leadSeat: number;
  turn: number;
  phase: FortyFivesPhase;
  tricks: readonly number[];
  score: readonly [number, number]; // team0 (seats 0&2) vs team1 (seats 1&3)
  message: string;
}

export type FortyFivesAction = { type: "play"; cardId: string };

const HAND_SIZE = 5;

// Forty-Fives trump ranking (higher = stronger trump)
// 5 of trump > J of trump > A♥ > A of trump > K of trump > Q of trump
// then remaining suit cards descending
function trumpStrength(card: Card, trump: Suit): number {
  if (card.rank === 5 && card.suit === trump) return 100;
  if (card.rank === 11 && card.suit === trump) return 99;
  if (card.rank === 1 && card.suit === "♥") return 98; // A♥ always 3rd highest trump
  if (card.rank === 1 && card.suit === trump) return 97;
  if (card.rank === 13 && card.suit === trump) return 10 + rankDesc(card.rank);
  if (card.suit === trump) return rankDesc(card.rank);
  return 0;
}

function rankDesc(rank: Card["rank"]): number {
  // Descending order for non-special trump cards
  if (rank === 1) return 14;
  return rank;
}

function isTrump(card: Card, trump: Suit): boolean {
  if (card.suit === trump) return true;
  if (card.rank === 1 && card.suit === "♥") return true; // A♥ always trump
  return false;
}

function cardStrength(card: Card, trump: Suit, ledSuit: Suit): number {
  if (isTrump(card, trump)) return 1000 + trumpStrength(card, trump);
  if (card.suit === ledSuit) return 100 + (card.rank === 1 ? 14 : card.rank);
  return card.rank === 1 ? 14 : card.rank;
}

function trickWinner(trick: readonly { seat: number; card: Card }[], trump: Suit): number {
  const led = trick[0]!.card.suit;
  return trick.reduce((best, cur) =>
    cardStrength(cur.card, trump, led) > cardStrength(best.card, trump, led) ? cur : best
  ).seat;
}

export function legalPlays(state: FortyFivesState, seat: number): Card[] {
  const hand = [...(state.hands[seat] ?? [])];
  const trick = state.currentTrick;
  if (trick.length === 0) return hand;
  const led = trick[0]!.card.suit;
  const ledIsTrump = isTrump(trick[0]!.card, state.trumpSuit);
  if (ledIsTrump) {
    // Must follow trump; special rule: can always "renege" (not follow) with 5, J, A♥
    const trumpCards = hand.filter(c => isTrump(c, state.trumpSuit));
    if (trumpCards.length > 0) return trumpCards;
    return hand;
  }
  const matching = hand.filter(c => c.suit === led && !isTrump(c, state.trumpSuit));
  return matching.length > 0 ? matching : hand;
}

function botPlay(state: FortyFivesState, seat: number): Card {
  const legal = legalPlays(state, seat);
  if (legal.length === 1) return legal[0]!;
  const trick = state.currentTrick;
  const trump = state.trumpSuit;
  const led = trick.length > 0 ? trick[0]!.card.suit : null;

  if (trick.length === 0) {
    const topTrump = legal.filter(c => isTrump(c, trump)).sort((a, b) => trumpStrength(b, trump) - trumpStrength(a, trump));
    if (topTrump.length > 0) return topTrump[0]!;
    return legal.reduce((hi, c) => (c.rank > hi.rank ? c : hi));
  }

  const best = trick.reduce((b, cur) =>
    cardStrength(cur.card, trump, led!) > cardStrength(b.card, trump, led!) ? cur : b
  );
  const myTeam = seat % 2;
  const partnerWinning = best.seat % 2 === myTeam;
  if (partnerWinning) {
    return legal.reduce((lo, c) => cardStrength(c, trump, led!) < cardStrength(lo, trump, led!) ? c : lo);
  }
  const winCards = legal.filter(c => cardStrength(c, trump, led!) > cardStrength(best.card, trump, led!));
  if (winCards.length > 0) return winCards.reduce((lo, c) => cardStrength(c, trump, led!) < cardStrength(lo, trump, led!) ? c : lo);
  return legal.reduce((lo, c) => cardStrength(c, trump, led!) < cardStrength(lo, trump, led!) ? c : lo);
}

function applyPlay(state: FortyFivesState, seat: number, card: Card): FortyFivesState {
  const newHands = state.hands.map((h, i) => i === seat ? h.filter(c => c.id !== card.id) : h);
  const newTrick = [...state.currentTrick, { seat, card }];
  let s: FortyFivesState = { ...state, hands: newHands, currentTrick: newTrick };

  if (newTrick.length === 4) {
    const winner = trickWinner(newTrick, state.trumpSuit);
    const newTricks = state.tricks.map((t, i) => i === winner ? t + 1 : t);
    s = { ...s, currentTrick: [], tricks: newTricks, leadSeat: winner, turn: winner };

    if (newHands[0]!.length === 0) {
      const team0Tricks = newTricks[0]! + newTricks[2]!;
      const team1Tricks = newTricks[1]! + newTricks[3]!;
      const pts0 = team0Tricks * 5; // 5 pts per trick, max 25 per team
      const pts1 = team1Tricks * 5;
      const newScore: [number, number] = [state.score[0] + pts0, state.score[1] + pts1];
      const winner45 = newScore[0] >= 45 || newScore[1] >= 45;
      s = {
        ...s,
        score: newScore,
        phase: "done",
        message: winner45
          ? (newScore[0] >= 45 ? "Your team wins the game!" : "Bot team wins the game!")
          : `Round over. You & Partner: ${pts0} pts | Bots: ${pts1} pts`,
      };
    }
  } else {
    s = { ...s, turn: (seat + 1) % 4 };
  }
  return s;
}

export function reducer(state: FortyFivesState, action: FortyFivesAction): FortyFivesState {
  if (state.phase === "done") return state;
  if (action.type !== "play") return state;
  if (state.turn !== 0) return state;
  const card = state.hands[0]!.find(c => c.id === action.cardId);
  if (!card) return state;
  if (!legalPlays(state, 0).some(c => c.id === card.id)) return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  let s: FortyFivesState = { ...state, rngSeed: nextSeed };
  s = applyPlay(s, 0, card);
  while (s.phase === "playing" && s.turn !== 0) {
    const botCard = botPlay(s, s.turn);
    s = applyPlay(s, s.turn, botCard);
  }
  return s;
}

export function initialState(seed: number, settings: FortyFivesSettings): FortyFivesState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);
  const deck = shuffle(newDeck(), dealRng);
  const trumpCard = deck[HAND_SIZE * 4]!;
  const trumpSuit = trumpCard.suit;
  const hands: Card[][] = [
    deck.slice(0, HAND_SIZE),
    deck.slice(HAND_SIZE, HAND_SIZE * 2),
    deck.slice(HAND_SIZE * 2, HAND_SIZE * 3),
    deck.slice(HAND_SIZE * 3, HAND_SIZE * 4),
  ];
  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    hands,
    trumpSuit,
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "playing",
    tricks: [0, 0, 0, 0],
    score: [0, 0],
    message: `Trump: ${trumpSuit}. 5♠♥♦♣ and Jack of trump are highest. First to 45 wins!`,
  };
}

export function isTerminal(state: FortyFivesState): { score: number } | null {
  if (state.phase !== "done") return null;
  const diff = state.score[0] - state.score[1];
  return { score: Math.max(0, Math.min(100, 50 + diff)) };
}
