import type { Card, Rank, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// California Jack — 2-player All Fours variant
// - One player (you) vs bot
// - 52 card deck shuffled, 6 cards dealt to each
// - Top card of remaining deck sets trump suit
// - Play tricks; after each trick, both draw one card from stock
// - Scoring: High (highest trump in play = 1pt), Low (lowest trump in play = 1pt),
//   Jack (jack of trumps captured = 1pt), Game (most pip points from tricks = 1pt)
// - Pip values: A=4, K=3, Q=2, J=1, 10=10
// - First to 7 game points wins

export interface CaliforniaJackSettings { target: "5" | "7" | "10" }

export type CJPhase = "playing" | "drawing" | "scoring" | "done";

export interface CaliforniaJackState {
  settings: CaliforniaJackSettings;
  playerHand: readonly Card[];
  botHand: readonly Card[];
  stock: readonly Card[];
  trumpSuit: Suit;
  currentTrick: readonly (Card | null)[]; // [player, bot]
  trickLead: 0 | 1; // who led current trick (0=player, 1=bot)
  playerTricks: readonly Card[]; // captured cards for player
  botTricks: readonly Card[];
  playerScore: number;
  botScore: number;
  phase: CJPhase;
  roundResult: string;
  rngSeed: number;
}

export type CaliforniaJackAction =
  | { type: "play"; cardId: string }
  | { type: "collectTrick" }
  | { type: "nextRound" };

function rankVal(r: Rank, trump: boolean): number {
  // In trick taking, trump beats non-trump
  // Within same suit, A high
  if (r === 1) return 14;
  return r;
}

function pipVal(r: Rank): number {
  if (r === 1) return 4;  // Ace
  if (r === 13) return 3; // King
  if (r === 12) return 2; // Queen
  if (r === 11) return 1; // Jack
  if (r === 10) return 10;
  return 0;
}

function cardBeats(candidate: Card, base: Card, trumpSuit: Suit, leadSuit: Suit): boolean {
  const candidateTrump = candidate.suit === trumpSuit;
  const baseTrump = base.suit === trumpSuit;
  if (candidateTrump && !baseTrump) return true;
  if (!candidateTrump && baseTrump) return false;
  if (!candidateTrump && !baseTrump) {
    if (candidate.suit !== leadSuit && base.suit === leadSuit) return false;
    if (candidate.suit === leadSuit && base.suit !== leadSuit) return true;
    return rankVal(candidate.rank, false) > rankVal(base.rank, false);
  }
  return rankVal(candidate.rank, true) > rankVal(base.rank, true);
}

function botChooseCard(hand: readonly Card[], trumpSuit: Suit, leadCard: Card | null): Card {
  if (!leadCard) {
    // Lead lowest trump if have one, else lowest card
    const trumps = hand.filter(c => c.suit === trumpSuit);
    if (trumps.length > 0) return trumps.reduce((a, b) => rankVal(a.rank, true) < rankVal(b.rank, true) ? a : b);
    return hand.reduce((a, b) => rankVal(a.rank, false) < rankVal(b.rank, false) ? a : b);
  }
  // Follow suit if possible, otherwise play trump, otherwise play lowest
  const leadSuit = leadCard.suit;
  const suitCards = hand.filter(c => c.suit === leadSuit);
  if (suitCards.length > 0) {
    // Play highest of suit
    return suitCards.reduce((a, b) => rankVal(a.rank, false) > rankVal(b.rank, false) ? a : b);
  }
  const trumpCards = hand.filter(c => c.suit === trumpSuit);
  if (trumpCards.length > 0) return trumpCards.reduce((a, b) => rankVal(a.rank, true) < rankVal(b.rank, true) ? a : b);
  return hand.reduce((a, b) => rankVal(a.rank, false) < rankVal(b.rank, false) ? a : b);
}

function computeRoundScore(
  playerTricks: readonly Card[],
  botTricks: readonly Card[],
  trumpSuit: Suit
): { playerPts: number; botPts: number; desc: string } {
  const allTrickCards = [...playerTricks, ...botTricks];
  const trumpCards = allTrickCards.filter(c => c.suit === trumpSuit);

  let playerPts = 0;
  let botPts = 0;
  const parts: string[] = [];

  // High: highest trump in play
  if (trumpCards.length > 0) {
    const highTrump = trumpCards.reduce((a, b) => rankVal(a.rank, true) > rankVal(b.rank, true) ? a : b);
    const playerHasHigh = playerTricks.some(c => c.id === highTrump.id);
    if (playerHasHigh) { playerPts++; parts.push("High→You"); }
    else { botPts++; parts.push("High→Bot"); }

    // Low: lowest trump
    const lowTrump = trumpCards.reduce((a, b) => rankVal(a.rank, true) < rankVal(b.rank, true) ? a : b);
    const playerHasLow = playerTricks.some(c => c.id === lowTrump.id);
    if (playerHasLow) { playerPts++; parts.push("Low→You"); }
    else { botPts++; parts.push("Low→Bot"); }

    // Jack of trumps
    const jackTrump = trumpCards.find(c => c.rank === 11);
    if (jackTrump) {
      const playerHasJack = playerTricks.some(c => c.id === jackTrump.id);
      if (playerHasJack) { playerPts++; parts.push("Jack→You"); }
      else { botPts++; parts.push("Jack→Bot"); }
    }
  }

  // Game: most pip points
  const playerPips = playerTricks.reduce((a, c) => a + pipVal(c.rank), 0);
  const botPips = botTricks.reduce((a, c) => a + pipVal(c.rank), 0);
  if (playerPips > botPips) { playerPts++; parts.push(`Game→You(${playerPips}>`+`${botPips})`); }
  else if (botPips > playerPips) { botPts++; parts.push(`Game→Bot(${botPips}>`+`${playerPips})`); }
  else parts.push("Game→Tie");

  return { playerPts, botPts, desc: parts.join(", ") };
}

export function initialState(seed: number, settings: CaliforniaJackSettings): CaliforniaJackState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);

  const playerHand = deck.slice(0, 6);
  const botHand = deck.slice(6, 12);
  const rest = deck.slice(12);
  const trumpCard = rest[0]!;
  const trumpSuit = trumpCard.suit;
  const stock = rest.slice(1); // Trump card goes to bottom or stays as is; stock is rest

  return {
    settings,
    playerHand,
    botHand,
    stock,
    trumpSuit,
    currentTrick: [null, null],
    trickLead: 0, // player leads first
    playerTricks: [],
    botTricks: [],
    playerScore: 0,
    botScore: 0,
    phase: "playing",
    roundResult: `Trump: ${trumpSuit}`,
    rngSeed: nextSeed,
  };
}

