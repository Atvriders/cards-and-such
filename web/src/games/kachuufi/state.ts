import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Kachuufi: Pakistani trick-taking card game with bidding
// 52-card deck, simplified to 2-player (each 13 cards)
// Bid number of tricks; play tricks; score based on result
// Trump named by bidder (highest bidder wins the right to name trump)

function rankStrength(rank: Card["rank"]): number {
  return rank === 1 ? 14 : rank; // Ace = 14
}

function cardScore(card: Card, trump: Suit, leadSuit: Suit): number {
  if (card.suit === trump) return rankStrength(card.rank) + 20;
  if (card.suit === leadSuit) return rankStrength(card.rank);
  return 0;
}

export type KachuufiPhase = "bid" | "play" | "done";

export interface KachuufiState {
  rngSeed: number;
  playerHand: readonly Card[];
  botHand: readonly Card[];
  bid: number; // player bid
  trump: Suit | null;
  tricksWon: { player: number; bot: number };
  currentLead: "player" | "bot";
  playerPlayed: Card | null;
  botPlayed: Card | null;
  phase: KachuufiPhase;
  message: string;
  finalScores: { player: number; bot: number } | null;
}

export type KachuufiAction =
  | { type: "bid"; tricks: number; trump: Suit }
  | { type: "play"; cardId: string };

function resolveTrick(state: KachuufiState, rng: () => number): KachuufiState {
  const pp = state.playerPlayed!;
  const bp = state.botPlayed!;
  const trump = state.trump!;
  const leadSuit = state.currentLead === "player" ? pp.suit : bp.suit;

  const ps = cardScore(pp, trump, leadSuit);
  const bs = cardScore(bp, trump, leadSuit);
  const playerWins = ps > bs;

  const newTricksWon = {
    player: state.tricksWon.player + (playerWins ? 1 : 0),
    bot: state.tricksWon.bot + (playerWins ? 0 : 1),
  };

  const msg = playerWins
    ? `You won the trick! (${pp.suit}${pp.rank} beats ${bp.suit}${bp.rank})`
    : ps === bs
    ? `Tied trick — ${state.currentLead === "player" ? "you" : "bot"} led, so ${state.currentLead === "player" ? "you" : "bot"} win!`
    : `Bot won the trick. (${bp.suit}${bp.rank} beats ${pp.suit}${pp.rank})`;

  const nextLead = playerWins ? "player" : "bot";
  const s: KachuufiState = {
    ...state,
    playerPlayed: null,
    botPlayed: null,
    tricksWon: newTricksWon,
    currentLead: nextLead,
    message: msg,
  };

  if (s.playerHand.length === 0 && s.botHand.length === 0) {
    return finishGame(s);
  }

  if (nextLead === "bot") {
    return botPlay(s, rng);
  }
  return { ...s, phase: "play" };
}

function finishGame(state: KachuufiState): KachuufiState {
  const bid = state.bid;
  const won = state.tricksWon.player;
  // Scoring: make bid = +bid, fail = -bid; bot simple scoring
  const pScore = won >= bid ? bid : -bid;
  const botWon = state.tricksWon.bot;
  const botBid = 6; // bot always internally bids 6
  const bScore = botWon >= botBid ? botBid : -botBid;

  const finalScores = { player: pScore, bot: bScore };
  const msg = pScore > 0 && pScore > bScore
    ? `You made your bid! Won ${won}/${bid} tricks. +${pScore} pts!`
    : pScore > 0
    ? `You made your bid (${won} tricks). Bot scored ${bScore}.`
    : `You failed your bid (needed ${bid}, won ${won}). Score: ${pScore}.`;
  return { ...state, phase: "done", finalScores, message: msg };
}

function botPlay(state: KachuufiState, rng: () => number): KachuufiState {
  if (state.botHand.length === 0) return state;
  const trump = state.trump!;

  let chosen: Card;
  if (!state.playerPlayed) {
    // Bot leads: play highest card
    const sorted = [...state.botHand].sort((a, b) => {
      const as = a.suit === trump ? rankStrength(a.rank) + 20 : rankStrength(a.rank);
      const bs2 = b.suit === trump ? rankStrength(b.rank) + 20 : rankStrength(b.rank);
      return bs2 - as;
    });
    chosen = sorted[0]!;
  } else {
    const leadSuit = state.playerPlayed.suit;
    const samesuit = state.botHand.filter(c => c.suit === leadSuit);
    if (samesuit.length > 0) {
      chosen = samesuit.reduce((hi, c) => rankStrength(c.rank) > rankStrength(hi.rank) ? c : hi);
    } else {
      const trumps = state.botHand.filter(c => c.suit === trump);
      if (trumps.length > 0) {
        chosen = trumps.reduce((lo, c) => rankStrength(c.rank) < rankStrength(lo.rank) ? c : lo);
      } else {
        chosen = state.botHand.reduce((lo, c) => rankStrength(c.rank) < rankStrength(lo.rank) ? c : lo);
      }
    }
  }

  const botHand = state.botHand.filter(c => c.id !== chosen.id);
  const s: KachuufiState = { ...state, botHand, botPlayed: chosen };
  if (s.playerPlayed) return resolveTrick(s, rng);
  return { ...s, message: `Bot played ${chosen.suit}${chosen.rank}. Your turn to follow.` };
}

export function reducer(state: KachuufiState, action: KachuufiAction): KachuufiState {
  if (state.phase === "done") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const s = { ...state, rngSeed: nextSeed };

  if (action.type === "bid" && state.phase === "bid") {
    const msg = `You bid ${action.tricks} tricks with ${action.trump} as trump. Game begins!`;
    return { ...s, bid: action.tricks, trump: action.trump, phase: "play", message: msg };
  }

  if (action.type === "play" && state.phase === "play") {
    const card = state.playerHand.find(c => c.id === action.cardId);
    if (!card) return state;
    const playerHand = state.playerHand.filter(c => c.id !== card.id);
    const s2: KachuufiState = { ...s, playerHand, playerPlayed: card };

    if (state.currentLead === "player") {
      return botPlay(s2, rng);
    } else {
      return resolveTrick(s2, rng);
    }
  }

  return state;
}

export function initialState(seed: number): KachuufiState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const deck = shuffle(newDeck(), mulberry32(nextSeed));

  return {
    rngSeed: Math.floor(mulberry32(nextSeed)() * 2 ** 31),
    playerHand: deck.slice(0, 13),
    botHand: deck.slice(13, 26),
    bid: 0,
    trump: null,
    tricksWon: { player: 0, bot: 0 },
    currentLead: "player",
    playerPlayed: null,
    botPlayed: null,
    phase: "bid",
    message: "Bid how many tricks you'll win (1–13) and name the trump suit.",
    finalScores: null,
  };
}

export function isTerminal(state: KachuufiState): { score: number } | null {
  if (state.phase !== "done" || !state.finalScores) return null;
  const { player } = state.finalScores;
  if (player >= 6) return { score: 85 };
  if (player > 0) return { score: 65 };
  return { score: 20 };
}
