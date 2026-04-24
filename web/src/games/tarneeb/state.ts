import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Tarneeb: 52-card deck, 4 players (2 teams), bid tricks + name trump
// Simplified: 2-player (player vs bot), each gets 13 cards, player bids trump+tricks

function rankStrength(rank: Card["rank"], trump: Suit, suit: Suit): number {
  const isTrump = suit === trump;
  const base = rank === 1 ? 14 : rank; // Ace = 14
  return isTrump ? base + 20 : base;
}

export type TarneebPhase = "bid" | "play" | "done";

export interface TarneebState {
  rngSeed: number;
  playerHand: readonly Card[];
  botHand: readonly Card[];
  bid: number; // player's bid (tricks)
  trump: Suit | null;
  tricksWon: { player: number; bot: number };
  currentLead: "player" | "bot";
  playerPlayed: Card | null;
  botPlayed: Card | null;
  phase: TarneebPhase;
  message: string;
  selectedCardId: string | null;
  finalScores: { player: number; bot: number } | null;
}

export type TarneebAction =
  | { type: "bid"; tricks: number; trump: Suit }
  | { type: "play"; cardId: string };

function botBid(): { tricks: number; trump: Suit } {
  // Bot always bids 7 spades (simple default)
  return { tricks: 7, trump: "♠" };
}

function resolveTrick(state: TarneebState, rng: () => number): TarneebState {
  const pp = state.playerPlayed!;
  const bp = state.botPlayed!;
  const trump = state.trump!;

  // Determine winner: lead suit is the attacking suit
  const leadSuit = state.currentLead === "player" ? pp.suit : bp.suit;

  function strength(card: Card): number {
    if (card.suit === trump) return rankStrength(card.rank, trump, trump);
    if (card.suit === leadSuit) return rankStrength(card.rank, trump, leadSuit);
    return 0; // off-suit non-trump can't win
  }

  const ps = strength(pp);
  const bs = strength(bp);
  const playerWins = ps >= bs; // tie goes to player (lead wins ties for same suit)

  const newTricksWon = {
    player: state.tricksWon.player + (playerWins ? 1 : 0),
    bot: state.tricksWon.bot + (playerWins ? 0 : 1),
  };

  const msg = playerWins
    ? `You won the trick! (${pp.suit}${pp.rank} beats ${bp.suit}${bp.rank})`
    : `Bot won the trick. (${bp.suit}${bp.rank} beats ${pp.suit}${pp.rank})`;

  const s: TarneebState = {
    ...state,
    playerPlayed: null,
    botPlayed: null,
    tricksWon: newTricksWon,
    currentLead: playerWins ? "player" : "bot",
    message: msg,
  };

  // Check if all cards played
  if (s.playerHand.length === 0 && s.botHand.length === 0) {
    return finishGame(s);
  }

  // If bot leads next, play bot card
  if (s.currentLead === "bot") {
    return botPlay(s, rng);
  }
  return { ...s, phase: "play", message: msg + " Your lead." };
}

function finishGame(state: TarneebState): TarneebState {
  const bid = state.bid;
  const won = state.tricksWon.player;
  const botWon = state.tricksWon.bot;

  // Player scoring: made bid = +bid points, failed = -(bid) points
  let pScore = won >= bid ? bid : -bid;
  // Bot scoring: simple, bot bid 7
  let bScore = botWon >= 7 ? 7 : -7;

  // Normalize to a comparison
  const finalScores = { player: pScore, bot: bScore };
  const msg = pScore > 0 && pScore > bScore
    ? `You won! Made your bid of ${bid} tricks (${won} won). Scored ${pScore} pts.`
    : pScore > 0
    ? `You made your bid (${won}/${bid}). Bot: ${bScore} pts.`
    : `You failed your bid (${won}/${bid} needed). Scored ${pScore} pts.`;

  return { ...state, phase: "done", finalScores, message: msg };
}

function botPlay(state: TarneebState, rng: () => number): TarneebState {
  if (state.botHand.length === 0) return state;
  const trump = state.trump!;

  // Bot plays: if leading, play highest card; if following, try to win
  let chosen: Card;
  if (!state.playerPlayed) {
    // Bot leads: play highest trump or highest overall
    const sorted = [...state.botHand].sort((a, b) => {
      const as = a.suit === trump ? rankStrength(a.rank, trump, trump) : rankStrength(a.rank, trump, a.suit);
      const bs2 = b.suit === trump ? rankStrength(b.rank, trump, trump) : rankStrength(b.rank, trump, b.suit);
      return bs2 - as;
    });
    chosen = sorted[0]!;
  } else {
    const pp = state.playerPlayed;
    const leadSuit = pp.suit;
    // Follow suit if possible
    const samesuit = state.botHand.filter(c => c.suit === leadSuit);
    if (samesuit.length > 0) {
      // Play highest of lead suit
      chosen = samesuit.reduce((hi, c) => rankStrength(c.rank, trump, c.suit) > rankStrength(hi.rank, trump, hi.suit) ? c : hi);
    } else {
      // Discard lowest non-trump or trump if must
      const nonTrumps = state.botHand.filter(c => c.suit !== trump);
      if (nonTrumps.length > 0) {
        chosen = nonTrumps.reduce((lo, c) => rankStrength(c.rank, trump, c.suit) < rankStrength(lo.rank, trump, lo.suit) ? c : lo);
      } else {
        chosen = state.botHand.reduce((lo, c) => rankStrength(c.rank, trump, c.suit) < rankStrength(lo.rank, trump, lo.suit) ? c : lo);
      }
    }
  }

  const botHand = state.botHand.filter(c => c.id !== chosen.id);
  const s: TarneebState = { ...state, botHand, botPlayed: chosen };

  if (s.playerPlayed) {
    // Both played, resolve
    return resolveTrick(s, rng);
  }
  return { ...s, message: `Bot played ${chosen.suit}${chosen.rank}. Your turn to follow.` };
}

export function reducer(state: TarneebState, action: TarneebAction): TarneebState {
  if (state.phase === "done") return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const s = { ...state, rngSeed: nextSeed };

  if (action.type === "bid" && state.phase === "bid") {
    const bot = botBid();
    // Player wins bid (higher bid names trump — simplified: player's bid controls trump)
    const msg = `You bid ${action.tricks} tricks, trump is ${action.trump}. Bot bid ${bot.tricks} ${bot.trump}. Play begins!`;
    let next: TarneebState = { ...s, bid: action.tricks, trump: action.trump, phase: "play", message: msg };
    // Player leads first (bidder leads in Tarneeb)
    return next;
  }

  if (action.type === "play" && state.phase === "play") {
    const card = state.playerHand.find(c => c.id === action.cardId);
    if (!card) return state;
    const playerHand = state.playerHand.filter(c => c.id !== card.id);
    const s2: TarneebState = { ...s, playerHand, playerPlayed: card, selectedCardId: null };

    if (state.currentLead === "player") {
      // Player led, now bot follows
      return botPlay(s2, rng);
    } else {
      // Bot led and played already, player follows → resolve
      return resolveTrick(s2, rng);
    }
  }

  return state;
}

export function initialState(seed: number): TarneebState {
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
    message: "Choose how many tricks you'll win (7–13) and name the trump suit.",
    selectedCardId: null,
    finalScores: null,
  };
}

export function isTerminal(state: TarneebState): { score: number } | null {
  if (state.phase !== "done" || !state.finalScores) return null;
  const { player, bot } = state.finalScores;
  // Positive player score and higher than bot = win
  if (player > 0 && player >= bot) return { score: 80 };
  if (player > 0) return { score: 60 };
  return { score: 20 };
}