export function reducer(state: CaliforniaJackState, action: CaliforniaJackAction): CaliforniaJackState {
  if (state.phase === "done") return state;

  if (action.type === "play" && state.phase === "playing") {
    const { cardId } = action;

    if (state.currentTrick[0] === null && state.currentTrick[1] === null) {
      // Player leads
      if (state.trickLead !== 0) return state;
      const card = state.playerHand.find(c => c.id === cardId);
      if (!card) return state;
      const newPlayerHand = state.playerHand.filter(c => c.id !== cardId);

      // Bot responds
      const botCard = botChooseCard(state.botHand, state.trumpSuit, card);
      const newBotHand = state.botHand.filter(c => c.id !== botCard.id);

      return {
        ...state,
        playerHand: newPlayerHand,
        botHand: newBotHand,
        currentTrick: [card, botCard],
        phase: "drawing",
      };
    }

    if (state.trickLead === 1 && state.currentTrick[0] === null && state.currentTrick[1] !== null) {
      // Player follows bot's lead
      const card = state.playerHand.find(c => c.id === cardId);
      if (!card) return state;
      const newPlayerHand = state.playerHand.filter(c => c.id !== cardId);
      const botLedCard = state.currentTrick[1] as Card;
      return { ...state, playerHand: newPlayerHand, currentTrick: [card, botLedCard], phase: "drawing" };
    }

    return state;
  }

  if (action.type === "collectTrick" && state.phase === "drawing") {
    const [pCard, bCard] = state.currentTrick;
    if (!pCard || !bCard) return state;

    // Determine winner
    const leadSuit = state.trickLead === 0 ? pCard.suit : bCard.suit;
    const leadCard = state.trickLead === 0 ? pCard : bCard;
    const followCard = state.trickLead === 0 ? bCard : pCard;
    const followWins = cardBeats(followCard, leadCard, state.trumpSuit, leadSuit);
    const playerWins = state.trickLead === 0 ? !followWins : followWins;

    const newPlayerTricks = playerWins ? [...state.playerTricks, pCard, bCard] : state.playerTricks;
    const newBotTricks = !playerWins ? [...state.botTricks, pCard, bCard] : state.botTricks;

    // Draw from stock
    const [pDraw, bDraw, ...newStock] = state.stock;
    const newPlayerHand = pDraw ? [...state.playerHand, pDraw] : state.playerHand;
    const newBotHand = bDraw ? [...state.botHand, bDraw] : state.botHand;

    // Check if hands are empty → score round
    if (newPlayerHand.length === 0 && newBotHand.length === 0) {
      const { playerPts, botPts, desc } = computeRoundScore(newPlayerTricks, newBotTricks, state.trumpSuit);
      const newPS = state.playerScore + playerPts;
      const newBS = state.botScore + botPts;
      const tgt = parseInt(state.settings.target, 10);
      const isDone = newPS >= tgt || newBS >= tgt;
      return {
        ...state,
        playerHand: newPlayerHand,
        botHand: newBotHand,
        stock: newStock,
        currentTrick: [null, null],
        playerTricks: newPlayerTricks,
        botTricks: newBotTricks,
        playerScore: newPS,
        botScore: newBS,
        phase: isDone ? "done" : "scoring",
        trickLead: playerWins ? 0 : 1,
        roundResult: desc,
      };
    }

    // Bot leads if bot won
    let nextState: CaliforniaJackState = {
      ...state,
      playerHand: newPlayerHand,
      botHand: newBotHand,
      stock: newStock,
      currentTrick: [null, null],
      playerTricks: newPlayerTricks,
      botTricks: newBotTricks,
      trickLead: playerWins ? 0 : 1,
      phase: "playing",
    };

    if (!playerWins) {
      // Bot leads
      const botCard = botChooseCard(nextState.botHand, nextState.trumpSuit, null);
      const nextBotHand = nextState.botHand.filter(c => c.id !== botCard.id);
      nextState = {
        ...nextState,
        botHand: nextBotHand,
        currentTrick: [null, botCard],
      };
    }

    return nextState;
  }

  if (action.type === "nextRound" && state.phase === "scoring") {
    // Deal new round
    const rng = mulberry32(state.rngSeed);
    const deck = shuffle(newDeck(), rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const playerHand = deck.slice(0, 6);
    const botHand = deck.slice(6, 12);
    const rest = deck.slice(12);
    const trumpSuit = rest[0]!.suit;
    const stock = rest.slice(1);

    return {
      ...state,
      playerHand,
      botHand,
      stock,
      trumpSuit,
      currentTrick: [null, null],
      trickLead: 0,
      playerTricks: [],
      botTricks: [],
      phase: "playing",
      roundResult: `Trump: ${trumpSuit}`,
      rngSeed: nextSeed,
    };
  }

  return state;
}

export function isTerminal(state: CaliforniaJackState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.playerScore >= parseInt(state.settings.target, 10) ? 100 : 10 };
}
