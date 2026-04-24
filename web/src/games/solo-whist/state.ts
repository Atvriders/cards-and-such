// Solo Whist – British 4-player trick-taking game with solo/partnership bids
// Player bids to win solo against 3 bots, or partnership bids
import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SoloWhistSettings {
  botDifficulty: "easy" | "hard";
}

export type SoloWhistPhase = "bidding" | "playing" | "done";

export type SoloBid = "pass" | "solo" | "misere" | "abundance";
// solo: player tries to win ≥5 tricks alone (3 v 1)
// misere: player tries to win 0 tricks
// abundance: player names trump and tries to win ≥9

export interface SoloWhistState {
  settings: SoloWhistSettings;
  rngSeed: number;
  hands: readonly (readonly Card[])[];
  trumpSuit: Suit;
  currentTrick: readonly { seat: number; card: Card }[];
  leadSeat: number;
  turn: number;
  phase: SoloWhistPhase;
  playerBid: SoloBid | null;
  tricks: readonly number[];
  score: readonly [number, number]; // [player, bots combined]
  message: string;
}

export type SoloWhistAction =
  | { type: "bid"; bid: SoloBid }
  | { type: "play"; cardId: string };

function rankOrder(rank: Card["rank"]): number {
  if (rank === 1) return 14;
  return rank;
}

function cardStrength(card: Card, trump: Suit, ledSuit: Suit): number {
  if (card.suit === trump) return 200 + rankOrder(card.rank);
  if (card.suit === ledSuit) return 100 + rankOrder(card.rank);
  return rankOrder(card.rank);
}

function trickWinner(trick: readonly { seat: number; card: Card }[], trump: Suit): number {
  const led = trick[0]!.card.suit;
  return trick.reduce((best, cur) =>
    cardStrength(cur.card, trump, led) > cardStrength(best.card, trump, led) ? cur : best
  ).seat;
}

export function legalPlays(state: SoloWhistState, seat: number): Card[] {
  const hand = [...(state.hands[seat] ?? [])];
  const trick = state.currentTrick;
  if (trick.length === 0) return hand;
  const led = trick[0]!.card.suit;
  const matching = hand.filter(c => c.suit === led);
  return matching.length > 0 ? matching : hand;
}

function botPlay(state: SoloWhistState, seat: number): Card {
  const legal = legalPlays(state, seat);
  if (legal.length === 1) return legal[0]!;
  const trick = state.currentTrick;
  const trump = state.trumpSuit;
  const led = trick.length > 0 ? trick[0]!.card.suit : trump;
  const bid = state.playerBid;

  // In misere defense: try to make player win tricks
  // In solo defense: try to take tricks away from player
  if (trick.length === 0) {
    if (bid === "misere") {
      // Lead highest to try to force player to win
      return legal.reduce((hi, c) => rankOrder(c.rank) > rankOrder(hi.rank) ? c : hi);
    }
    return legal.reduce((hi, c) =>
      cardStrength(c, trump, trump) > cardStrength(hi, trump, trump) ? c : hi
    );
  }

  const best = trick.reduce((b, cur) =>
    cardStrength(cur.card, trump, led) > cardStrength(b.card, trump, led) ? cur : b
  );
  const winCards = legal.filter(c => cardStrength(c, trump, led) > cardStrength(best.card, trump, led));

  if (bid === "misere" && best.seat === 0) {
    // Player is currently winning — don't need to beat them for misere
    return legal.reduce((lo, c) => cardStrength(c, trump, led) < cardStrength(lo, trump, led) ? c : lo);
  }
  if (winCards.length > 0) return winCards.reduce((lo, c) => cardStrength(c, trump, led) < cardStrength(lo, trump, led) ? c : lo);
  return legal.reduce((lo, c) => cardStrength(c, trump, led) < cardStrength(lo, trump, led) ? c : lo);
}

function applyPlay(state: SoloWhistState, seat: number, card: Card): SoloWhistState {
  const newHands = state.hands.map((h, i) => i === seat ? h.filter(c => c.id !== card.id) : h);
  const newTrick = [...state.currentTrick, { seat, card }];
  let s: SoloWhistState = { ...state, hands: newHands, currentTrick: newTrick };

  if (newTrick.length === 4) {
    const winner = trickWinner(newTrick, state.trumpSuit);
    const newTricks = state.tricks.map((t, i) => i === winner ? t + 1 : t);
    s = { ...s, currentTrick: [], tricks: newTricks, leadSeat: winner, turn: winner };

    if (newHands[0]!.length === 0) {
      const playerTricks = newTricks[0]!;
      const bid = state.playerBid ?? "solo";
      let playerWins = false;
      let msg = "";
      if (bid === "misere") {
        playerWins = playerTricks === 0;
        msg = playerWins ? "Misere made! You took 0 tricks." : `Misere failed: you took ${playerTricks} tricks.`;
      } else if (bid === "abundance") {
        playerWins = playerTricks >= 9;
        msg = playerWins ? `Abundance! You took ${playerTricks} tricks.` : `Abundance failed (took ${playerTricks}/9).`;
      } else {
        playerWins = playerTricks >= 5;
        msg = playerWins ? `Solo made! You took ${playerTricks} tricks.` : `Solo failed (took ${playerTricks}/5).`;
      }
      const newScore: [number, number] = [state.score[0] + (playerWins ? 1 : 0), state.score[1] + (playerWins ? 0 : 1)];
      s = { ...s, score: newScore, phase: "done", message: msg };
    }
  } else {
    s = { ...s, turn: (seat + 1) % 4 };
  }
  return s;
}

export function reducer(state: SoloWhistState, action: SoloWhistAction): SoloWhistState {
  if (state.phase === "done") return state;
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  if (state.phase === "bidding" && action.type === "bid") {
    const bid = action.bid;
    if (bid === "pass") {
      return { ...state, rngSeed: nextSeed, message: "You passed. Bots play a partnership round.", phase: "done", score: [state.score[0], state.score[1] + 1] };
    }
    let s: SoloWhistState = {
      ...state,
      rngSeed: nextSeed,
      playerBid: bid,
      phase: "playing",
      turn: 0,
      message: `You bid ${bid}! Trump: ${state.trumpSuit}`,
    };
    // Auto-play bots if bot leads first? No — player leads
    return s;
  }

  if (state.phase === "playing" && action.type === "play") {
    if (state.turn !== 0) return state;
    const card = state.hands[0]!.find(c => c.id === action.cardId);
    if (!card) return state;
    if (!legalPlays(state, 0).some(c => c.id === card.id)) return state;

    let s: SoloWhistState = { ...state, rngSeed: nextSeed };
    s = applyPlay(s, 0, card);
    while (s.phase === "playing" && s.turn !== 0) {
      const botCard = botPlay(s, s.turn);
      s = applyPlay(s, s.turn, botCard);
    }
    return s;
  }
  return state;
}

export function initialState(seed: number, settings: SoloWhistSettings): SoloWhistState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const dealRng = mulberry32(nextSeed);
  const deck = shuffle(newDeck(), dealRng);
  const hands: Card[][] = [
    deck.slice(0, 13),
    deck.slice(13, 26),
    deck.slice(26, 39),
    deck.slice(39, 52),
  ];
  const trumpSuit = deck[0]!.suit; // arbitrary trump from first card
  return {
    settings,
    rngSeed: Math.floor(dealRng() * 2 ** 31),
    hands,
    trumpSuit,
    currentTrick: [],
    leadSeat: 0,
    turn: 0,
    phase: "bidding",
    playerBid: null,
    tricks: [0, 0, 0, 0],
    score: [0, 0],
    message: `Trump: ${trumpSuit}. Choose your bid: Solo (≥5 tricks), Misere (0 tricks), Abundance (≥9), or Pass.`,
  };
}

export function isTerminal(state: SoloWhistState): { score: number } | null {
  if (state.phase !== "done") return null;
  const diff = state.score[0] - state.score[1];
  return { score: Math.max(0, Math.min(100, 50 + diff * 20)) };
}
